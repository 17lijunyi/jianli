#import <AppKit/AppKit.h>
#import <QuartzCore/QuartzCore.h>
#import <objc/runtime.h>
#include <node_api.h>
#include <cmath>
#include <cstring>
#include <initializer_list>

@interface MRGlassView : NSVisualEffectView
@end
@implementation MRGlassView
- (NSView *)hitTest:(NSPoint)point { return nil; }
@end

// The green button and menu share explicit restore geometry, without NSWindow zoom animation.
@interface MRGlassController : NSObject
@property(nonatomic, weak) NSWindow *window;
@property(nonatomic, weak) NSView *root;
@property(nonatomic, strong) NSMutableArray<MRGlassView *> *panels;
@property(nonatomic, strong) NSArray<NSDictionary *> *rects;
@property(nonatomic) NSSize viewport;
@property(nonatomic) NSRect restoreFrame;
@property(nonatomic) BOOL hasRestoreFrame;
@property(nonatomic, weak) id originalButtonTarget;
@property(nonatomic) SEL originalButtonAction;
- (instancetype)initWithWindow:(NSWindow *)window;
- (void)refresh;
- (void)toggleDesktopFill:(id)sender;
- (BOOL)isFilled;
- (void)disconnect;
@end

static BOOL closeRect(NSRect a, NSRect b) {
  return std::abs(a.origin.x-b.origin.x)<1 && std::abs(a.origin.y-b.origin.y)<1 &&
    std::abs(a.size.width-b.size.width)<1 && std::abs(a.size.height-b.size.height)<1;
}
@implementation MRGlassController
- (instancetype)initWithWindow:(NSWindow *)window {
  if ((self = [super init])) {
    _window=window; _root=window.contentView;
    _panels=[NSMutableArray array]; _rects=@[];
    _restoreFrame=window.frame; _hasRestoreFrame=YES;
    NSButton *button=[window standardWindowButton:NSWindowZoomButton];
    _originalButtonTarget=button.target; _originalButtonAction=button.action;
    button.target=self; button.action=@selector(toggleDesktopFill:);
    NSNotificationCenter *center=NSNotificationCenter.defaultCenter;
    for (NSString *name in @[NSWindowDidResizeNotification, NSWindowDidMoveNotification,
        NSWindowDidChangeBackingPropertiesNotification, NSWindowDidChangeScreenNotification,
        NSWindowDidBecomeKeyNotification, NSWindowDidDeminiaturizeNotification]) {
      [center addObserver:self selector:@selector(windowChanged:) name:name object:window];
    }
    _root.postsFrameChangedNotifications=YES;
    [center addObserver:self selector:@selector(windowChanged:) name:NSViewFrameDidChangeNotification object:_root];
    [self refresh];
  }
  return self;
}
- (void)windowChanged:(NSNotification *)notification { [self refresh]; }
- (BOOL)isFilled { return self.window.screen && closeRect(self.window.frame,self.window.screen.visibleFrame); }
- (void)toggleDesktopFill:(id)sender {
  NSWindow *window=self.window;
  if (!window || !window.screen) return;
  NSRect visible=window.screen.visibleFrame, target;
  if ([self isFilled]) {
    target=self.restoreFrame;
    if (!self.hasRestoreFrame || closeRect(target,visible)) {
      target=NSMakeRect(NSMinX(visible)+80,NSMinY(visible)+60,
        MIN(1440,NSWidth(visible)-160),MIN(960,NSHeight(visible)-120));
    }
    // Keep the restored window reachable if the previous display was removed.
    target.size.width=MIN(target.size.width,visible.size.width);
    target.size.height=MIN(target.size.height,visible.size.height);
    target.origin.x=MAX(NSMinX(visible),MIN(target.origin.x,NSMaxX(visible)-NSWidth(target)));
    target.origin.y=MAX(NSMinY(visible),MIN(target.origin.y,NSMaxY(visible)-NSHeight(target)));
  } else {
    self.restoreFrame=window.frame; self.hasRestoreFrame=YES; target=visible;
  }
  [NSAnimationContext beginGrouping];
  NSAnimationContext.currentContext.duration=0;
  NSAnimationContext.currentContext.allowsImplicitAnimation=NO;
  [window setFrame:target display:YES animate:NO];
  [self refresh];
  [NSAnimationContext endGrouping];
}
- (void)refresh {
  NSWindow *window=self.window;
  NSView *root=window.contentView;
  if (!window || !root) return;
  window.opaque=NO;
  window.backgroundColor=NSColor.clearColor;
  window.titlebarAppearsTransparent=YES;
  root.layer.opaque=NO;
  root.layer.backgroundColor=NSColor.clearColor.CGColor;
  NSButton *button=[window standardWindowButton:NSWindowZoomButton];
  button.target=self; button.action=@selector(toggleDesktopFill:);
  [CATransaction begin];
  [CATransaction setDisableActions:YES];
  while (self.panels.count>self.rects.count) {
    [self.panels.lastObject removeFromSuperview]; [self.panels removeLastObject];
  }
  while (self.panels.count<self.rects.count) {
    MRGlassView *effect=[[MRGlassView alloc] initWithFrame:NSZeroRect];
    effect.material=NSVisualEffectMaterialUnderWindowBackground;
    effect.blendingMode=NSVisualEffectBlendingModeBehindWindow;
    effect.state=NSVisualEffectStateFollowsWindowActiveState;
    effect.wantsLayer=YES; effect.layer.masksToBounds=YES;
    effect.layer.cornerCurve=kCACornerCurveContinuous;
    [self.panels addObject:effect];
  }
  CGFloat width=root.bounds.size.width,height=root.bounds.size.height;
  [self.rects enumerateObjectsUsingBlock:^(NSDictionary *r,NSUInteger i,BOOL *stop) {
    CGFloat x=[r[@"x"] doubleValue],y=[r[@"y"] doubleValue];
    CGFloat w=[r[@"width"] doubleValue],h=[r[@"height"] doubleValue];
    CGFloat dx=width-self.viewport.width,dy=height-self.viewport.height;
    // Anchor native surfaces synchronously while the renderer catches up to live resize.
    NSString *kind=r[@"kind"];
    if ([kind isEqualToString:@"workspace"]) {w+=dx;h+=dy;}
    else if ([kind isEqualToString:@"rail"]) {y+=dy/2;}
    else if ([kind isEqualToString:@"footer"]) {x+=dx/2;y+=dy;}
    MRGlassView *effect=self.panels[i];
    if (effect.superview!=root) {
      [effect removeFromSuperview]; [root addSubview:effect positioned:NSWindowBelow relativeTo:nil];
    }
    effect.frame=NSMakeRect(x,root.isFlipped?y:height-y-h,MAX(0,w),MAX(0,h));
    effect.layer.cornerRadius=MAX(0,[r[@"radius"] doubleValue]);
    effect.hidden=(w<1||h<1);
    [effect setNeedsDisplay:YES];
  }];
  [CATransaction commit];
  [root setNeedsDisplay:YES];
  [window invalidateShadow];
}
- (void)disconnect {
  [NSNotificationCenter.defaultCenter removeObserver:self];
  NSButton *button=[self.window standardWindowButton:NSWindowZoomButton];
  if (button.target==self) {button.target=self.originalButtonTarget;button.action=self.originalButtonAction;}
  for (NSView *panel in self.panels) [panel removeFromSuperview];
  [self.panels removeAllObjects];
}
- (void)dealloc { [NSNotificationCenter.defaultCenter removeObserver:self]; }
@end

static char kController;
static NSWindow *windowArg(napi_env env,napi_value value) {
  void *bytes=nullptr;size_t length=0;bool buffer=false;
  if (napi_is_buffer(env,value,&buffer)!=napi_ok||!buffer||
      napi_get_buffer_info(env,value,&bytes,&length)!=napi_ok||length!=sizeof(void*)) return nil;
  NSView *native=(__bridge NSView *)*(void**)bytes;
  return native.window;
}
static MRGlassController *controller(NSWindow *window) {
  if (!window) return nil;
  MRGlassController *value=objc_getAssociatedObject(window,&kController);
  if (!value) {
    value=[[MRGlassController alloc] initWithWindow:window];
    objc_setAssociatedObject(window,&kController,value,OBJC_ASSOCIATION_RETAIN_NONATOMIC);
  }
  return value;
}
static double number(napi_env env,napi_value value,const char *key) {
  napi_value property;double result=0;
  if (napi_get_named_property(env,value,key,&property)==napi_ok) napi_get_value_double(env,property,&result);
  return std::isfinite(result)?result:0;
}
static napi_value invoke(napi_env env,napi_callback_info info) {
  size_t argc=3;napi_value args[3];void *data;
  napi_get_cb_info(env,info,&argc,args,nullptr,&data);
  NSWindow *window=argc?windowArg(env,args[0]):nil;
  if (!window) {napi_throw_type_error(env,nullptr,"Expected a live native window handle");return nullptr;}
  const char *method=(const char*)data;
  MRGlassController *host=controller(window);
  if (!strcmp(method,"update")&&argc==3) {
    bool array=false;napi_is_array(env,args[1],&array);
    if (!array) {napi_throw_type_error(env,nullptr,"Expected panel rectangles");return nullptr;}
    uint32_t count=0;napi_get_array_length(env,args[1],&count);count=MIN(count,8);
    NSMutableArray *rects=[NSMutableArray array];
    for (uint32_t i=0;i<count;i++) {
      napi_value value,kind;napi_get_element(env,args[1],i,&value);
      char name[32]={0};size_t length;
      if (napi_get_named_property(env,value,"kind",&kind)==napi_ok) napi_get_value_string_utf8(env,kind,name,sizeof(name),&length);
      [rects addObject:@{@"x":@(number(env,value,"x")),@"y":@(number(env,value,"y")),
        @"width":@(number(env,value,"width")),@"height":@(number(env,value,"height")),
        @"radius":@(number(env,value,"radius")),@"kind":@(name)}];
    }
    host.rects=rects;
    host.viewport=NSMakeSize(number(env,args[2],"width"),number(env,args[2],"height"));
    [host refresh];
  } else if (!strcmp(method,"toggleDesktopFill")) [host toggleDesktopFill:nil];
  else if (!strcmp(method,"refresh")||!strcmp(method,"attach")) [host refresh];
  else if (!strcmp(method,"detach")) {
    [host disconnect];objc_setAssociatedObject(window,&kController,nil,OBJC_ASSOCIATION_RETAIN_NONATOMIC);
  } else if (!strcmp(method,"inspect")) {
    NSMutableArray *panels=[NSMutableArray array];
    for (MRGlassView *panel in host.panels) {
      NSRect rect=panel.frame;
      [panels addObject:@{@"x":@(rect.origin.x),@"y":@(window.contentView.isFlipped?rect.origin.y:window.contentView.bounds.size.height-NSMaxY(rect)),
        @"width":@(rect.size.width),@"height":@(rect.size.height),@"attached":@(panel.superview==window.contentView),
        @"behindWindow":@(panel.blendingMode==NSVisualEffectBlendingModeBehindWindow),@"animations":@(panel.layer.animationKeys.count)}];
    }
    NSDictionary *snapshot=@{@"filled":@([host isFilled]),@"opaque":@(window.opaque),
      @"backgroundAlpha":@(window.backgroundColor.alphaComponent),@"rootOpaque":@(window.contentView.layer.opaque),
      @"buttonBound":@([window standardWindowButton:NSWindowZoomButton].target==host),@"panels":panels};
    NSData *json=[NSJSONSerialization dataWithJSONObject:snapshot options:0 error:nil];
    napi_value result;napi_create_string_utf8(env,(const char*)json.bytes,json.length,&result);return result;
  }
  napi_value result;napi_get_boolean(env,[host isFilled],&result);return result;
}
static napi_value init(napi_env env,napi_value exports) {
  for (const char *name:{"attach","update","refresh","detach","toggleDesktopFill","isFilled","inspect"}) {
    napi_value function;napi_create_function(env,name,NAPI_AUTO_LENGTH,invoke,(void*)name,&function);
    napi_set_named_property(env,exports,name,function);
  }
  return exports;
}
NAPI_MODULE(NODE_GYP_MODULE_NAME,init)
