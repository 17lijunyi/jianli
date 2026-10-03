const { _electron: electron } = require('../../magic-resume/node_modules/playwright');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const assert = require('node:assert/strict');
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'magic-resume-desktop-test-'));
const executablePath = path.resolve(__dirname, '../release/简励-darwin-arm64/简励.app/Contents/MacOS/Jianli');
const env = {...process.env, MAGIC_RESUME_TEST_PROFILE: profile, MAGIC_RESUME_TEST_PORT: '43872'};
delete env.ELECTRON_RUN_AS_NODE;
let app;
(async () => {
  app = await electron.launch({ executablePath, env, timeout: 45000 });
  const page = await app.firstWindow();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.getByRole('heading', {name:'我的简历', exact:true}).waitFor({timeout:30000});
  assert.equal(await page.evaluate(() => typeof window.showDirectoryPicker), 'function');
  assert.equal(await page.evaluate(() => typeof window.require), 'undefined');
  await page.screenshot({path:path.resolve(__dirname, '../artifacts/dashboard.png')});
  await page.locator('.library-empty').getByRole('button', {name:'新建简历',exact:true}).click();
  await page.getByText('空白简历',{exact:true}).first().click();
  await page.waitForURL(/\/app\/workbench\//, {timeout:20000});
  await page.locator('#resume-preview').waitFor({timeout:30000});
  await page.locator('#edit-panel').getByPlaceholder('请输入姓名', {exact:true}).fill('桌面版测试');
  await page.locator('#edit-panel').getByPlaceholder('请输入职位', {exact:true}).fill('产品经理');
  await page.locator('#resume-preview').getByText('桌面版测试', {exact:true}).waitFor();
  await page.evaluate(() => window.scrollTo(0, 0));
  console.log('EDITOR_URL', page.url());
  await page.screenshot({path:path.resolve(__dirname, '../artifacts/editor.png')});
  const downloadDir = path.resolve(__dirname, '../artifacts');
  await app.evaluate(({ session }, directory) => {
    globalThis.smokeDownloads = [];
    session.defaultSession.on('will-download', (_event, item) => {
      const file = directory + '/' + item.getFilename();
      item.setSavePath(file);
      item.once('done', (_event, state) => globalThis.smokeDownloads.push({file, state}));
    });
  }, downloadDir);
  await page.getByRole('button', {name:'导出', exact:true}).click();
  let jsonExport;
  for (const [label, extension] of [['JSON配置', '.json'], ['PDF', '.pdf']]) {
    await page.getByRole('heading', {name:label, exact:true}).locator('../..').click();
    let result;
    for(let attempt=0; attempt<150; attempt++) {
      result = await app.evaluate((_electron, ext) => globalThis.smokeDownloads.find(item => item.file.endsWith(ext)), extension);
      if(result) break;
      await new Promise(resolve => setTimeout(resolve,200));
    }
    assert.equal(result?.state, 'completed', label + ' export completes');
    const content = fs.readFileSync(result.file);
    if(extension === '.json') assert.equal(JSON.parse(content).basic.name, '桌面版测试');
    else assert.equal(content.subarray(0,5).toString(), '%PDF-');
    if(extension === '.json') jsonExport=result.file;
    console.log('EXPORT_OK', label, content.length);
  }
  await page.keyboard.press('Escape');
  await page.getByRole('button',{name:'切换模板',exact:true}).click();
  await page.locator('.template-sheet[data-state=open]').waitFor();
  await page.screenshot({path:path.resolve(__dirname, '../artifacts/template-sheet.png'), animations:'disabled'});
  await page.keyboard.press('Escape');
  await page.getByRole('button',{name:'返回我的简历',exact:true}).click();
  await page.locator('.resume-gallery-card').waitFor();
  await page.locator('.resume-card-actions').getByRole('button',{name:'复制',exact:true}).click();
  await page.waitForFunction(()=>document.querySelectorAll('.resume-gallery-card').length===2);
  await page.locator('.resume-card-actions').first().getByRole('button',{name:'删除',exact:true}).click();
  await page.getByRole('alertdialog').getByRole('button',{name:'确认',exact:true}).click();
  await page.waitForFunction(()=>document.querySelectorAll('.resume-gallery-card').length===1);
  await page.locator('.glass-statusbar').getByRole('button',{name:'导入简历',exact:true}).click();
  await page.getByRole('dialog').waitFor();
  await page.screenshot({path:path.resolve(__dirname, '../artifacts/import-dialog.png')});
  await page.locator('input[type=file][accept*=json]').setInputFiles(jsonExport);
  await page.locator('#resume-preview').getByText('桌面版测试',{exact:true}).waitFor();
  console.log('ROUND_TRIP_OK: copy, delete, JSON import, template drawer.');
  await page.getByRole('button', {name:'返回我的简历',exact:true}).click();
  await page.locator('button[aria-label="简历模板"]').click();
  await page.getByRole('tab', {name:/简历细节模版/}).click();
  await page.getByRole('tabpanel').getByRole('button', {name:'使用此模板',exact:true}).first().click();
  await page.locator('#resume-preview .detail-v2').waitFor();
  await page.getByPlaceholder('简历名称', {exact:true}).fill('细节模板验收');
  await page.locator('li').filter({hasText:'工作经历'}).click();
  await page.locator('#edit-panel h3').filter({hasText:'麦麦趣耕科技有限公司'}).click();
  await page.getByPlaceholder('请输入公司名称', {exact:true}).fill('原生字段验收公司');
  await page.locator('#resume-preview').getByText('原生字段验收公司', {exact:true}).waitFor();
  await page.locator('button[title="#2E8B57"]').click();
  await page.waitForFunction(() => {
    const name = document.querySelector('#resume-preview .detail-v2-name');
    const section = document.querySelector('#resume-preview .detail-v2-section-title');
    return name && section
      && getComputedStyle(name).color === 'rgb(32, 32, 32)'
      && getComputedStyle(section).color === 'rgb(46, 139, 87)';
  });
  const detailed = await page.evaluate(() => {
    const state = JSON.parse(localStorage.getItem('resume-storage')).state;
    return state.resumes[location.pathname.split('/').pop()];
  });
  assert.equal(detailed.detailLayout.version, 2);
  assert.equal(detailed.experience[0].company, '原生字段验收公司');
  assert.ok(!detailed.menuSections.some(section => section.id.startsWith('custom-detail-page-')));
  await page.getByRole('button', {name:'导出', exact:true}).click();
  await page.getByRole('heading', {name:'PDF', exact:true}).locator('../..').click();
  let detailPdf;
  for (let attempt=0; attempt<150; attempt++) {
    detailPdf = await app.evaluate(() => globalThis.smokeDownloads.find(item => item.file.endsWith('细节模板验收.pdf')));
    if (detailPdf) break;
    await new Promise(resolve => setTimeout(resolve,200));
  }
  assert.equal(detailPdf?.state, 'completed', 'Detailed native template PDF export completes');
  assert.equal(fs.readFileSync(detailPdf.file).subarray(0,5).toString(), '%PDF-');
  console.log('DETAIL_NATIVE_OK', detailPdf.file);
  // An existing provider gains the new catalog option without losing its
  // credentials, compatible endpoint, or previous task selections.
  await page.evaluate(() => {
    const oldId = 'builtin:openai:gpt-5.6-sol';
    localStorage.setItem('ai-config-storage', JSON.stringify({version:1,state:{
      models:[{id:oldId,provider:'openai',name:'GPT-5.6 Sol',apiKey:'local-test-key',model:'gpt-5.6-sol',baseUrl:'https://models-test.invalid/v1',protocol:'responses',supportsPdf:true}],
      textModelId:oldId,pdfModelId:oldId,
    }}));
  });
  await page.goto(new URL('/app/dashboard/ai', page.url()).href);
  await page.getByRole('heading', {name:'GPT-6.1 Sol',exact:true}).waitFor();
  const upgradedAI = await page.evaluate(() => JSON.parse(localStorage.getItem('ai-config-storage')).state);
  assert.equal(upgradedAI.textModelId, 'builtin:openai:gpt-5.6-sol');
  assert.equal(upgradedAI.pdfModelId, 'builtin:openai:gpt-5.6-sol');
  const sol61 = upgradedAI.models.find(model => model.model === 'gpt-6.1-sol');
  assert.equal(sol61.apiKey, 'local-test-key');
  assert.equal(sol61.baseUrl, 'https://models-test.invalid/v1');
  assert.equal(sol61.protocol, 'responses');
  for (const label of ['选择文字助手模型', '选择 PDF 解析模型']) {
    await page.getByRole('combobox', {name:label}).click();
    await page.getByRole('option', {name:'GPT-6.1 Sol',exact:true}).click();
  }
  console.log('MODEL_CATALOG_OK: GPT-6.1 Sol added, existing settings preserved, both task selectors work.');
  const stored = await page.evaluate(() => localStorage.getItem('resume-storage'));
  assert.ok(stored && Object.keys(JSON.parse(stored).state.resumes).length > 0, 'New resume persisted');
  const resumeID = Object.values(JSON.parse(stored).state.resumes)[0].id;
  await app.close(); app = null;
  await new Promise(resolve => setTimeout(resolve, 500));
  await assert.rejects(fetch('http://127.0.0.1:43872'), 'Server exits with the app');
  app = await electron.launch({ executablePath, env, timeout:45000 });
  const second = await app.firstWindow();
  await second.getByRole('heading', {name:'我的简历',exact:true}).waitFor({timeout:30000});
  const restored = await second.evaluate(() => localStorage.getItem('resume-storage'));
  assert.ok(Object.values(JSON.parse(restored).state.resumes).some(resume => resume.id === resumeID), 'Resume survives app restart');
  assert.equal(JSON.parse(restored).state.resumes[resumeID].basic.name, '桌面版测试');
  const restoredAI = await second.evaluate(() => JSON.parse(localStorage.getItem('ai-config-storage')).state);
  assert.equal(restoredAI.textModelId, 'builtin:openai:gpt-6.1-sol');
  assert.equal(restoredAI.pdfModelId, 'builtin:openai:gpt-6.1-sol');
  console.log('PAGE_ERRORS', JSON.stringify(errors));
  assert.equal(errors.length, 0);
  console.log('PASS: packaged launch, isolated renderer, directory picker API, resume editing, JSON/PDF export, persistent storage, quit cleanup, relaunch.');
})().catch(error => { console.error(error); process.exitCode=1; }).finally(async () => { if(app) await app.close(); console.log('TEST_PROFILE', profile); });
