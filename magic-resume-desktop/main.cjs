const { app, BrowserWindow, Menu, dialog, shell, utilityProcess, session, ipcMain, nativeTheme } = require('electron');
const path = require('node:path');
const fs = require('node:fs');

app.setName('简励');
app.setPath('userData', process.env.MAGIC_RESUME_TEST_PROFILE || path.join(app.getPath('appData'), 'Magic Resume Desktop'));
const port = Number(process.env.MAGIC_RESUME_TEST_PORT || 43871);
const origin = `http://127.0.0.1:${port}`;
const glass = require('./native/glass.node');
nativeTheme.themeSource = 'system';
let window, server, quitting = false, serverReady = false;
const local = url => { try { return new URL(url).origin === origin; } catch { return false; } };
const external = url => { try { if (['https:', 'http:'].includes(new URL(url).protocol)) shell.openExternal(url).catch(console.error); } catch {} };

// A native fullscreen Space has no desktop behind its transparent regions.
// Keep glass windows on the current desktop, with an explicit restore rectangle.
function updateDesktopFillMenu() {
  const item = Menu.getApplicationMenu()?.getMenuItemById('desktop-fill');
  if (item) {
    item.enabled = !!window;
    item.label = window && glass.isFilled(window.getNativeWindowHandle()) ? '还原窗口' : '铺满桌面';
  }
}
function toggleDesktopFill() {
  if (!window) return;
  if (window.isMinimized()) window.restore();
  glass.toggleDesktopFill(window.getNativeWindowHandle());
  refreshGlass();
  updateDesktopFillMenu();
}

let glassRefreshScheduled = false;
function refreshGlass() {
  if (glassRefreshScheduled) return;
  glassRefreshScheduled = true;
  setImmediate(() => {
    glassRefreshScheduled = false;
    if (!window || window.isDestroyed()) return;
    window.setBackgroundColor('#00000000');
    glass.refresh(window.getNativeWindowHandle());
    window.invalidateShadow();
    window.webContents.invalidate();
    window.webContents.send('glass:refresh');
    updateDesktopFillMenu();
  });
}

function createWindow() {
  window = new BrowserWindow({
    width: 1440, height: 960, minWidth: 1000, minHeight: 700,
    transparent: true, fullscreenable: false, zoomToPageWidth: false,
    titleBarStyle: 'hidden', trafficLightPosition: { x: 119, y: 44 }, hasShadow: false,
    title: '简励', backgroundColor: '#00000000', show: false,
    webPreferences: { preload: path.join(__dirname, 'preload.cjs'), nodeIntegration: false, contextIsolation: true, sandbox: true, spellcheck: false }
  });
  glass.attach(window.getNativeWindowHandle());
  window.once('ready-to-show', () => { refreshGlass(); window.show(); });
  window.webContents.on('page-title-updated', event => { event.preventDefault(); window.setTitle('简励'); });
  window.webContents.setWindowOpenHandler(({ url }) => { external(url); return { action: 'deny' }; });
  window.webContents.on('will-navigate', (event, url) => { if (!local(url)) { event.preventDefault(); external(url); } });
  window.webContents.on('will-redirect', (event, url) => { if (!local(url)) event.preventDefault(); });
  window.on('maximize', updateDesktopFillMenu);
  window.on('unmaximize', updateDesktopFillMenu);
  for (const event of ['resize', 'resized', 'move', 'restore', 'show', 'focus']) window.on(event, refreshGlass);
  window.webContents.on('zoom-changed', refreshGlass);
  window.webContents.on('did-finish-load', refreshGlass);
  window.on('close', () => glass.detach(window.getNativeWindowHandle()));
  window.on('closed', () => { window = null; updateDesktopFillMenu(); });
  updateDesktopFillMenu();
  window.loadURL(`${origin}/app/dashboard/resumes`).catch(error => {
    // Route changes/reloads can cancel an in-flight initial navigation normally.
    if (quitting || !window || window.isDestroyed() || error.code === 'ERR_ABORTED' || error.errno === -3) return;
    dialog.showErrorBox('页面加载失败', String(error));
  });
}

async function startServer() {
  const runtime = path.join(__dirname, 'runtime');
  const logPath = path.join(app.getPath('userData'), 'server.log');
  fs.mkdirSync(app.getPath('userData'), { recursive: true });
  if (fs.existsSync(logPath) && fs.statSync(logPath).size > 2_000_000) fs.truncateSync(logPath);
  const log = fs.createWriteStream(logPath, { flags: 'a' });
  server = utilityProcess.fork(path.join(runtime, 'server.mjs'), [], {
    cwd: runtime, env: { ...process.env, NODE_ENV: 'production', HOSTNAME: '127.0.0.1', PORT: String(port) },
    stdio: 'pipe', serviceName: '简励本地服务'
  });
  server.stdout.pipe(log, { end: false });
  server.stderr.pipe(log, { end: false });
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => { server.kill(); reject(new Error('本地服务启动超时，请重新打开应用。')); }, 30000);
    server.on('message', message => {
      if (message?.type === 'ready') { clearTimeout(timeout); serverReady = true; resolve(); }
    });
    server.on('exit', code => {
      clearTimeout(timeout);
      log.end();
      if (!serverReady) reject(new Error(`本地服务未能启动（${code}）。端口 ${port} 可能已被占用。日志：${logPath}`));
      else if (!quitting) { dialog.showErrorBox('本地服务已停止', '请退出后重新打开简励。已保存的简历会保留。'); app.quit(); }
    });
  });
}

if (!app.requestSingleInstanceLock()) app.quit();
else {
  app.on('second-instance', () => { if (window) { if (window.isMinimized()) window.restore(); window.show(); window.focus(); } else if (serverReady) createWindow(); });
  app.on('before-quit', () => { quitting = true; if (server) server.kill(); });
  app.on('window-all-closed', () => { /* macOS: keep running until Command-Q. */ });
  app.on('activate', () => { if (!window && serverReady) createWindow(); });
  ipcMain.on('glass:layout', (event, layout) => {
    if (!window || event.sender !== window.webContents || !local(event.senderFrame?.url) || !Array.isArray(layout?.rects)) return;
    const { rects, viewport } = layout;
    if (!viewport || !['width', 'height'].every(k => Number.isFinite(viewport[k]) && viewport[k] > 0 && viewport[k] <= 20000)) return;
    const zoom = window.webContents.getZoomFactor();
    const physicalViewport = { width: viewport.width * zoom, height: viewport.height * zoom };
    const bounds = window.getContentBounds();
    // Drop an IPC frame measured before a newer native resize or page zoom.
    if (Math.abs(physicalViewport.width - bounds.width) > zoom * 2 || Math.abs(physicalViewport.height - bounds.height) > zoom * 2) return;
    const keys = ['x', 'y', 'width', 'height', 'radius'];
    const valid = rects.slice(0,8).filter(r => keys.every(k => Number.isFinite(r[k])) && r.width >= 0 && r.height >= 0 && r.width <= 20000 && r.height <= 20000)
      .map(r => ({ ...Object.fromEntries(keys.map(k => [k, r[k] * zoom])), kind: ['workspace','rail','footer'].includes(r.kind) ? r.kind : '' }));
    glass.update(window.getNativeWindowHandle(), valid, physicalViewport);
    window.invalidateShadow();
  });
  nativeTheme.on('updated', refreshGlass);
  app.whenReady().then(async () => {
    app.setAboutPanelOptions({ applicationName: '简励', applicationVersion: '2.0.9', copyright: 'Magic Resume by JOYCEQL · 本地桌面封装' });
    Menu.setApplicationMenu(Menu.buildFromTemplate([
      { label: '简励', submenu: [{ role: 'about', label: '关于简励' }, { type: 'separator' }, { role: 'hide', label: '隐藏简励' }, { role: 'hideOthers', label: '隐藏其他' }, { role: 'unhide', label: '显示全部' }, { type: 'separator' }, { role: 'quit', label: '退出简励' }] },
      { label: '编辑', submenu: [{ role: 'undo', label: '撤销' }, { role: 'redo', label: '重做' }, { type: 'separator' }, { role: 'cut', label: '剪切' }, { role: 'copy', label: '复制' }, { role: 'paste', label: '粘贴' }, { role: 'selectAll', label: '全选' }] },
      { label: '显示', submenu: [{ label: '我的简历', accelerator: 'CmdOrCtrl+1', click: () => window?.loadURL(`${origin}/app/dashboard/resumes`) }, { role: 'reload', label: '刷新' }, { type: 'separator' }, { role: 'resetZoom', label: '实际大小' }, { role: 'zoomIn', label: '放大' }, { role: 'zoomOut', label: '缩小' }, { id: 'desktop-fill', label: '铺满桌面', accelerator: 'Control+Command+F', click: toggleDesktopFill }] },
      { role: 'windowMenu', label: '窗口', submenu: [{ role: 'minimize', label: '最小化' }, { label: '铺满 / 还原窗口', click: toggleDesktopFill }, { type: 'separator' }, { role: 'front', label: '前置所有窗口' }] }
    ]));
    const allowed = new Set(['clipboard-sanitized-write', 'fileSystem', 'fullscreen']);
    session.defaultSession.setPermissionCheckHandler((wc, permission, requestingOrigin) => local(requestingOrigin) && allowed.has(permission));
    session.defaultSession.setPermissionRequestHandler((wc, permission, callback, details) => callback(local(details.requestingUrl || wc?.getURL()) && allowed.has(permission)));
    session.defaultSession.on('will-download', (_event, item) => {
      item.setSaveDialogOptions({ title: '保存简历', defaultPath: path.join(app.getPath('downloads'), path.basename(item.getFilename())) });
    });
    try { await startServer(); createWindow(); }
    catch (error) { dialog.showErrorBox('简励启动失败', error.message); app.quit(); }
  });
}
