/* Empire of Trade • Ana Sayfa gereksiz panelleri temizleme */
(function(){
  'use strict';
  if(window.__eotHomeCleanup)return;
  window.__eotHomeCleanup=true;

  function cleanup(){
    const goals=document.getElementById('v169Goals');
    if(goals)goals.remove();
  }

  function start(){
    cleanup();
    const home=document.getElementById('home');
    if(!home)return;
    const observer=new MutationObserver(function(){cleanup()});
    observer.observe(home,{childList:true,subtree:true});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
  window.addEventListener('pageshow',cleanup);
  window.addEventListener('hashchange',cleanup,true);
})();