# 简励 Mac 桌面版

基于 [JOYCEQL/magic-resume](https://github.com/JOYCEQL/magic-resume) 2.0.9 的本地 Electron 封装，适用于 Apple Silicon Mac。

## 使用

双击“应用程序”里的“简励”即可打开，不需要启动终端或网页服务。Command-Q 退出应用及其本地服务。关闭窗口后可以点程序坞图标重新打开。

绿色窗口按钮在当前桌面最大化，再次点击还原。也可以用“显示 → 铺满桌面 / 还原窗口”或 Control-Command-F。保留系统菜单栏和程序坞，不进入独立的全屏空间，以维持真实窗后透光，避免透明间隙变黑及系统标题栏突然出现。

绿色按钮与菜单共用原生还原尺寸记录，直接切换窗口边界，取消系统缩放动画。窗口变化时原生玻璃面板立即跟随布局，再与网页的最新测量结果同步；网页放大、缩小时按缩放比例更新材质位置，并持续保持窗口背景透明。

简历和设置保存在 `~/Library/Application Support/Magic Resume Desktop`，与普通浏览器的数据独立。可以在应用设置中选择简历备份文件夹；已有网页版简历可用 JSON 导出、导入迁移。AI 功能仍需自行配置模型和 API Key。

应用自带 Chromium、Node.js、网页资源和服务端程序，不依赖源码目录或系统 Node.js。仅在本机 `127.0.0.1:43871` 提供服务；固定端口用于保持简历存储来源稳定。若端口被其他程序占用，应用会提示启动错误而不会连接陌生服务。

## 构建

图标与名称：用户选择「简励」与 JL 字母方案。生产图和生成提示词见 `branding/BRANDING.md`；需要重新转换图标时运行 `node build-icon.cjs`。

1. 在相邻的 `magic-resume` 目录执行 `pnpm build`。
2. 在本目录执行 `npm ci --cache .npm-cache`。
3. 执行 `node build-native.cjs` 编译原生玻璃组件。需要 Xcode Command Line Tools 和 Node.js C 头文件；默认从当前 Node 安装目录的 `include/node` 读取，可用 `NODE_INCLUDE_DIR` 指定。
4. 执行 `node build-runtime.cjs` 和 `npm run package`。
5. 输出位于 `release/简励-darwin-arm64/简励.app`。
6. 本地安装前可执行 `codesign --force --deep --sign - "release/简励-darwin-arm64/简励.app"`。

`node tests/smoke.cjs` 使用独立临时用户数据目录和端口，验证打包启动、编辑、复制、删除、模板抽屉、JSON 导入和导出、PDF 导出、重启持久化及退出清理。

`node tests/glass-preview.cjs` 检查各页面的浅深外观、最小窗口、搜索和 A4 纸张尺寸，截图保存在 `artifacts`。加 `--keep` 保留开发预览；`--backdrop-test` 仅在测试进程创建独立的窗后色块窗口，用于材质校准，产品本身不包含该背景。

`node tests/desktop-fill.cjs --packaged` 使用独立临时数据检查打包版的 24 次铺满/还原、24 次快速切换、6 次页面缩放、位置和大小恢复、原生窗口透明度、玻璃面板对齐、透明像素，以及最大化时的编辑和重新加载。省略 `--packaged` 检查开发版；加 `--keep` 留出原生绿色按钮交互的验证时间。

## 玻璃界面

简历库、模板、AI 配置、设置、编辑器和浮层采用统一的中性玻璃界面。全局导航与底部操作条独立悬浮，界面跟随系统浅深外观。简历纸张维持白色 A4 排版，缩放只作用于预览展示层。

`native/glass.mm` 使用 AppKit 公开的 `NSVisualEffectView` 和 `behindWindow` 混合模式，按主面板、导航与操作条的轮廓分别取窗后材质。外围间隙保持透明；没有壁纸文件、桌面截图或屏幕录制依赖。CSS 负责前景控件，原生层负责桌面材料。系统“减少透明度”或窗口非激活时，材质依系统规则变化。普通浏览器预览仅显示网页内毛玻璃，不具备桌面透光能力。

此封装采用本地临时签名，未经 Apple Developer ID 公证。原项目许可见 `LICENSE.upstream`；字体许可位于前端 `public/fonts/licenses/`，发布包包含这些说明。
