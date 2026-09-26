/* Empire of Trade • Giriş -> Ana Sayfa görünürlük koruması */
(function(){
  'use strict';
  if(window.__eotHomeEntryGuardLoaded)return;
  window.__eotHomeEntryGuardLoaded=true;

  function onHome(){
    var h=String(location.hash||'#home');
    return h===''||h==='#home';
  }
  function homeReady(){
    var home=document.getElementById('home');
    return !!(home&&home.dataset.eotExact==='1'&&home.querySelector('.eot-ui-dashboard')&&document.querySelector('.topbar .eot-brand'));
  }
  function syncHome(){
    try{if(typeof window.EOTSyncHomeCompanyProfile==='function')window.EOTSyncHomeCompanyProfile()}catch(e){}
    try{if(typeof window.EOTSyncHomeWorldCounts==='function')window.EOTSyncHomeWorldCounts()}catch(e){}
  }
  function hideHome(){
    var home=document.getElementById('home');
    if(home)home.style.setProperty('visibility','hidden','important');
  }
  function showHome(){
    var home=document.getElementById('home');
    if(home)home.style.removeProperty('visibility');
  }
  function afterPaint(fn){
    requestAnimationFrame(function(){requestAnimationFrame(fn)});
  }

  function install(){
    if(typeof window.hideAccountOverlay!=='function'||window.hideAccountOverlay.__eotHomeEntryGuard)return false;
    var original=window.hideAccountOverlay;
    var pending=false;
    var wrapped=function(){
      var ctx=this,args=arguments;
      if(!onHome())return original.apply(ctx,args);
      if(pending)return;
      pending=true;
      hideHome();

      /* Çağıran fonksiyonun render() işlemleri bu call stack içinde arkada tamamlanır.
         Giriş overlay'ini güncel ana ekran hazır olana kadar üstte tut. */
      var started=Date.now();
      function release(){
        syncHome();
        if(!homeReady()&&Date.now()-started<240){
          requestAnimationFrame(release);
          return;
        }
        showHome();
        original.apply(ctx,args);
        pending=false;
      }
      afterPaint(release);
    };
    wrapped.__eotHomeEntryGuard=true;
    wrapped.__eotOriginal=original;
    window.hideAccountOverlay=wrapped;
    return true;
  }

  if(!install()){
    var tries=0,t=setInterval(function(){
      tries++;
      if(install()||tries>=20)clearInterval(t);
    },25);
  }
})();
