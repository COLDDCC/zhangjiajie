
(function(){
  'use strict';
  var days=document.getElementById('days'), extra=document.getElementById('extra'), result=document.getElementById('plan-result');
  function route(){
    if(!days||!extra||!result)return;
    var n=Number(days.value), canyon=extra.value==='canyon';
    extra.disabled=n===4;
    var list=[];
    if(n===2){list=['Day 1: Yuanjiajie and Tianzi Mountain. Sleep in Wulingyuan.'];list.push(canyon?'Day 2: Grand Canyon and Glass Bridge. Stay in Wulingyuan; arrange your onward transfer.':'Move to Zhangjiajie city after Day 1. Day 2: Tianmen Mountain, currently Route C.');}
    else{list=['Day 1: Yuanjiajie and Tianzi Mountain. Sleep in Wulingyuan.','Day 2: Golden Whip Stream and one optional park area.'];if(n===4){list.push('Day 3: Grand Canyon and Glass Bridge. Transfer to Zhangjiajie city afterwards.','Day 4: Tianmen Mountain, currently Route C.');}else{list.push(canyon?'Day 3: Grand Canyon and Glass Bridge. Use Wulingyuan as your base.':'Move to Zhangjiajie city after Day 2. Day 3: Tianmen Mountain, currently Route C.');}}
    result.replaceChildren(); var ol=document.createElement('ol');list.forEach(function(t){var li=document.createElement('li');li.textContent=t;ol.appendChild(li);});result.appendChild(ol);
    var p=document.createElement('p');p.textContent=n===4?'Both extra attractions are included in the four-day plan.':'This plan leaves out '+(canyon?'Tianmen Mountain.':'the Grand Canyon.')+' Add arrival and departure time separately.';result.appendChild(p);
  }
  if(days&&extra){days.addEventListener('change',route);extra.addEventListener('change',route);route();}
  async function copy(text,status){try{if(!navigator.clipboard)throw new Error('Clipboard unavailable');await navigator.clipboard.writeText(text);status.textContent='Copied.';}catch(e){status.textContent='Copy is unavailable here. Select and copy the text above.';}}
  var button=document.getElementById('copy-plan');if(button)button.addEventListener('click',function(){copy('Zhangjiajie suggested trip plan\n'+result.innerText,document.getElementById('copy-status'));});
  document.querySelectorAll('[data-copy]').forEach(function(b){b.addEventListener('click',function(){copy(b.dataset.copy,document.getElementById('place-status'));});});
})();

// Each section remains visible if scripting or motion support is unavailable.
if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-in');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('section h2, .card h3, .card p, .card .photo, .planner, .faq-layout .photo, details').forEach(el => observer.observe(el));
}
