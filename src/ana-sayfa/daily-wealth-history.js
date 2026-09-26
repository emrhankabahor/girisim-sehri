/* Empire of Trade • Net servet geçmişini gerçek takvim gününe bağla */
(function(){
  'use strict';
  if(window.__eotDailyWealthHistory)return;
  window.__eotDailyWealthHistory=true;

  const MAX_DAYS=30;
  let lastDay='';
  let midnightTimer=0;

  function dayKey(ts){
    const d=new Date(Number(ts)||Date.now());
    return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  }
  function dayStart(ts){
    const d=new Date(Number(ts)||Date.now());
    d.setHours(0,0,0,0);
    return d.getTime();
  }
  function labelFromKey(key){
    const p=String(key||'').split('-');
    return p.length===3?p[2]+'.'+p[1]:String(key||'');
  }
  function fullLabel(key){
    const p=String(key||'').split('-');
    return p.length===3?p[2]+'.'+p[1]+'.'+p[0]:String(key||'');
  }
  function wealthNow(){
    try{return typeof totalWealth==='function'?Number(totalWealth()||0):0}catch(e){return 0}
  }
  function ensureHistory(){
    try{
      if(typeof sim==='undefined'||!sim)return [];
      if(!Array.isArray(sim.wealthHistory))sim.wealthHistory=[];
      return sim.wealthHistory;
    }catch(e){return []}
  }
  function migrate(){
    const src=ensureHistory();
    if(!src.length)return false;
    const grouped=new Map();
    src.forEach(row=>{
      if(!row||typeof row!=='object')return;
      const ts=Number(row.t)||Date.now();
      const key=String(row.day||row.date||dayKey(ts));
      const value=Number(row.value||0);
      const current=grouped.get(key);
      if(!current||ts>=current.t)grouped.set(key,{day:key,value,t:ts,dayStart:dayStart(ts)});
    });
    const clean=[...grouped.values()].sort((a,b)=>b.dayStart-a.dayStart).slice(0,MAX_DAYS);
    const changed=clean.length!==src.length||src.some((x,i)=>!clean[i]||x.day!==clean[i].day||Number(x.value)!==Number(clean[i].value));
    if(changed){
      sim.wealthHistory=clean;
      try{if(typeof simSave==='function')simSave()}catch(e){}
    }
    return changed;
  }
  function recordDailyWealth(){
    if(typeof sim==='undefined'||!sim)return false;
    migrate();
    const now=Date.now(),key=dayKey(now),value=wealthNow();
    let list=ensureHistory();
    const idx=list.findIndex(x=>x&&String(x.day||dayKey(x.t))===key);
    let changed=false;
    if(idx>=0){
      const row=list[idx];
      if(Number(row.value)!==value){
        row.value=value;
        row.t=now;
        row.day=key;
        row.dayStart=dayStart(now);
        changed=true;
      }
      if(idx!==0){list.splice(idx,1);list.unshift(row);changed=true}
    }else{
      list.unshift({day:key,value,t:now,dayStart:dayStart(now)});
      changed=true;
    }
    if(changed){
      sim.wealthHistory=list.slice(0,MAX_DAYS);
      try{if(typeof simSave==='function')simSave()}catch(e){}
    }
    lastDay=key;
    return changed;
  }
  function renderDailyWealth(){
    recordDailyWealth();
    const chart=document.getElementById('wealthChart'),list=document.getElementById('wealthHistoryList');
    const rows=ensureHistory().slice(0,12);
    if(chart){
      const vals=rows.slice().reverse(),mx=Math.max(1,...vals.map(x=>Math.max(0,Number(x.value||0))));
      chart.innerHTML=vals.map(x=>'<div class="wealth-bar" style="height:'+Math.max(8,Math.round(Math.max(0,Number(x.value||0))/mx*100))+'%"><span>'+labelFromKey(x.day||dayKey(x.t))+'</span></div>').join('');
    }
    if(list){
      list.innerHTML=rows.map(x=>'<div class="wealth-row"><span>'+fullLabel(x.day||dayKey(x.t))+'</span><b>'+(typeof money==='function'?money(x.value):'₺'+Number(x.value||0).toLocaleString('tr-TR'))+'</b></div>').join('');
    }
  }
  function isWealthRoute(){return String(location.hash||'').toLowerCase().includes('wealth')}
  function resetWealthScroll(){
    if(!isWealthRoute())return;
    requestAnimationFrame(()=>{try{const scroller=document.scrollingElement||document.documentElement;if(scroller)scroller.scrollTop=0;else window.scrollTo(0,0)}catch(e){try{window.scrollTo(0,0)}catch(_){}}});
  }
  function scheduleMidnight(){
    clearTimeout(midnightTimer);
    const now=new Date();
    const next=new Date(now);
    next.setHours(24,0,1,0);
    midnightTimer=setTimeout(function(){
      midnightCheck();
      scheduleMidnight();
    },Math.max(1000,next.getTime()-now.getTime()));
  }
  function patch(){
    migrate();
    window.recordWealth=recordDailyWealth;
    window.renderWealth=renderDailyWealth;
    if(isWealthRoute()){renderDailyWealth();resetWealthScroll()}
    scheduleMidnight();
  }
  function midnightCheck(){
    const key=dayKey(Date.now());
    if(!lastDay)lastDay=key;
    if(key!==lastDay){recordDailyWealth();if(isWealthRoute())renderDailyWealth()}
  }

  document.addEventListener('click',function(e){
    const a=e.target&&e.target.closest?e.target.closest('a[href*="wealth"]'):null;
    if(a)requestAnimationFrame(resetWealthScroll);
  },true);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(patch,50),{once:true});
  else setTimeout(patch,50);
  window.addEventListener('pageshow',()=>setTimeout(patch,60));
  window.addEventListener('hashchange',()=>{if(isWealthRoute()){resetWealthScroll();setTimeout(renderDailyWealth,30)}},true);
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){midnightCheck();scheduleMidnight();if(isWealthRoute())renderDailyWealth()}});
})();