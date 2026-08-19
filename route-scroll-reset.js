/* Empire of Trade • Tüm ekran geçişlerinde sayfayı en üstten başlat */
(function(){
  'use strict';
  if(window.__eotRouteScrollReset)return;
  window.__eotRouteScrollReset=true;

  try{if('scrollRestoration' in history)history.scrollRestoration='manual'}catch(e){}

  let timer1=0,timer2=0,frame1=0,frame2=0;

  function hardTop(){
    try{window.scrollTo(0,0)}catch(e){}
    try{document.documentElement.scrollTop=0}catch(e){}
    try{document.body.scrollTop=0}catch(e){}
    try{if(document.scrollingElement)document.scrollingElement.scrollTop=0}catch(e){}
  }

  function resetTop(){
    if(frame1)cancelAnimationFrame(frame1);
    if(frame2)cancelAnimationFrame(frame2);
    clearTimeout(timer1);clearTimeout(timer2);
    hardTop();
    frame1=requestAnimationFrame(function(){
      frame1=0;hardTop();
      frame2=requestAnimationFrame(function(){frame2=0;hardTop()});
    });
    timer1=setTimeout(hardTop,70);
    timer2=setTimeout(hardTop,180);
  }

  function isRouteLink(el){
    if(!el||!el.getAttribute)return false;
    const href=String(el.getAttribute('href')||'');
    return /^#[A-Za-z0-9_\-]+$/.test(href);
  }

  document.addEventListener('click',function(e){
    const a=e.target&&e.target.closest?e.target.closest('a[href^="#"]'):null;
    if(isRouteLink(a))resetTop();
  },true);

  window.addEventListener('eot:navigation-intent',resetTop,true);
  window.addEventListener('hashchange',resetTop,true);
  window.addEventListener('popstate',resetTop,true);
  window.addEventListener('pageshow',function(){
    if(location.hash&&location.hash!=='#home')setTimeout(resetTop,0);
  });

  window.EOTResetRouteScroll=resetTop;
})();