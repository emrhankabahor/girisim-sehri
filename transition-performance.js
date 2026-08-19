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
  }

  function finishBurst(){
    if(now()<burstUntil){
      clearTimeout(burstTimer);
      burstTimer=setTimeout(finishBurst,Math.max(10,burstUntil-now()+10));
      return;
    }
    if('requestIdleCallback' in window)requestIdleCallback(flushPending,{timeout:350});
    else setTimeout(flushPending,30);
  }

  function markBurst(){
    burstUntil=now()+140;
    clearTimeout(burstTimer);
    burstTimer=setTimeout(finishBurst,160);
  }

  function wrapPersistence(name){
    const fn=window[name];
    if(typeof fn!=='function'||fn.__eotTransitionPersistenceOnly)return false;
    const s={name:name,original:fn,pending:false,lastArgs:null,lastThis:null,lastResult:undefined};
    state.set(name,s);
    const wrapped=function(){
      if(!inBurst())return s.original.apply(this,arguments);
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

  function install(){
    /* Render fonksiyonları özellikle sarılmıyor. Yalnızca görünmeyen storage
       işlemleri kısa navigasyon patlamalarında birleştiriliyor. */
    ['save','simSave','saveOwned','saveDeposits','saveAccountCareer'].forEach(wrapPersistence);
  }

  /* Menü click olayını burada ikinci kez dinlemiyoruz.
     bottom-nav-lock tek yönlendirme sahibi ve sadece intent olayı yayınlıyor. */
  window.addEventListener('eot:navigation-intent',markBurst,true);
  window.addEventListener('hashchange',function(){markBurst();setTimeout(install,0)},true);
  window.addEventListener('pageshow',install);

  [0,200,600,1400].forEach(function(ms){setTimeout(install,ms)});
})();
