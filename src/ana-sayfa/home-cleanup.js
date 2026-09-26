/* Empire of Trade • Ana Sayfa gereksiz panelleri temizleme */
(function(){
  'use strict';
  if(window.__eotHomeCleanup)return;
  window.__eotHomeCleanup=true;

  function ensureDailyWealthHistory(){
    if(window.__eotDailyWealthHistory||document.getElementById('eot-daily-wealth-history-loader'))return;
    const s=document.createElement('script');
    s.id='eot-daily-wealth-history-loader';
    s.src='daily-wealth-history.js?v=1&_='+Date.now();
    s.async=true;
    document.head.appendChild(s);
  }

  function cleanup(){
    const goals=document.getElementById('v169Goals');
    if(goals)goals.remove();
  }

  function start(){
    cleanup();
    ensureDailyWealthHistory();
    const home=document.getElementById('home');
    if(!home)return;
    const observer=new MutationObserver(function(){cleanup()});
    observer.observe(home,{childList:true,subtree:true});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
  window.addEventListener('pageshow',()=>{cleanup();ensureDailyWealthHistory()});
  window.addEventListener('hashchange',cleanup,true);
})();