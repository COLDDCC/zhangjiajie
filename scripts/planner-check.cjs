// npm install --no-save jsdom; node scripts/planner-check.cjs
const assert=require('node:assert/strict');
const {JSDOM}=require('jsdom');
const fs=require('node:fs');
let cases=0;
for(const file of ['index.html','zhangjiajie-itinerary.html']){
 for(const days of [2,3,4])for(const extra of ['tianmen','canyon'])for(const pace of ['standard','family','rain']){
  const dom=new JSDOM(fs.readFileSync('dist/'+file,'utf8'),{url:`https://example.org/${file}?days=${days}&extra=${extra}&pace=${pace}`,runScripts:'outside-only'});
  dom.window.eval(fs.readFileSync('assets/site.js','utf8'));
  const doc=dom.window.document,text=doc.querySelector('#plan-result').textContent;
  assert.equal(doc.querySelectorAll('#plan-result li').length,days);
  assert.equal(doc.querySelectorAll('#plan-result dt').length,days*4);
  assert.equal(text.includes('Tianmen Mountain'),days===4||extra==='tianmen');
  assert.equal(text.includes('Grand Canyon & Glass Bridge'),days===4||extra==='canyon');
  assert.equal(doc.querySelector('#extra').disabled,days===4);
  if(pace==='rain')assert(text.includes('postpone'));
  if(pace==='family')assert(text.includes('Bailong Elevator'));
  const input=doc.querySelector('#days');input.value='2';input.dispatchEvent(new dom.window.Event('change'));
  assert.equal(new URL(dom.window.location.href).searchParams.get('days'),'2');
  assert.equal(doc.querySelectorAll('#plan-result li').length,2);
  dom.window.close();cases++;
 }
 const dom=new JSDOM(fs.readFileSync('dist/'+file,'utf8'),{url:`https://example.org/${file}?days=invalid&extra=invalid&pace=invalid`,runScripts:'outside-only'});
 dom.window.eval(fs.readFileSync('assets/site.js','utf8'));
 assert.equal(dom.window.document.querySelectorAll('#plan-result li').length,3);dom.window.close();
}
console.log('PASS:',cases,'planner cases (18 per page), URL changes, invalid query fallback');
