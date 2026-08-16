/* Empire of Trade • Alt menüyü ekranın en altında sabitle */
(function(){
  'use strict';
  if(window.__eotBottomNavLock)return;
  window.__eotBottomNavLock=true;

  function ensureStyle(){
    if(document.getElementById('eot-bottom-nav-lock-style'))return;
    const s=document.createElement('style');
    s.id='eot-bottom-nav-lock-style';
    s.textContent=`
      body>.bottom-nav{
        position:fixed!important;
        left:50%!important;
        right:auto!important;
        top:auto!important;
        bottom:0!important;
        transform:translate3d(-50%,0,0)!important;
        width:min(calc(100% - 24px),556px)!important;
        min-height:70px!important;
        height:auto!important;
        padding:7px 7px max(7px,env(safe-area-inset-bottom))!important;
        margin:0!important;
        z-index:2147483000!important;
        display:grid!important;
        grid-template-columns:repeat(5,1fr)!important;
        gap:4px!important;
        border:1px solid var(--line)!important;
        border-bottom-left-radius:0!important;
        border-bottom-right-radius:0!important;
        border-top-left-radius:23px!important;
        border-top-right-radius:23px!important;
        background:rgba(9,20,34,.97)!important;
        backdrop-filter:blur(20px)!important;
        -webkit-backdrop-filter:blur(20px)!important;
        box-shadow:0 -10px 35px rgba(0,0,0,.32)!important;
        will-change:transform!important;
      }
      .app{padding-bottom:calc(96px + env(safe-area-inset-bottom))!important}
    `;
    document.head.appendChild(s);
  }

  function lock(){
    ensureStyle();
    const nav=document.querySelector('.bottom-nav');
    if(!nav)return;
    if(nav.parentElement!==document.body)document.body.appendChild(nav);
  }

  const observer=new MutationObserver(lock);
  function start(){
    lock();
    observer.observe(document.getElementById('app-root')||document.body,{childList:true,subtree:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
  window.addEventListener('hashchange',lock);
  window.addEventListener('pageshow',lock);
})();
