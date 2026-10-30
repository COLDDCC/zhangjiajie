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
 const reflow=await browser.newPage({viewport:{width:320,height:700}});
 for(const file of pages){
  await reflow.goto('http://127.0.0.1:8765/'+file);
  await reflow.addStyleTag({content:'html{font-size:200%}body{font-size:34px}'});
  const overflowReport=await reflow.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:innerWidth,offenders:[...document.querySelectorAll('body *')].map(e=>({tag:e.tagName,className:typeof e.className==='string'?e.className:'',id:e.id,right:Math.round(e.getBoundingClientRect().right),left:Math.round(e.getBoundingClientRect().left),scrollWidth:e.scrollWidth})).filter(e=>e.right>innerWidth+2||e.left< -2).slice(0,15)}));
  assert(overflowReport.scroll<=overflowReport.width,`${file}: overflow with enlarged text at 320px ${JSON.stringify(overflowReport)}`);
  assert(await reflow.locator('h1').evaluate(el=>el.scrollWidth<=el.clientWidth+1),`${file}: clipped enlarged title`);
 }
 await reflow.close();
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
   const mapLinks=await page.locator('#plan-result .day-links a:last-child').evaluateAll(els=>els.map(a=>a.href));
   assert.equal(mapLinks.length,days);
   for(const href of mapLinks){const u=new URL(href);assert.equal(u.searchParams.get('days'),String(days));assert.equal(u.searchParams.get('extra'),extra);assert.equal(u.searchParams.get('pace'),pace);assert(['#place-3','#place-4','#place-6','#place-7'].includes(u.hash));}
   assert.equal(new URL(mapLinks[0]).hash,'#place-3');
   if(days>2)assert.equal(new URL(mapLinks[1]).hash,'#place-4');
   assert.equal(new URL(mapLinks[mapLinks.length-1]).hash,days===4||extra==='tianmen'?'#place-6':'#place-7');
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
  await page.click('#copy-plan');const copied=await page.evaluate(()=>window.__copied);assert(copied.includes(page.url()));
  assert(copied.includes('Map & Chinese name: http://127.0.0.1:8765/zhangjiajie-map-transport.html?'));
  assert(copied.includes('https://www.chinadiscovery.com/hunan/zhangjiajie/golden-whip-stream.html'));
  await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:undefined}));
  await page.click('#copy-plan');assert((await page.locator('#copy-status').innerText()).includes('Select and copy'));
  assert(await page.getByRole('dialog',{name:'Copy this text'}).isVisible());assert.equal(await page.locator('#manual-copy-text').inputValue(),copied);
  assert(await page.locator('#manual-copy-text').evaluate(el=>el.selectionStart===0&&el.selectionEnd===el.value.length));
  await page.keyboard.press('Escape');assert.equal(await page.locator('.copy-fallback').isVisible(),false);assert(await page.locator('#copy-plan').evaluate(el=>el===document.activeElement));
  await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw new Error('NotAllowedError')}}}));
  await page.click('#copy-plan');assert.equal(await page.locator('.copy-fallback').count(),1);assert(await page.locator('.copy-fallback').isVisible());
  await page.getByRole('button',{name:'Done',exact:true}).click();assert(await page.locator('#copy-plan').evaluate(el=>el===document.activeElement));
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
 const journey=await browser.newPage({viewport:{width:390,height:900}});
 await journey.goto('http://127.0.0.1:8765/index.html?days=4&extra=canyon&pace=family');
 await journey.locator('#planner .route-link a').click();
 assert.equal(await journey.locator('#days').inputValue(),'4');assert.equal(await journey.locator('#pace').inputValue(),'family');
 await journey.locator('#plan-result li').last().locator('.day-links a').last().click();
 assert.equal(new URL(journey.url()).hash,'#place-6');assert(await journey.locator('#place-6').isVisible());assert(await journey.locator('#place-6').evaluate(el=>el===document.activeElement));
 await journey.keyboard.press('Tab');assert((await journey.evaluate(()=>document.activeElement.href)).includes('uri.amap.com'));
 await journey.locator('#return-plan').click();
 assert.equal(await journey.locator('#days').inputValue(),'4');assert.equal(await journey.locator('#extra').inputValue(),'canyon');assert.equal(await journey.locator('#pace').inputValue(),'family');
 await journey.goBack();assert.equal(new URL(journey.url()).hash,'#place-6');
 await journey.goBack();assert.equal(await journey.locator('#days').inputValue(),'4');assert.equal(await journey.locator('#pace').inputValue(),'family');
 await journey.close();
 const map=await browser.newPage({viewport:{width:390,height:900}});
 await map.goto('http://127.0.0.1:8765/zhangjiajie-map-transport.html');
 assert.equal(await map.locator('#place-table tbody tr:visible').count(),10);
 for(const [query,expected] of [['airport',1],['West station',1],['天门',2],['  AIRPORT  ',1],['no-such-place',0]]){
  await map.fill('#place-search',query);assert.equal(await map.locator('#place-table tbody tr:visible').count(),expected);
  assert((await map.locator('#place-count').innerText()).startsWith(expected+' of 10'));
 }
 assert(await map.locator('#place-empty').isVisible());
 await map.click('#clear-places');assert.equal(await map.locator('#place-table tbody tr:visible').count(),10);assert.equal(await map.locator('#place-empty').isVisible(),false);
 await map.fill('#place-search','airport');await map.locator('svg a[href="#place-3"]').click();
 assert(await map.locator('#place-3').isVisible());assert.equal(await map.locator('#place-search').inputValue(),'');
 const rowWidths=await map.locator('#place-table tbody tr').evaluateAll(rows=>rows.map(r=>r.getBoundingClientRect().width));
 assert(rowWidths.every(w=>w>0&&w<=390),'place cards must fit mobile viewport');
 const targets=await map.locator('#place-table tbody a,#place-table tbody button').evaluateAll(els=>els.map(e=>e.getBoundingClientRect().height));
 assert(targets.every(h=>h>=44),'map touch targets must be at least 44px');
 await map.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{window.__placeCopy=text}}}));
 await map.locator('#place-10 button').click();assert.equal(await map.evaluate(()=>window.__placeCopy),'张家界荷花国际机场');
 assert.equal(await map.locator('#place-10 .place-copy-status').innerText(),'Copied.');
 await map.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:undefined}));
 await map.locator('#place-10 button').click();assert.equal(await map.locator('#manual-copy-text').inputValue(),'张家界荷花国际机场');
 await map.setViewportSize({width:667,height:375});assert(await map.locator('.copy-fallback').evaluate(el=>el.getBoundingClientRect().height<=innerHeight-30));
 await map.getByRole('button',{name:'Done',exact:true}).click();assert(await map.locator('#place-10 button').evaluate(el=>el===document.activeElement));
 await map.fill('#place-search','airport');await map.emulateMedia({media:'print'});assert.equal(await map.locator('#place-table tbody tr:visible').count(),10);
 await map.close();
 const local=await browser.newPage();const errors=[];local.on('pageerror',e=>errors.push(e.message));
 await local.goto('file://'+path.resolve('dist/index.html'));await local.selectOption('#days','4');assert.equal(await local.locator('#plan-result li').count(),4);assert.deepEqual(errors,[]);
 await local.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:undefined}));await local.click('#copy-plan');
 const localText=await local.locator('#manual-copy-text').inputValue();assert(!localText.includes('file://'));assert(localText.includes('https://www.chinadiscovery.com/'));
 await local.getByRole('button',{name:'Done',exact:true}).click();await local.close();
 const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:900}});
 for(const file of pages){const p=await nojs.newPage();await p.goto('http://127.0.0.1:8765/'+file);assert(await p.locator('h1').isVisible());if(['index.html','zhangjiajie-itinerary.html'].includes(file)){assert.equal(await p.locator('#plan-result li').count(),3);assert.equal(await p.locator('.fields').isVisible(),false);assert.equal(await p.locator('.plan-actions').isVisible(),false);assert.equal(await p.locator('#plan-result .day-links a').count(),6);}if(file==='zhangjiajie-map-transport.html'){assert.equal(await p.locator('#place-table tbody tr:visible').count(),10);assert.equal(await p.locator('.place-tools').isVisible(),false);}await p.close();}
 await browser.close();await new Promise(resolve=>server.close(resolve));console.log(`PASS: ${pages.length} pages at 390/768/1024px; all images; ${combinations} planner cases; invalid/share/file URL; mobile/map targets; English/Chinese lookup; map anchor recovery; planner/map round trip; selectable clipboard fallback and focus; back navigation; 320px enlarged-text reflow; print content; no-JS fallback`);
})().catch(e=>{console.error(e);process.exit(1)});
