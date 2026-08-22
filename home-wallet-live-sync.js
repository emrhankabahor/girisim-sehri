/* Empire of Trade • Ana Sayfa üst cüzdan kartlarını anlık senkronla */
(function(){
  'use strict';
  if(window.__eotHomeWalletLiveSync)return;
  window.__eotHomeWalletLiveSync=true;

  let observer=null;
  let frame=0;
  let sources=[];

  function homeVisible(){
    return !document.hidden && String(location.hash||'#home')==='#home';
  }

  function findSources(){
    sources=[...document.querySelectorAll('#home .home-money-grid b')].slice(0,3);
    return sources.length>0;
  }

  function sync(){
    frame=0;
    if(!homeVisible())return;
    if(sources.length<3&&!findSources())return;
    const targets=[document.getElementById('eotCash'),document.getElementById('eotWorth'),document.getElementById('eotFlow')];
    for(let i=0;i<3;i++){
      const src=sources[i],dst=targets[i];
      if(src&&dst&&dst.textContent!==src.textContent)dst.textContent=src.textContent;
    }
  }

  function schedule(){
    if(frame)return;
    frame=requestAnimationFrame(sync);
  }

  function bind(){
    if(observer)observer.disconnect();
    if(!findSources())return false;
    observer=new MutationObserver(schedule);
    sources.forEach(function(src){observer.observe(src,{childList:true,characterData:true,subtree:true})});
    schedule();
    return true;
  }

  function install(){
    if(bind())return;
    let tries=0;
    const timer=setInterval(function(){
      tries++;
      if(bind()||tries>=30)clearInterval(timer);
    },100);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
  window.addEventListener('hashchange',function(){if(String(location.hash||'#home')==='#home'){bind();schedule()}},true);
  window.addEventListener('pageshow',function(){bind();schedule()});
  document.addEventListener('visibilitychange',function(){if(!document.hidden)schedule()});
  ['eot:deposit-updated','eot:navigation-settled','eot:route-rendered'].forEach(function(name){window.addEventListener(name,schedule)});
  window.eotSyncHomeWallet=schedule;
})();
