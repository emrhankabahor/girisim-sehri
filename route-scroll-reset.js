/* Empire of Trade • Tüm ekran geçişlerinde hafif tek-kare scroll sıfırlama */
(function(){
  'use strict';
  if(window.__eotRouteScrollReset)return;
  window.__eotRouteScrollReset=true;

  try{if('scrollRestoration' in history)history.scrollRestoration='manual'}catch(e){}

  let frame=0;
  function hardTop(){
    try{
      const scroller=document.scrollingElement||document.documentElement;
      if(scroller&&scroller.scrollTop!==0)scroller.scrollTop=0;
      else if(!scroller&&window.scrollY!==0)window.scrollTo(0,0);
    }catch(e){try{window.scrollTo(0,0)}catch(_){} }
  }
  function resetTop(){
    if(frame)return;
    frame=requestAnimationFrame(function(){frame=0;hardTop()});
  }

  /* Yeni route için hashchange tek kaynak. Böylece click + intent + hashchange
     aynı geçişte üç ayrı layout/scroll işi başlatmaz. */
  window.addEventListener('hashchange',resetTop,true);
  window.addEventListener('popstate',resetTop,true);

  /* Kullanıcı zaten açık olan aynı route'a tekrar dokunursa hashchange oluşmaz. */
  window.addEventListener('eot:navigation-intent',function(e){
    const target=e&&e.detail?String(e.detail.target||''):'';
    const current=location.hash||'#home';
    if(target&&target===current)resetTop();
  },true);

  window.addEventListener('pageshow',function(){if(location.hash&&location.hash!=='#home')resetTop()});
  window.EOTResetRouteScroll=resetTop;
})();