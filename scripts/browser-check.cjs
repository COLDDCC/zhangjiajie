const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const http=require('node:http');
const path=require('node:path');
(async()=>{
 const root=path.resolve('dist');
 const server=http.createServer((req,res)=>{
  const file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}
  const types={'.html':'text/html','.css':'text/css','.js':'text/javascript','.jpg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml'};
  res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');fs.createReadStream(file).pipe(res);
 });
 await new Promise(resolve=>server.listen(8765,'127.0.0.1',resolve));
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,headless:true,args:['--no-sandbox']});
 const pages=fs.readdirSync('dist').filter(x=>x.endsWith('.html'));
 let combinations=0;
 for(const width of [390,768,1024]){
  const page=await browser.newPage({viewport:{width,height:900}});
  for(const file of pages){
   await page.goto('http://127.0.0.1:8765/'+file);await page.locator('img').evaluateAll(imgs=>Promise.all(imgs.map(i=>{i.loading='eager';return i.decode();})));
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${file} overflow at ${width}`);
   assert(await page.locator('img').evaluateAll(imgs=>imgs.every(i=>i.complete&&i.naturalWidth)),`${file} broken images`);
  }
  await page.close();
 }
 for(const file of ['index.html','zhangjiajie-itinerary.html']){
  const page=await browser.newPage({viewport:{width:390,height:900}});
  for(const days of [2,3,4])for(const extra of ['tianmen','canyon'])for(const pace of ['standard','family','rain']){
   await page.goto(`http://127.0.0.1:8765/${file}?days=${days}&extra=${extra}&pace=${pace}`);
   assert.equal(await page.locator('#plan-result li').count(),days);
   assert.equal(await page.locator('#plan-result dt').count(),days*4);
   const text=await page.locator('#plan-result').innerText();
   assert(text.includes('Tianmen Mountain')===(days===4||extra==='tianmen'));
   assert(text.includes('Grand Canyon & Glass Bridge')===(days===4||extra==='canyon'));
   assert.equal(await page.locator('#extra').isDisabled(),days===4);
   assert((await page.locator('#plan-summary').innerText()).startsWith(days+' full days'));
   assert(new URL(await page.locator('#plan-link a').getAttribute('href')).searchParams.get('pace')===pace);
   if(pace==='rain')assert(text.includes('postpone'));
   if(pace==='family')assert(text.includes('Bailong Elevator'));
   if(process.env.QA_PDF_DIR){fs.mkdirSync(process.env.QA_PDF_DIR,{recursive:true});await page.pdf({path:path.join(process.env.QA_PDF_DIR,`${file}-${days}-${extra}-${pace}.pdf`),preferCSSPageSize:true});}
   combinations++;
  }
  const boxes=await page.locator('.fields select').evaluateAll(els=>els.map(el=>{const r=el.getBoundingClientRect();return {top:r.top,height:r.height,width:r.width};}));
  assert(boxes[1].top>=boxes[0].top+boxes[0].height,'mobile controls must stack');
  assert(boxes.every(box=>box.height>=44),'mobile targets must be at least 44px high');
  await page.goto(`http://127.0.0.1:8765/${file}?days=bogus&extra=bogus&pace=bogus`);
  assert.equal(await page.locator('#plan-result li').count(),3);
  await page.selectOption('#days','2');assert(new URL(page.url()).searchParams.get('days')==='2');
  await page.reload();assert.equal(await page.locator('#days').inputValue(),'2');
  await page.evaluate(()=>{window.__printed=0;window.print=()=>{window.__printed++};Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{window.__copied=text}}});});
  await page.click('#print-plan');assert.equal(await page.evaluate(()=>window.__printed),1);
  await page.click('#copy-plan');assert((await page.evaluate(()=>window.__copied)).includes(page.url()));
  await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:undefined}));
  await page.click('#copy-plan');assert((await page.locator('#copy-status').innerText()).includes('Select and copy'));
  await page.emulateMedia({media:'print'});assert(await page.locator('#planner').isVisible());assert(await page.locator('#plan-summary').isVisible());assert(await page.locator('#plan-link').isVisible());
  await page.close();
 }
 // Non-planner guides must retain their content when the browser prints.
 const printPage=await browser.newPage();await printPage.emulateMedia({media:'print'});
 for(const file of pages.filter(x=>!['index.html','zhangjiajie-itinerary.html'].includes(x))){
  await printPage.goto('http://127.0.0.1:8765/'+file);
  assert(await printPage.locator('h1').isVisible(),file+' print title hidden');
  assert(await printPage.locator('main').isVisible(),file+' print content hidden');
  assert(await printPage.locator('main section').first().isVisible(),file+' print section hidden');
 }
 await printPage.close();
 const local=await browser.newPage();const errors=[];local.on('pageerror',e=>errors.push(e.message));
 await local.goto('file://'+path.resolve('dist/index.html'));await local.selectOption('#days','4');assert.equal(await local.locator('#plan-result li').count(),4);assert.deepEqual(errors,[]);await local.close();
 const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:900}});
 for(const file of pages){const p=await nojs.newPage();await p.goto('http://127.0.0.1:8765/'+file);assert(await p.locator('h1').isVisible());if(['index.html','zhangjiajie-itinerary.html'].includes(file)){assert.equal(await p.locator('#plan-result li').count(),3);assert.equal(await p.locator('.fields').isVisible(),false);assert.equal(await p.locator('.plan-actions').isVisible(),false);}await p.close();}
 await browser.close();await new Promise(resolve=>server.close(resolve));console.log(`PASS: ${pages.length} pages at 390/768/1024px; all images; ${combinations} planner cases; invalid/share/file URL; mobile targets; print content; no-JS fallback`);
})().catch(e=>{console.error(e);process.exit(1)});
