/* Empire of Trade • Hızlı menü geçişlerinde tekrar eden işi birleştirir. */
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
      s.lastArgs=null;s.lastThis=null;
      try{s.lastResult=s.original.apply(ctx,args)}catch(e){console.warn('Geçiş sonrası güncelleme:',s.name,e)}
    });
  }

  function finishBurst(){
    if(now()<burstUntil){
      clearTimeout(burstTimer);
      burstTimer=setTimeout(finishBurst,Math.max(20,burstUntil-now()+20));
      return;
    }
    /* Yeni ekran önce çizilsin. Kayıt/render kuyruğunu hemen hashchange içinde değil,
       tarayıcı boş kaldığında tek sefer çalıştır. */
    if('requestIdleCallback' in window){
      requestIdleCallback(flushPending,{timeout:700});
    }else{
      setTimeout(flushPending,80);
    }
  }

  function markBurst(){
    burstUntil=now()+320;
    clearTimeout(burstTimer);
    burstTimer=setTimeout(finishBurst,350);
  }

  function wrapRender(name){
    const fn=window[name];
    if(typeof fn!=='function'||fn.__eotTransitionCoalesced)return false;
    const s={name:name,original:fn,pending:false,lastArgs:null,lastThis:null,lastResult:undefined};
    state.set(name,s);
    const wrapped=function(){
      if(!inBurst())return s.original.apply(this,arguments);
      s.lastArgs=Array.prototype.slice.call(arguments);
      s.lastThis=this;
      s.pending=true;
      return s.lastResult;
    };
    wrapped.__eotTransitionCoalesced=true;
    wrapped.__eotOriginal=fn;
    window[name]=wrapped;
    return true;
  }

  function wrapPersistence(name){
    const fn=window[name];
    if(typeof fn!=='function'||fn.__eotTransitionCoalesced)return false;
    const s={name:name,original:fn,pending:false,lastArgs:null,lastThis:null,lastResult:undefined};
    state.set(name,s);
    const wrapped=function(){
      if(!inBurst())return s.original.apply(this,arguments);
      /* Menü navigasyonu sırasında storage/state snapshot işlemleri kullanıcıya görünür
         bir sonuç üretmez. Son çağrıyı sakla ve geçiş bittikten sonra bir kez uygula. */
      s.lastArgs=Array.prototype.slice.call(arguments);
      s.lastThis=this;
      s.pending=true;
      return s.lastResult;
    };
    wrapped.__eotTransitionCoalesced=true;
    wrapped.__eotOriginal=fn;
    window[name]=wrapped;
    return true;
  }

  function install(){
    ['render','renderSimulation','renderFinanceExtras','renderGameExtras','renderWealth'].forEach(wrapRender);
    ['save','simSave','saveOwned','saveDeposits','saveAccountCareer','captureCareerState'].forEach(wrapPersistence);
  }

  function bind(){
    const nav=document.querySelector('.bottom-nav');
    if(nav&&!nav.dataset.eotTransitionPerf){
      nav.dataset.eotTransitionPerf='2';
      nav.addEventListener('pointerdown',function(e){
        if(e.target.closest('.nav-btn'))markBurst();
      },{capture:true,passive:true});
    }
  }

  [0,150,400,900,1800,3200].forEach(function(ms){setTimeout(function(){install();bind()},ms)});
  window.addEventListener('hashchange',function(){markBurst();setTimeout(install,0)});
  window.addEventListener('pageshow',function(){bind();install()});
})();
