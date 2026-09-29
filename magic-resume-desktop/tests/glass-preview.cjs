const { _electron: electron } = require('../../magic-resume/node_modules/playwright');
const path=require('node:path'), fs=require('node:fs'), os=require('node:os'), assert=require('node:assert/strict');
const profile=fs.mkdtempSync(path.join(os.tmpdir(),'magic-glass-'));
let app;
process.on('SIGINT',async()=>{if(app)await app.close();process.exit(0);});
(async()=>{
 app=await electron.launch({executablePath:path.resolve('node_modules/electron/dist/Electron.app/Contents/MacOS/Electron'),args:[process.cwd()],env:{...process.env,MAGIC_RESUME_TEST_PROFILE:profile,MAGIC_RESUME_TEST_PORT:'43873'},timeout:45000});
 const page=await app.firstWindow();page.setDefaultTimeout(20000);const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 const theme=async mode=>{await app.evaluate(({nativeTheme},m)=>{nativeTheme.themeSource=m;},mode);await page.emulateMedia({colorScheme:mode});await page.waitForFunction(m=>document.documentElement.classList.contains(m),mode);};
 const shot=async name=>page.screenshot({path:`artifacts/glass-${name}.png`,animations:'disabled'});
 await page.locator('.library-heading h1').waitFor();
 await theme('dark');await shot('empty-dark');
 await page.locator('.library-empty').getByRole('button',{name:'新建简历',exact:true}).click();
 await page.getByText('空白简历',{exact:true}).first().click();
 await page.locator('#resume-preview').waitFor();
 await page.locator('#edit-panel').getByPlaceholder('请输入姓名',{exact:true}).fill('示例简历');
 await page.locator('#edit-panel').getByPlaceholder('请输入职位',{exact:true}).fill('产品设计师');
 await page.locator('#resume-preview').getByText('示例简历',{exact:true}).waitFor();
 await shot('editor-dark');await theme('light');await shot('editor-light');
 const paper=await page.locator('.resume-paper').evaluate(e=>({width:getComputedStyle(e).width,background:getComputedStyle(e).backgroundColor,rect:e.getBoundingClientRect().toJSON(),parent:e.closest('#preview-panel').getBoundingClientRect().toJSON()}));
 assert.equal(paper.background,'rgb(255, 255, 255)');
 assert.ok(Math.abs(parseFloat(paper.width)-793.7)<1,'A4 export width preserved');
 assert.ok(paper.rect.x>=paper.parent.x && paper.rect.right<=paper.parent.right,'Preview fits panel');
 console.log('PAPER_OK',JSON.stringify(paper));
 for(const route of ['resumes','templates','ai','settings']){
  await page.goto(`http://127.0.0.1:43873/app/dashboard/${route}`);
  await page.locator('.glass-page').getByRole('heading').first().waitFor();
  await theme('light');await shot(`${route}-light`);
  await theme('dark');await shot(`${route}-dark`);
  console.log('PAGE_OK',route,(await page.locator('.glass-page').innerText()).slice(0,280));
  assert.equal(await page.locator('[data-glass-surface]').count(),3);
 }
 await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].setSize(1000,700));
 await page.goto('http://127.0.0.1:43873/app/dashboard/resumes');
 await page.locator('.resume-gallery-card').waitFor();await shot('compact-dark');
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth || document.documentElement.scrollHeight>innerHeight),false,'Minimum window fits');
 await page.getByPlaceholder('搜索简历').fill('不存在的简历');
 await page.getByText('没有找到匹配的简历').waitFor();
 await page.getByPlaceholder('搜索简历').fill('');
 await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].setSize(1440,960));
 assert.equal(errors.length,0,JSON.stringify(errors));
 console.log('PASS: all pages, two appearances, A4 paper, minimum window, search.');
 if(process.argv.includes('--backdrop-test')) {
  await app.evaluate(async ({BrowserWindow})=>{
   const main=BrowserWindow.getAllWindows()[0];
   const bounds=main.getBounds();
   globalThis.materialTestWindow=new BrowserWindow({...bounds,frame:false,show:false,title:'材质测试后景',backgroundColor:'#245e87'});
   await globalThis.materialTestWindow.loadURL('data:text/html,<html style="background:linear-gradient(90deg,%23a53834 50%,%23245e87 50%);height:100%"></html>');
   globalThis.materialTestWindow.show();main.show();main.focus();
  });
 }
 if(process.argv.includes('--keep')){console.log('PREVIEW_READY');await new Promise(()=>{});}
 await app.close();app=null;
})().catch(async e=>{console.error(e);if(app)await app.close();process.exitCode=1;});
