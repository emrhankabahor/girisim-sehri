/* Empire of Trade • Hızlı menü geçişlerinde tekrar eden işi birleştirir. */
(function(){
  'use strict';
  if(window.__eotTransitionPerformance)return;
  window.__eotTransitionPerformance=true;

  let burstUntil=0;
  let burstId=0;
  let burstTimer=0;
  const state=new Map();

  function now(){return performance.now()}
  function inBurst(){return now()<burstUntil}

  function finishBurst(){
    if(now()<burstUntil){
      clearTimeout(burstTimer);
      burstTimer=setTimeout(finishBurst,Math.max(20,burstUntil-now()+20));
      return;
    }
    state.forEach(s=>{
      if(!s.pending||!s.original)return;
      s.pending=false;
      const args=s.lastArgs||[];
      const ctx=s.lastThis||window;
      s.lastArgs=null;s.lastThis=null;
      try{s.lastResult=s.original.apply(ctx,args)}catch(e){console.warn('Geçiş sonrası güncelleme:',s.name,e)}
    });
  }

  function markBurst(){
    const t=now();
    if(t>=burstUntil)burstId++;
    burstUntil=t+260;
    clearTimeout(burstTimer);
    burstTimer=setTimeout(finishBurst,290);
  }

  function wrap(name,flushAtEnd){
    const fn=window[name];
    if(typeof fn!=='function'||fn.__eotTransitionCoalesced)return false;
    const s={name:name,original:fn,seenBurst:-1,pending:false,lastArgs:null,lastThis:null,lastResult:undefined};
    state.set(name,s);
    const wrapped=function(){
      if(!inBurst())return s.original.apply(this,arguments);
      s.lastArgs=Array.prototype.slice.call(arguments);
      s.lastThis=this;
      if(s.seenBurst!==burstId){
        s.seenBurst=burstId;
        s.pending=false;
        s.lastResult=s.original.apply(this,arguments);
        return s.lastResult;
      }
      if(flushAtEnd)s.pending=true;
      return s.lastResult;
    };
    wrapped.__eotTransitionCoalesced=true;
    wrapped.__eotOriginal=fn;
    window[name]=wrapped;
    return true;
  }

  function install(){
    /* İlk çağrı geçer; aynı hızlı geçiş serisindeki tekrarlar birleştirilir.
       Seri bittiğinde son çağrı bir kez daha çalıştırılarak ekran/veri tutarlılığı korunur. */
    ['render','renderSimulation','renderFinanceExtras','renderGameExtras','renderWealth'].forEach(n=>wrap(n,true));
    ['save','simSave','saveOwned','saveDeposits','saveAccountCareer','captureCareerState'].forEach(n=>wrap(n,true));
  }

  function bind(){
    const nav=document.querySelector('.bottom-nav');
    if(nav&&!nav.dataset.eotTransitionPerf){
      nav.dataset.eotTransitionPerf='1';
      nav.addEventListener('pointerdown',function(e){
        if(e.target.closest('.nav-btn'))markBurst();
      },{capture:true,passive:true});
    }
  }

  [0,150,400,900,1800,3200].forEach(ms=>setTimeout(function(){install();bind()},ms));
  window.addEventListener('hashchange',function(){markBurst();setTimeout(install,0)});
  window.addEventListener('pageshow',function(){bind();install()});
})();
