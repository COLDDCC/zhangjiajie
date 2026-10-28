(function(){
  'use strict';
  var days=document.getElementById('days'),extra=document.getElementById('extra'),pace=document.getElementById('pace'),result=document.getElementById('plan-result');
  function readURL(){
    if(!days||!extra||!pace)return;
    var q=new URLSearchParams(location.search);
    [[days,'days'],[extra,'extra'],[pace,'pace']].forEach(function(pair){var v=q.get(pair[1]);if(Array.from(pair[0].options).some(function(o){return o.value===v;}))pair[0].value=v;});
  }
  function route(updateURL){
    if(!days||!extra||!pace||!result)return;
    var n=Number(days.value),canyon=extra.value==='canyon',style=pace.value;
    extra.disabled=n===4;
    var stops=[{title:'Forest park viewpoints',sleep:'Wulingyuan',sights:'Yuanjiajie and Tianzi Mountain',time:'Reserve a full day; no verified combined duration.',note:'Book lifts separately where needed; walking remains.'}];
    if(n>2)stops.push({title:'Golden Whip Stream',sleep:(n===3&&!canyon)?'Zhangjiajie city, after visiting':'Wulingyuan',sights:'Valley walk; optional park area only if time permits',time:'Stream walk: 1–3 hours (source below); allow longer for the full trail and stops.',note:'Keep time for your evening transfer when changing base.'});
    if(n===4||canyon)stops.push({title:'Grand Canyon & Glass Bridge',sleep:n===4?'Zhangjiajie city, after visiting':'Wulingyuan, or arrange departure',sights:'Glass Bridge and canyon walk',time:'Half a day for sightseeing (source below); road transfers are additional.',note:'Confirm the ticket includes the canyon, rather than just the bridge.'});
    if(n===4||!canyon){if(n===2)stops[0].sleep='Zhangjiajie city, after visiting';stops.push({title:'Tianmen Mountain',sleep:'Zhangjiajie city, or arrange departure',sights:'Tianmen Cave and summit, via Route C',time:'3–5 hours for sightseeing (source below); queues and transfers are additional.',note:'The long city cableway is closed; follow your booked entry slot.'});}
    var ol=document.createElement('ol');ol.className='plan-days';
    stops.forEach(function(stop,i){
      if(style==='family'){
        if(i===0){stop.sights='A shorter Yuanjiajie viewpoint route using Bailong Elevator; add Tianzi only if energy permits';stop.note='Use the available cableway for descent; check separate lift tickets. Not step-free.';}
        if(stop.title==='Golden Whip Stream'){stop.sights='Short out-and-back valley walk, returning before anyone tires';stop.time='Shortened route: duration depends on your turnaround point.';}
        if(stop.title==='Grand Canyon & Glass Bridge'){stop.sights='Bridge only if suitable; omit the long canyon walk';stop.time='Shortened visit: no verified duration; confirm your ticket product.';}
        if(stop.title==='Tianmen Mountain')stop.note+=' Use available escalators and shorten summit walks; confirm accessible routing directly.';
      }
      if(style==='rain'){stop.sights='Weather reserve: '+stop.sights;stop.note='If the operator closes access or visibility is poor, postpone this outdoor stop. Rest near your base; check notices before travelling.';stop.time='Keep the day flexible; the fair-weather timing reference does not apply during closures.';}
      var li=document.createElement('li'),h=document.createElement('h3'),dl=document.createElement('dl');h.textContent='Day '+(i+1)+' · '+stop.title;li.appendChild(h);
      [['Sleep',stop.sleep],['Main sights',stop.sights],['Visit time',stop.time],['Remember',stop.note]].forEach(function(pair){var dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=pair[0];dd.textContent=pair[1];dl.append(dt,dd);});li.appendChild(dl);ol.appendChild(li);
    });result.replaceChildren(ol);
    if(updateURL){var u=new URL(location.href);u.searchParams.set('days',days.value);u.searchParams.set('extra',extra.value);u.searchParams.set('pace',pace.value);history.replaceState(null,'',u);}
  }
  if(days&&extra&&pace){readURL();[days,extra,pace].forEach(function(el){el.addEventListener('change',function(){route(true);});});window.addEventListener('popstate',function(){days.value='3';extra.value='tianmen';pace.value='standard';readURL();route(false);});route(false);}
  async function copy(text,status){try{if(!navigator.clipboard)throw new Error('Clipboard unavailable');await navigator.clipboard.writeText(text);status.textContent='Copied.';}catch(e){status.textContent='Copy is unavailable here. Select and copy the text above.';}}
  var button=document.getElementById('copy-plan');if(button)button.addEventListener('click',function(){route(true);copy('Zhangjiajie suggested trip plan\n'+result.innerText+'\nTiming references reviewed 28 October 2026; see sources on the shared page.\n'+location.href,document.getElementById('copy-status'));});
  var print=document.getElementById('print-plan');if(print)print.addEventListener('click',function(){window.print();});
  document.querySelectorAll('[data-copy]').forEach(function(b){b.addEventListener('click',function(){copy(b.dataset.copy,document.getElementById('place-status'));});});
})();
