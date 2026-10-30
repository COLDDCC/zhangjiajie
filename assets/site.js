(function(){
  'use strict';
  document.documentElement.classList.add('enhanced');
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
    extra.setAttribute('aria-describedby','extra-note');
    document.getElementById('extra-note').hidden=n!==4;
    var label=n+' full days · '+pace.options[pace.selectedIndex].textContent+' · '+(n===4?'Both extra attractions':extra.options[extra.selectedIndex].textContent+' extra');
    document.getElementById('plan-summary').textContent=label;
    var stops=[{title:'Forest park viewpoints',sleep:'Wulingyuan',sights:'Yuanjiajie and Tianzi Mountain',time:'Reserve a full day; no verified combined duration.',note:'Book lifts separately where needed; walking remains.'}];
    if(n>2)stops.push({title:'Golden Whip Stream',sleep:(n===3&&!canyon)?'Zhangjiajie city, after visiting':'Wulingyuan',sights:'Valley walk; optional park area only if time permits',time:'Stream walk: 1–3 hours (source below); allow longer for the full trail and stops.',note:'Keep time for your evening transfer when changing base.'});
    if(n===4||canyon)stops.push({title:'Grand Canyon & Glass Bridge',sleep:n===4?'Zhangjiajie city, after visiting':'Wulingyuan, or arrange departure',sights:'Glass Bridge and canyon walk',time:'Half a day for sightseeing (source below); road transfers are additional.',note:'Confirm the ticket includes the canyon, rather than just the bridge.'});
    if(n===4||!canyon){if(n===2)stops[0].sleep='Zhangjiajie city, after visiting';stops.push({title:'Tianmen Mountain',sleep:'Zhangjiajie city, or arrange departure',sights:'Tianmen Cave and summit, via Route C',time:'3–5 hours for sightseeing (source below); queues and transfers are additional.',note:'The long city cableway is closed; follow your booked entry slot.'});}
    var destinations={
      'Forest park viewpoints':['zhangjiajie-national-forest-park.html','place-3'],
      'Golden Whip Stream':['zhangjiajie-national-forest-park.html','place-4'],
      'Grand Canyon & Glass Bridge':['zhangjiajie-glass-bridge.html','place-7'],
      'Tianmen Mountain':['tianmen-mountain.html','place-6']
    };
    var selected=new URLSearchParams({days:days.value,extra:extra.value,pace:pace.value});
    var ol=document.createElement('ol');ol.className='plan-days';
    stops.forEach(function(stop,i){
      if(style==='family'){
        if(i===0){stop.sights='A shorter Yuanjiajie viewpoint route using Bailong Elevator; add Tianzi only if energy permits';stop.note='Use the available cableway for descent; check separate lift tickets. Not step-free.';}
        if(stop.title==='Golden Whip Stream'){stop.sights='Short out-and-back valley walk, returning before anyone tires';stop.time='Shortened route: duration depends on your turnaround point.';}
        if(stop.title==='Grand Canyon & Glass Bridge'){stop.sights='Bridge only if suitable; omit the long canyon walk';stop.time='Shortened visit: no verified duration; confirm your ticket product.';}
        if(stop.title==='Tianmen Mountain')stop.note+=' Use available escalators and shorten summit walks; confirm accessible routing directly.';
      }
      if(style==='rain'){stop.sights='Weather reserve: '+stop.sights;stop.note='If the operator closes access or visibility is poor, postpone this outdoor stop. Rest near your base; check notices before travelling.';stop.time='Keep the day flexible; the fair-weather timing reference does not apply during closures.';}
      var li=document.createElement('li'),h=document.createElement('h3'),dl=document.createElement('dl');h.textContent='Day '+(i+1)+' · '+stop.title;li.className='plan-card';var dayTag=document.createElement('span');dayTag.className='plan-card-tag';dayTag.textContent='DAY '+String(i+1).padStart(2,'0');li.appendChild(dayTag);li.appendChild(h);
      [['Sleep',stop.sleep],['Main sights',stop.sights],['Visit time',stop.time],['Remember',stop.note]].forEach(function(pair){var dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=pair[0];dd.textContent=pair[1];dl.append(dt,dd);});li.appendChild(dl);
      var destination=destinations[stop.title],links=document.createElement('p');links.className='day-links';
      [[destination[0],'Read guide'],['zhangjiajie-map-transport.html?'+selected.toString()+'#'+destination[1],'Map & Chinese name']].forEach(function(pair){var a=document.createElement('a');a.href=pair[0];a.textContent=pair[1];links.appendChild(a);});
      li.appendChild(links);ol.appendChild(li);
    });result.replaceChildren(ol);
    var booking=document.getElementById('booking-items');
    if(booking){
      var checks=['Forest Park: confirm admission date, passport details and separate elevator/cableway rides'];
      if(stops.some(function(s){return s.title==='Grand Canyon & Glass Bridge';}))checks.push('Grand Canyon: check whether your product includes the canyon walk as well as the Glass Bridge');
      if(stops.some(function(s){return s.title==='Tianmen Mountain';}))checks.push('Tianmen Mountain: verify Route C, operating notice and timed entry before paying');
      checks.push('Overnight bases: '+stops.map(function(s){return s.sleep;}).filter(function(s,i,a){return a.indexOf(s)===i;}).join(' → '));
      if(style==='rain')checks.push('Weather: check same-day closure and visibility notices; postpone outdoor visits if needed');
      if(style==='family')checks.push('Less walking: confirm steps, gradients and facilities directly; this is not an accessible-route guarantee');
      booking.replaceChildren();checks.forEach(function(s){var item=document.createElement('li');item.textContent=s;booking.appendChild(item);});
    }
    var u=new URL(location.href);u.searchParams.set('days',days.value);u.searchParams.set('extra',extra.value);u.searchParams.set('pace',pace.value);
    if(updateURL&&/^https?:$/.test(u.protocol))history.replaceState(null,'',u);
    var fullRoute=document.querySelector('#planner .route-link a');
    if(fullRoute)fullRoute.href='zhangjiajie-itinerary.html?'+selected.toString()+'#planner';
    var saved=document.getElementById('plan-link');saved.replaceChildren();
    if(/^https?:$/.test(u.protocol)){var link=document.createElement('a');link.href=u.href;link.textContent='Reopen this plan: '+u.href;saved.appendChild(link);}
  }
  if(days&&extra&&pace){readURL();[days,extra,pace].forEach(function(el){el.addEventListener('change',function(){route(true);});});window.addEventListener('popstate',function(){days.value='3';extra.value='tianmen';pace.value='standard';readURL();route(false);});route(false);}
  var copyDialog,copyField,copyOpener;
  function manualCopy(text,opener){
    if(!copyDialog){
      copyDialog=document.createElement('dialog');copyDialog.className='copy-fallback';copyDialog.setAttribute('aria-labelledby','manual-copy-title');copyDialog.setAttribute('aria-describedby','manual-copy-help');
      var heading=document.createElement('h2');heading.id='manual-copy-title';heading.textContent='Copy this text';
      var help=document.createElement('p');help.id='manual-copy-help';help.textContent='Press Ctrl+C or ⌘C, or touch and hold the selected text to copy it.';
      var label=document.createElement('label');label.htmlFor='manual-copy-text';label.textContent='Text to copy';
      copyField=document.createElement('textarea');copyField.id='manual-copy-text';copyField.readOnly=true;copyField.spellcheck=false;
      var close=document.createElement('button');close.type='button';close.textContent='Done';close.addEventListener('click',function(){if(typeof copyDialog.close==='function')copyDialog.close();else{copyDialog.removeAttribute('open');if(copyOpener)copyOpener.focus();}});
      copyDialog.addEventListener('close',function(){if(copyOpener&&copyOpener.isConnected)copyOpener.focus();});
      copyDialog.append(heading,help,label,copyField,close);document.body.appendChild(copyDialog);
    }
    copyOpener=opener;copyField.value=text;copyField.rows=text.includes('\n')?12:3;
    if(!copyDialog.open){if(typeof copyDialog.showModal==='function')copyDialog.showModal();else copyDialog.setAttribute('open','');}
    copyField.focus();copyField.select();
  }
  async function copy(text,status,opener){
    status.textContent='';
    try{if(!navigator.clipboard)throw new Error('Clipboard unavailable');await navigator.clipboard.writeText(text);status.textContent='Copied.';}
    catch(e){status.textContent='Select and copy the text in the open panel.';manualCopy(text,opener);}
  }
  function planText(){
    var sections=['Zhangjiajie suggested trip plan',document.getElementById('plan-summary').textContent];
    result.querySelectorAll('li').forEach(function(day){
      sections.push(day.querySelector('h3').textContent);
      day.querySelectorAll('dt').forEach(function(term){sections.push(term.textContent+': '+term.nextElementSibling.textContent);});
      day.querySelectorAll('.day-links a').forEach(function(link){
        if(/^https?:$/.test(new URL(link.href).protocol))sections.push(link.textContent+': '+link.href);
      });
    });
    var references=document.querySelector('#planner .timing-references');
    if(references){sections.push(references.textContent);references.querySelectorAll('a').forEach(function(link){sections.push(link.href);});}
    var reopen=document.querySelector('#plan-link a');if(reopen)sections.push(reopen.href);
    return sections.join('\n');
  }
  var button=document.getElementById('copy-plan');if(button)button.addEventListener('click',function(){route(true);copy(planText(),document.getElementById('copy-status'),button);});
  var print=document.getElementById('print-plan');if(print)print.addEventListener('click',function(){window.print();});

  var search=document.getElementById('place-search');
  if(search){
    var rows=Array.from(document.querySelectorAll('#place-table tbody tr'));
    var count=document.getElementById('place-count'),empty=document.getElementById('place-empty');
    var incoming=new URLSearchParams(location.search),back=document.getElementById('return-plan');
    if(['2','3','4'].includes(incoming.get('days'))&&['tianmen','canyon'].includes(incoming.get('extra'))&&['standard','family','rain'].includes(incoming.get('pace'))){
      var restored=new URLSearchParams();['days','extra','pace'].forEach(function(key){restored.set(key,incoming.get(key));});
      back.href='zhangjiajie-itinerary.html?'+restored.toString()+'#planner';back.textContent='Return to my '+incoming.get('days')+'-day plan';
    }
    function filterPlaces(){
      var query=search.value.trim().toLocaleLowerCase(),shown=0;
      rows.forEach(function(row){var matches=row.textContent.toLocaleLowerCase().includes(query);row.hidden=!matches;if(matches)shown++;});
      count.textContent=shown+' of '+rows.length+' places shown.';empty.hidden=shown!==0;
    }
    function showAll(){search.value='';filterPlaces();}
    document.querySelector('.place-tools').hidden=false;
    search.addEventListener('input',filterPlaces);
    document.getElementById('clear-places').addEventListener('click',function(){showAll();search.focus();});
    // A schematic link must still reach a row hidden by an earlier search.
    document.querySelectorAll('a[href^="#place-"]').forEach(function(link){link.addEventListener('click',showAll);});
    window.addEventListener('hashchange',function(){
      var target=rows.find(function(row){return '#'+row.id===location.hash;});
      if(target&&target.hidden){showAll();target.scrollIntoView();}
    });
    filterPlaces();
    var arrival=rows.find(function(row){return '#'+row.id===location.hash;});
    if(arrival)arrival.focus({preventScroll:true});
  }
  document.querySelectorAll('[data-copy]').forEach(function(b){
    var feedback=document.createElement('span');feedback.className='place-copy-status';feedback.setAttribute('role','status');b.insertAdjacentElement('afterend',feedback);
    b.addEventListener('click',function(){document.querySelectorAll('.place-copy-status').forEach(function(s){s.textContent='';});copy(b.dataset.copy,feedback,b);});
  });
})();
