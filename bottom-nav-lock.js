/* Empire of Trade • Alt menü sabitleme + güvenli tek-yollu yönlendirme */
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
      .screen{animation:none!important;transition:none!important}
      #home,#profile,#finance{scroll-margin-top:220px!important}
      body>.bottom-nav{position:fixed!important;left:50%!important;right:auto!important;top:auto!important;bottom:0!important;transform:translate3d(-50%,0,0)!important;width:min(calc(100% - 22px),540px)!important;height:76px!important;min-height:76px!important;padding:7px 8px max(7px,env(safe-area-inset-bottom))!important;margin:0!important;z-index:2147483000!important;display:grid!important;grid-template-columns:repeat(5,minmax(0,1fr))!important;align-items:stretch!important;gap:5px!important;border:1px solid rgba(126,167,204,.18)!important;border-bottom-left-radius:0!important;border-bottom-right-radius:0!important;border-top-left-radius:24px!important;border-top-right-radius:24px!important;background:#081625!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;box-shadow:0 -4px 12px rgba(0,0,0,.16)!important;contain:layout paint style!important}
      body>.bottom-nav .nav-btn{position:relative!important;width:100%!important;height:100%!important;min-width:0!important;margin:0!important;padding:7px 3px 6px!important;border:0!important;border-radius:17px!important;background:transparent!important;color:#8fa6bd!important;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;gap:5px!important;font-size:9px!important;line-height:1!important;font-weight:800!important;text-align:center!important;white-space:nowrap!important;box-shadow:none!important;transition:none!important;touch-action:manipulation!important;-webkit-tap-highlight-color:transparent!important}
      body>.bottom-nav .nav-btn .nav-ico{width:28px!important;height:28px!important;display:grid!important;place-items:center!important;margin:0!important;font-size:22px!important;line-height:1!important;color:#9eb6cd!important}
      body>.bottom-nav .nav-btn.active{background:rgba(35,75,116,.52)!important;color:#f5fbff!important}
      body>.bottom-nav .nav-btn.active .nav-ico{color:#d9efff!important}
      .app{padding-bottom:calc(102px + env(safe-area-inset-bottom))!important}
      @media(max-width:390px){body>.bottom-nav{width:calc(100% - 16px)!important;height:72px!important;min-height:72px!important;gap:3px!important;padding-left:6px!important;padding-right:6px!important}body>.bottom-nav .nav-btn{font-size:8px!important;gap:4px!important;padding:6px 2px 5px!important}body>.bottom-nav .nav-btn .nav-ico{width:25px!important;height:25px!important;font-size:20px!important}}
    `;
    document.head.appendChild(s);
  }

  function ensureTransitionPerformance(){
    if(window.__eotTransitionPerformance||document.getElementById('eot-transition-performance-loader'))return;
    const sc=document.createElement('script');
    sc.id='eot-transition-performance-loader';
    sc.src='transition-performance.js?v=2&_='+Date.now();
    sc.async=true;
    document.head.appendChild(sc);
  }
  function ensurePersistenceDedupe(){
    if(window.__eotPersistenceDedupe||document.getElementById('eot-persistence-dedupe-loader'))return;
    const sc=document.createElement('script');
    sc.id='eot-persistence-dedupe-loader';
    sc.src='persistence-dedupe.js?v=1&_='+Date.now();
    sc.async=true;
    document.head.appendChild(sc);
  }

  function textOf(btn){return String(btn&&btn.textContent||'').replace(/\s+/g,' ').trim().toLocaleLowerCase('tr-TR')}
  function sectionOf(btn){
    const t=textOf(btn);
    if(t.includes('ana sayfa'))return'home';
    if(t.includes('pazar'))return'market';
    if(t.includes('işlet'))return'business';
    if(t.includes('finans'))return'finance';
    if(t.includes('profil'))return'profile';
    return 'home';
  }
  function belongs(section,current){
    if(section==='home')return current===''||current==='home';
    if(section==='market')return['market','opportun','dynamic_market','land','estate','propert','vehicle','cars'].some(x=>current.includes(x));
    if(section==='business')return['compan','business','factory','construction','asset','employee','tender','inventory'].some(x=>current.includes(x));
    if(section==='finance')return['finance','bank','loan','credit','deposit','stock','crypto','gold','investment','ipo'].some(x=>current.includes(x));
    if(section==='profile')return['profile','account','career','garage','mission','wealth','transaction','myassets'].some(x=>current.includes(x));
    return false;
  }
  function syncActive(){
    const current=(location.hash||'#home').slice(1).toLocaleLowerCase('tr-TR');
    const nav=document.querySelector('.bottom-nav');if(!nav)return;
    let matched=false;
    nav.querySelectorAll('.nav-btn').forEach(btn=>{
      const active=!matched&&belongs(sectionOf(btn),current);
      if(btn.classList.contains('active')!==active)btn.classList.toggle('active',active);
      if(active)matched=true;
    });
    if(!matched){
      const home=[...nav.querySelectorAll('.nav-btn')].find(btn=>sectionOf(btn)==='home');
      if(home&&current==='home')home.classList.add('active');
    }
  }
  function targetFor(btn){
    const href=String(btn&&btn.getAttribute('href')||'');
    if(/^#[A-Za-z0-9_\-]+$/.test(href))return href;
    return '#'+sectionOf(btn);
  }
  function bindFastNavigation(){
    const nav=document.querySelector('.bottom-nav');if(!nav||nav.dataset.eotFastNav==='2')return;
    nav.dataset.eotFastNav='2';

    /* Aktif sekmeyi pointerdown'da değiştirmiyoruz. Kaynak her zaman gerçek hash.
       Böylece dokunma iptal edilirse Pazar seçili / İşletmeler açık gibi sahte durum oluşmaz. */
    nav.addEventListener('click',function(e){
      const btn=e.target.closest('.nav-btn');
      if(!btn||!nav.contains(btn))return;
      const target=targetFor(btn);
      e.preventDefault();
      e.stopPropagation();
      if((location.hash||'#home')!==target)location.hash=target;
      syncActive();
    },true);
  }
  function lock(){
    ensureStyle();
    ensureTransitionPerformance();
    ensurePersistenceDedupe();
    const nav=document.querySelector('.bottom-nav');if(!nav)return;
    if(nav.parentElement!==document.body)document.body.appendChild(nav);
    bindFastNavigation();
    syncActive();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',lock,{once:true});else lock();
  window.addEventListener('hashchange',syncActive,true);
  window.addEventListener('popstate',syncActive,true);
  window.addEventListener('pageshow',lock);
})();
