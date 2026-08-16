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
      html,body{scroll-behavior:auto!important}
      #finance,#profile{
        transform:translateZ(0);
        -webkit-transform:translateZ(0);
        backface-visibility:hidden;
        -webkit-backface-visibility:hidden;
        perspective:1000px;
        -webkit-perspective:1000px;
      }
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
        background:#081625!important;
        backdrop-filter:none!important;
        -webkit-backdrop-filter:none!important;
        box-shadow:0 -6px 18px rgba(0,0,0,.22)!important;
        contain:layout paint!important;
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
        background:rgba(35,75,116,.52)!important;
        color:#f5fbff!important;
      }
      body>.bottom-nav .nav-btn.active .nav-ico{color:#d9efff!important}
      body>.bottom-nav .nav-btn:active{transform:scale(.97)!important;background:rgba(96,165,250,.1)!important}
      .app{padding-bottom:calc(102px + env(safe-area-inset-bottom))!important}
      @media(max-width:390px){
        body>.bottom-nav{width:calc(100% - 16px)!important;height:72px!important;min-height:72px!important;gap:3px!important;padding-left:6px!important;padding-right:6px!important;border-top-left-radius:22px!important;border-top-right-radius:22px!important}
        body>.bottom-nav .nav-btn{font-size:8px!important;gap:4px!important;padding:6px 2px 5px!important}
        body>.bottom-nav .nav-btn .nav-ico{width:25px!important;height:25px!important;font-size:20px!important}
      }
    `;
    document.head.appendChild(s);
  }

  function textOf(btn){return String(btn&&btn.textContent||'').replace(/\s+/g,' ').trim().toLocaleLowerCase('tr-TR')}
  function sectionOf(btn){
    const t=textOf(btn),href=String(btn&&btn.getAttribute('href')||'').replace(/^#/,'');
    if(t.includes('ana sayfa'))return 'home';
    if(t.includes('pazar'))return 'market';
    if(t.includes('işlet'))return 'companies';
    if(t.includes('finans'))return 'finance';
    if(t.includes('profil'))return 'profile';
    return href;
  }
  function belongs(section,current){
    if(section==='home')return current===''||current==='home';
    if(section==='market')return ['market','opportun','land','propert','vehicle'].some(x=>current.includes(x));
    if(section==='companies')return ['compan','business','factory','construction','asset'].some(x=>current.includes(x));
    if(section==='finance')return ['finance','bank','loan','credit','deposit','stock','crypto','gold','investment'].some(x=>current.includes(x));
    if(section==='profile')return ['profile','account','career'].some(x=>current.includes(x));
    return current===section;
  }
  function syncActive(){
    const nav=document.querySelector('.bottom-nav');if(!nav)return;
    const current=(location.hash||'#home').slice(1).toLocaleLowerCase('tr-TR');
    let matched=false;
    nav.querySelectorAll('.nav-btn').forEach(btn=>{const active=!matched&&belongs(sectionOf(btn),current);btn.classList.toggle('active',active);if(active)matched=true});
  }

  let topFrame=0;
  function resetTopOnce(){
    if(topFrame)cancelAnimationFrame(topFrame);
    topFrame=requestAnimationFrame(()=>{
      topFrame=0;
      const scroller=document.scrollingElement||document.documentElement;
      if(scroller&&scroller.scrollTop!==0)scroller.scrollTop=0;
      const app=document.querySelector('.app');
      if(app&&app.scrollTop!==0)app.scrollTop=0;
    });
  }

  function setActiveOnly(btn){
    const nav=btn&&btn.parentElement;
    if(!nav)return;
    nav.querySelectorAll('.nav-btn').forEach(x=>x.classList.toggle('active',x===btn));
  }

  function directMainNavigation(e,btn,section){
    const href=String(btn.getAttribute('href')||('#'+section));
    const targetId=href.startsWith('#')?href.slice(1):section;
    if(targetId&&!document.getElementById(targetId))return false;

    e.preventDefault();
    e.stopImmediatePropagation();
    setActiveOnly(btn);

    const targetHash='#'+targetId;
    if(location.hash===targetHash){
      resetTopOnce();
    }else{
      location.hash=targetId;
    }
    return true;
  }

  function lock(){
    ensureStyle();
    const nav=document.querySelector('.bottom-nav');
    if(!nav)return;
    if(nav.parentElement!==document.body)document.body.appendChild(nav);
    syncActive();
  }

  document.addEventListener('click',e=>{
    const btn=e.target&&e.target.closest?e.target.closest('.bottom-nav .nav-btn'):null;
    if(!btn)return;
    const section=sectionOf(btn);if(!section)return;
    const href=btn.getAttribute('href');

    if(section==='home'||section==='finance'||section==='profile'){
      if(directMainNavigation(e,btn,section))return;
    }

    if(href&&href.startsWith('#')){
      const target=document.getElementById(href.slice(1));
      if(!target){e.preventDefault();return;}
    }
  },true);

  function start(){lock()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
  window.addEventListener('hashchange',()=>{
    syncActive();
    const current=(location.hash||'#home').slice(1).toLocaleLowerCase('tr-TR');
    if(current==='home'||current==='finance'||current==='profile')resetTopOnce();
  });
  window.addEventListener('pageshow',lock);
})();
