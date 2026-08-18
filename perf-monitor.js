/* Empire of Trade • Hafif performans teşhis katmanı */
(function(){
  'use strict';
  if(window.__eotPerfMonitor)return;
  window.__eotPerfMonitor=true;

  const MAX=80;
  const samples={functions:{},longTasks:[],transitions:[]};

  function push(arr,item){arr.push(item);if(arr.length>MAX)arr.shift()}
  function stat(name,ms){
    if(!Number.isFinite(ms))return;
    const s=samples.functions[name]||(samples.functions[name]={count:0,total:0,max:0,last:0,slow:0});
    s.count++;s.total+=ms;s.max=Math.max(s.max,ms);s.last=ms;if(ms>=16)s.slow++;
  }
  function wrap(name){
    try{
      const fn=window[name];
      if(typeof fn!=='function'||fn.__eotPerfWrapped)return false;
      const wrapped=function(){
        const t=performance.now();
        try{return fn.apply(this,arguments)}finally{stat(name,performance.now()-t)}
      };
      wrapped.__eotPerfWrapped=true;
      wrapped.__eotOriginal=fn;
      window[name]=wrapped;
      return true;
    }catch(e){return false}
  }

  const targets=['render','renderFinanceExtras','renderGameExtras','renderSimulation','renderWealth','save','simSave','saveOwned','saveDeposits','saveAccountCareer','captureCareerState','processRealDueLoans','syncDashboardTruth'];
  function installWrappers(){targets.forEach(wrap)}

  let attempts=0;
  const installTimer=setInterval(function(){attempts++;installWrappers();if(attempts>=20)clearInterval(installTimer)},500);
  installWrappers();

  if('PerformanceObserver' in window){
    try{
      const po=new PerformanceObserver(function(list){
        list.getEntries().forEach(function(e){push(samples.longTasks,{t:Date.now(),duration:Math.round(e.duration*10)/10,name:e.name||'longtask'})});
      });
      po.observe({entryTypes:['longtask']});
    }catch(e){}
  }

  let navStart=0,fromHash=location.hash||'#home';
  document.addEventListener('pointerdown',function(e){
    const btn=e.target&&e.target.closest?e.target.closest('.bottom-nav .nav-btn'):null;
    if(!btn)return;
    navStart=performance.now();
    fromHash=location.hash||'#home';
  },true);

  window.addEventListener('hashchange',function(){
    if(!navStart)return;
    const start=navStart,from=fromHash,to=location.hash||'#home';
    requestAnimationFrame(function(){requestAnimationFrame(function(){
      push(samples.transitions,{t:Date.now(),from:from,to:to,ms:Math.round((performance.now()-start)*10)/10});
      navStart=0;
    })});
  });

  function report(){
    const f={};
    Object.keys(samples.functions).forEach(function(k){
      const s=samples.functions[k];
      f[k]={count:s.count,avg:Math.round((s.total/Math.max(1,s.count))*10)/10,max:Math.round(s.max*10)/10,last:Math.round(s.last*10)/10,over16ms:s.slow};
    });
    const transitions=samples.transitions.slice(-20);
    const longTasks=samples.longTasks.slice(-20);
    return {functions:f,transitions:transitions,longTasks:longTasks};
  }

  window.eotPerfReport=report;
  window.eotPerfReset=function(){samples.functions={};samples.longTasks.length=0;samples.transitions.length=0;return true};
  window.eotPerfSummary=function(){
    const r=report();
    console.table(r.functions);
    if(r.transitions.length)console.table(r.transitions);
    if(r.longTasks.length)console.table(r.longTasks);
    return r;
  };
})();
