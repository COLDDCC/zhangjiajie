const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
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
   if(pace==='rain')assert(text.includes('postpone'));
   if(pace==='family')assert(text.includes('Bailong Elevator'));
   combinations++;
  }
  await page.goto(`http://127.0.0.1:8765/${file}?days=bogus&extra=bogus&pace=bogus`);
  assert.equal(await page.locator('#plan-result li').count(),3);
  await page.selectOption('#days','2');assert(new URL(page.url()).searchParams.get('days')==='2');
  await page.reload();assert.equal(await page.locator('#days').inputValue(),'2');
  await page.close();
 }
 const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:900}});
 for(const file of pages){const p=await nojs.newPage();await p.goto('http://127.0.0.1:8765/'+file);assert(await p.locator('h1').isVisible());if(['index.html','zhangjiajie-itinerary.html'].includes(file))assert.equal(await p.locator('#plan-result li').count(),3);await p.close();}
 await browser.close();console.log(`PASS: ${pages.length} pages at 390/768/1024px; all images; ${combinations} planner cases; invalid/share URL; no-JS fallback`);
})().catch(e=>{console.error(e);process.exit(1)});
