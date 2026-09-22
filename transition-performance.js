/* Empire of Trade • Menü geçişlerinde yalnızca kayıt işlerini birleştirir.
   Görsel render fonksiyonlarına dokunmaz; ekran değişimi her zaman anında gerçekleşir. */
(function(){
  'use strict';
  if(window.__eotTransitionPerformance)return;
  window.__eotTransitionPerformance=true;

  let burstUntil=0;
  let burstTimer=0;
  const state=new Map();

  function now(){return performance.now()}
  function inBurst(){return now()<burstUntil}
  function setBusy(v){window.__eotNavigationBusy=!!v}
  window.EOTNavigationBusy=function(){return inBurst()||window.__eotNavigationBusy===true};

  function flushPending(){
    state.forEach(function(s){
      if(!s.pending||!s.original)return;
      s.pending=false;
      const args=s.lastArgs||[];
      const ctx=s.lastThis||window;
      s.lastArgs=null;
      s.lastThis=null;
      try{s.lastResult=s.original.apply(ctx,args)}catch(e){console.warn('Geçiş sonrası kayıt:',s.name,e)}
    });
    setBusy(false);
    try{window.dispatchEvent(new CustomEvent('eot:navigation-settled'))}catch(e){}
  }

  function finishBurst(){
    if(now()<burstUntil){
      clearTimeout(burstTimer);
      burstTimer=setTimeout(finishBurst,Math.max(10,burstUntil-now()+10));
      return;
    }
    const flushWhenSettled=function(){
      if(inBurst()){finishBurst();return;}
      flushPending();
    };
    if('requestIdleCallback' in window)requestIdleCallback(flushWhenSettled,{timeout:350});
    else setTimeout(flushWhenSettled,30);
  }

  // Mobile browsers may suspend timers as soon as the app leaves the foreground.
  // End the burst first so other lifecycle save handlers also write immediately.
  function flushBeforeLeave(){
    clearTimeout(burstTimer);
    burstTimer=0;
    burstUntil=0;
    flushPending();
  }

  function markBurst(){
    burstUntil=now()+140;
    setBusy(true);
    clearTimeout(burstTimer);
    burstTimer=setTimeout(finishBurst,160);
  }

  function wrapPersistence(name){
    const fn=window[name];
    if(typeof fn!=='function'||fn.__eotTransitionPersistenceOnly)return false;
    const s={name:name,original:fn,pending:false,lastArgs:null,lastThis:null,lastResult:undefined};
    state.set(name,s);
    const wrapped=function(){
      if(document.hidden||!inBurst()){
        s.pending=false;
        s.lastArgs=null;
        s.lastThis=null;
        s.lastResult=s.original.apply(this,arguments);
        return s.lastResult;
      }
      s.lastArgs=Array.prototype.slice.call(arguments);
      s.lastThis=this;
      s.pending=true;
      return s.lastResult;
    };
    wrapped.__eotTransitionPersistenceOnly=true;
    wrapped.__eotOriginal=fn;
    window[name]=wrapped;
    return true;
  }

  function install(){['save','simSave','saveOwned','saveDeposits','saveAccountCareer'].forEach(wrapPersistence)}

  window.addEventListener('eot:navigation-intent',markBurst,true);
  window.addEventListener('hashchange',function(){if(!inBurst())markBurst()},true);
  window.addEventListener('pagehide',flushBeforeLeave,true);
  document.addEventListener('visibilitychange',function(){if(document.hidden)flushBeforeLeave()},true);
  window.addEventListener('pageshow',install);
  [0,250,800].forEach(function(ms){setTimeout(install,ms)});
})();
