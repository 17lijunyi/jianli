const { _electron: electron } = require('../../magic-resume/node_modules/playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const packaged = process.argv.includes('--packaged');
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'magic-desktop-fill-'));
let app;
const pause = () => new Promise(resolve => setTimeout(resolve, 100));

async function state() {
  return app.evaluate(({ app, BrowserWindow, Menu, screen }) => {
    const window = BrowserWindow.getAllWindows()[0];
    const native = JSON.parse(process.mainModule.require(app.getAppPath() + '/native/glass.node').inspect(window.getNativeWindowHandle()));
    return {
      fullscreen: window.isFullScreen(), fullscreenable: window.isFullScreenable(),
      maximized: native.filled, native, zoom: window.webContents.getZoomFactor(), bounds: window.getBounds(), content: window.getContentBounds(),
      workArea: screen.getDisplayMatching(window.getBounds()).workArea,
      menu: Menu.getApplicationMenu().getMenuItemById('desktop-fill').label,
    };
  });
}
async function waitForState(check, message) {
  for (let attempt = 0; attempt < 50; attempt++) {
    const current = await state();
    if (check(current)) return current;
    await pause();
  }
  assert.fail(`${message}: ${JSON.stringify(await state())}`);
}
async function toggle() {
  await app.evaluate(({ Menu }) => Menu.getApplicationMenu().getMenuItemById('desktop-fill').click());
}
async function checkLayout(page) {
  let layout, current, aligned = false;
  // Read both sides again while Chromium completes the native window resize.
  for (let attempt = 0; attempt < 50; attempt++) {
    layout = await page.evaluate(() => ({
    viewport: { width: innerWidth, height: innerHeight },
    transparent: [document.documentElement, document.body, document.querySelector('.glass-stage')]
      .every(element => getComputedStyle(element).backgroundColor === 'rgba(0, 0, 0, 0)'),
    overflow: document.documentElement.scrollWidth > innerWidth || document.documentElement.scrollHeight > innerHeight,
    surfaces: [...document.querySelectorAll('[data-glass-surface]')].map(element => element.getBoundingClientRect().toJSON()),
    }));
    current = await state();
    aligned = ['width', 'height'].every(k => Math.abs(layout.viewport[k] * current.zoom - current.content[k]) < 2)
      && current.native.panels.length === layout.surfaces.length && current.native.panels.every((p, i) => {
        const r = layout.surfaces[i];
        return p.attached && p.behindWindow && p.animations === 0 && ['x', 'y', 'width', 'height'].every(k => Math.abs(p[k] - r[k] * current.zoom) < 2);
      });
    if (aligned) break;
    await pause();
  }
  assert.ok(aligned, `Native glass geometry matches the settled renderer layout: ${JSON.stringify({ layout, current })}`);
  assert.equal(layout.transparent, true, 'Desktop remains the background');
  assert.equal(layout.overflow, false, 'No page overflow');
  assert.equal(layout.surfaces.length, 3);
  for (const rect of layout.surfaces) {
    assert.ok(rect.left >= 0 && rect.top >= 0 && rect.right <= layout.viewport.width + 1 && rect.bottom <= layout.viewport.height + 1, 'Glass surfaces stay inside the window');
  }
  assert.equal(current.fullscreen, false, 'No separate native fullscreen Space');
  assert.deepEqual(current.content, current.bounds, 'No opaque titlebar strip');
  assert.equal(current.native.opaque, false, 'Native window remains transparent');
  assert.equal(current.native.backgroundAlpha, 0, 'Native background is clear');
  assert.equal(current.native.rootOpaque, false, 'Native content layer remains transparent');
  assert.equal(current.native.buttonBound, true, 'Green button retains the shared restore handler');
}

(async () => {
  const executablePath = path.resolve(packaged
    ? 'release/简励-darwin-arm64/简励.app/Contents/MacOS/Jianli'
    : 'node_modules/electron/dist/Electron.app/Contents/MacOS/Electron');
  const env = { ...process.env, MAGIC_RESUME_TEST_PROFILE: profile, MAGIC_RESUME_TEST_PORT: '43876' };
  delete env.ELECTRON_RUN_AS_NODE;
  app = await electron.launch({ executablePath, args: packaged ? [] : [process.cwd()], env, timeout: 45000 });
  const page = await app.firstWindow();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.getByRole('heading', { name: '我的简历', exact: true }).waitFor();
  await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].setBounds({ x: 120, y: 90, width: 1100, height: 760 }));
  const original = await state();
  assert.equal(original.fullscreenable, false);

  // Repeated transitions must restore the actual prior size and position.
  for (let round = 0; round < 12; round++) {
    await toggle();
    await waitForState(s => s.maximized && s.menu === '还原窗口' && JSON.stringify(s.bounds) === JSON.stringify(s.workArea), 'Window fills the current desktop work area');
    await checkLayout(page);
    await toggle();
    await waitForState(s => !s.maximized && s.menu === '铺满桌面' && JSON.stringify(s.bounds) === JSON.stringify(original.bounds), 'Window returns to its original bounds');
    await checkLayout(page);
  }
  console.log('PASS: 24 desktop-fill/restore transitions, exact saved bounds, native transparency and glass geometry.');

  // Exercise bursts without waiting for a paint between commands.
  await app.evaluate(({ Menu }) => { for (let i = 0; i < 24; i++) Menu.getApplicationMenu().getMenuItemById('desktop-fill').click(); });
  await waitForState(s => !s.maximized && JSON.stringify(s.bounds) === JSON.stringify(original.bounds), 'Rapid clicks preserve the restore frame');
  await checkLayout(page);

  // Menu content zoom must not desynchronize the native materials from CSS pixels.
  for (const zoom of [1.2, 0.8, 1.44, 1, 1.2, 1]) {
    await app.evaluate(({ BrowserWindow }, factor) => BrowserWindow.getAllWindows()[0].webContents.setZoomFactor(factor), zoom);
    await page.waitForFunction(expected => Math.abs(innerWidth - expected) < 2, original.bounds.width / zoom);
    await checkLayout(page);
  }
  const corner = await app.evaluate(async ({ BrowserWindow }) => {
    const image = await BrowserWindow.getAllWindows()[0].capturePage({ x: 0, y: 0, width: 4, height: 4 });
    return [...image.getBitmap().subarray(0, 4)];
  });
  assert.equal(corner[3], 0, 'Rendered window corner retains alpha, not a white bitmap');
  console.log('PASS: 24 rapid toggles, six content zoom changes, native panel alignment and rendered alpha.');

  await page.locator('.library-empty').getByRole('button', { name: '新建简历', exact: true }).click();
  await page.getByText('空白简历', { exact: true }).first().click();
  await page.locator('#resume-preview').waitFor();
  await page.locator('#edit-panel').getByPlaceholder('请输入姓名', { exact: true }).fill('窗口回归测试');
  await toggle();
  await waitForState(s => s.maximized, 'Editor maximized');
  await checkLayout(page);
  await page.locator('#resume-preview').getByText('窗口回归测试', { exact: true }).waitFor();
  const stored = await page.evaluate(() => localStorage.getItem('resume-storage'));
  await page.reload();
  await page.locator('#resume-preview').getByText('窗口回归测试', { exact: true }).waitFor();
  await checkLayout(page);
  assert.equal(await page.evaluate(() => localStorage.getItem('resume-storage')), stored);
  await toggle();
  await waitForState(s => !s.maximized, 'Editor restored');
  await checkLayout(page);
  assert.deepEqual(errors, []);
  console.log('PASS: editing and reload while maximized, saved resume preserved, no renderer errors.');
  if (process.argv.includes('--keep')) {
    console.log('NATIVE_GREEN_BUTTON_TEST_READY');
    let previous = '';
    for (let i = 0; i < 90; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const current = await state();
      const encoded = JSON.stringify({ bounds: current.bounds, filled: current.maximized, opaque: current.native.opaque, alpha: current.native.backgroundAlpha, bound: current.native.buttonBound });
      if (encoded !== previous) console.log(encoded);
      previous = encoded;
    }
  }
})().catch(error => { console.error(error); process.exitCode = 1; })
  .finally(async () => { if (app) await app.close(); console.log('TEST_PROFILE', profile); });
