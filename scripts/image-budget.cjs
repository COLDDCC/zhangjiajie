// Optional: IMAGE_BASELINE_DIR=/path/to/old/dist CHROMIUM_PATH=/path/to/chrome node scripts/image-budget.cjs
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
(async()=>{
 const roots={after:path.resolve('dist')};if(process.env.IMAGE_BASELINE_DIR)roots.before=path.resolve(process.env.IMAGE_BASELINE_DIR);
 const server=http.createServer((req,res)=>{
  const u=new URL(req.url,'http://localhost'),parts=u.pathname.split('/'),root=roots[parts[1]];
  if(!root){res.writeHead(404);res.end();return;}
  const file=path.resolve(root,'./'+parts.slice(2).join('/'));
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}
  res.setHeader('Content-Type',({'.html':'text/html','.css':'text/css','.js':'text/javascript','.webp':'image/webp','.jpg':'image/jpeg'})[path.extname(file)]||'application/octet-stream');fs.createReadStream(file).pipe(res);
 });
 await new Promise(resolve=>server.listen(8767,'127.0.0.1',resolve));
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,headless:true,args:['--no-sandbox']});
 try{
  const report=[];
  for(const width of [390,768,1024])for(const dpr of [1,2])for(const file of ['index.html','chinese-mountains.html'])for(const variant of Object.keys(roots)){
   const page=await browser.newPage({viewport:{width,height:900},deviceScaleFactor:dpr});
   await page.goto(`http://127.0.0.1:8767/${variant}/${file}`);
   await page.locator('img').evaluateAll(imgs=>Promise.all(imgs.map(i=>{i.loading='eager';return i.decode();})));
   const images=await page.locator('img').evaluateAll(imgs=>imgs.map(i=>({src:new URL(i.currentSrc).pathname,displayWidth:Math.round(i.getBoundingClientRect().width),bytes:performance.getEntriesByName(i.currentSrc)[0]?.encodedBodySize||0})));
   assert(images.every(i=>i.bytes>0),`${variant}/${file}: missing image response`);
   if(variant==='after'){
    assert(images.every(i=>i.src.endsWith('.webp')));
    if(file==='index.html'&&dpr===1)assert(images.every(i=>!i.src.endsWith('-800.webp')&&!i.src.endsWith('-1200.webp')&&!i.src.endsWith('-1600.webp')),'DPR 1 homepage should use small variants');
    if(file==='chinese-mountains.html'&&dpr===1)assert(images.filter(i=>i.src.includes('/rail-')).every(i=>i.src.endsWith('-320.webp')),'small comparison thumbnails should use 320px variants');
   }
   report.push({width,dpr,file,variant,bytes:images.reduce((n,i)=>n+i.bytes,0),images});await page.close();
  }
  console.log(JSON.stringify(report,null,2));
 }finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(e=>{console.error(e);process.exit(1)});
