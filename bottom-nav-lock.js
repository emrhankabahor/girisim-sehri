/* Empire of Trade • Alt menüyü ekranın en altında sabitle ve oranla */
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
        width:min(calc(100% - 22px),540px)!important;
        height:76px!important;
        min-height:76px!important;
        padding:7px 8px max(7px,env(safe-area-inset-bottom))!important;
        margin:0!important;
        z-index:2147483000!important;
        display:grid!important;
        grid-template-columns:repeat(5,minmax(0,1fr))!important;
        align-items:stretch!important;
        gap:5px!important;
        border:1px solid rgba(126,167,204,.18)!important;
        border-bottom-left-radius:0!important;
        border-bottom-right-radius:0!important;
        border-top-left-radius:24px!important;
        border-top-right-radius:24px!important;
        background:rgba(8,22,37,.98)!important;
        backdrop-filter:blur(22px)!important;
        -webkit-backdrop-filter:blur(22px)!important;
        box-shadow:0 -10px 35px rgba(0,0,0,.28)!important;
        will-change:transform!important;
      }
      body>.bottom-nav .nav-btn{
        position:relative!important;
        width:100%!important;
        height:100%!important;
        min-width:0!important;
        margin:0!important;
        padding:7px 3px 6px!important;
        border:0!important;
        border-radius:17px!important;
        background:transparent!important;
        color:#8fa6bd!important;
        display:flex!important;
        flex-direction:column!important;
        align-items:center!important;
        justify-content:center!important;
        gap:5px!important;
        font-size:9px!important;
        line-height:1!important;
        font-weight:800!important;
        text-align:center!important;
        white-space:nowrap!important;
        box-shadow:none!important;
        transform:none!important;
      }
      body>.bottom-nav .nav-btn .nav-ico{
        width:28px!important;
        height:28px!important;
        display:grid!important;
        place-items:center!important;
        margin:0!important;
        font-size:22px!important;
        line-height:1!important;
        color:#9eb6cd!important;
      }
      body>.bottom-nav .nav-btn.active{
        background:linear-gradient(180deg,rgba(44,98,153,.34),rgba(27,61,99,.28))!important;
        color:#f5fbff!important;
      }
      body>.bottom-nav .nav-btn.active .nav-ico{color:#d9efff!important}
      body>.bottom-nav .nav-btn:active{transform:scale(.97)!important;background:rgba(96,165,250,.1)!important}
      .app{padding-bottom:calc(102px + env(safe-area-inset-bottom))!important}

      @media(max-width:390px){
        body>.bottom-nav{
          width:calc(100% - 16px)!important;
          height:72px!important;
          min-height:72px!important;
          gap:3px!important;
          padding-left:6px!important;
          padding-right:6px!important;
          border-top-left-radius:22px!important;
          border-top-right-radius:22px!important;
        }
        body>.bottom-nav .nav-btn{font-size:8px!important;gap:4px!important;padding:6px 2px 5px!important}
        body>.bottom-nav .nav-btn .nav-ico{width:25px!important;height:25px!important;font-size:20px!important}
      }
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
