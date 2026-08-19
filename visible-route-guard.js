/* Empire of Trade • Görünmeyen route'larda ağır arka plan renderlarını durdur */
(function(){
  'use strict';
  if(window.__eotVisibleRouteGuard)return;
  window.__eotVisibleRouteGuard=true;

  function route(){return String(location.hash||'#home').toLocaleLowerCase('tr-TR')}
  function matches(words){const h=route();return words.some(x=>h.includes(x))}
  function businessVisible(){return matches(['business','compan','factory','construction','employee','tender','inventory','project','asset'])}
  function economyVisible(){return businessVisible()||matches(['economy','simulation'])}

  function wrap(name,allowed){
    try{
      const fn=window[name];
      if(typeof fn!=='function'||fn.__eotVisibleGuard)return false;
      const wrapped=function(){
        if(document.hidden||!allowed())return false;
        return fn.apply(this,arguments);
      };
      wrapped.__eotVisibleGuard=true;
      wrapped.__eotOriginal=fn;
      window[name]=wrapped;
      return true;
    }catch(e){return false}
  }

  function install(){
    wrap('updateOps',businessVisible);
    wrap('renderEconomy',economyVisible);
    wrap('renderSimulation',economyVisible);
  }

  /* app.js global fonksiyonları yüklenmiş olmalı; birkaç kısa deneme yeterli. */
  let tries=0;
  const timer=setInterval(function(){
    tries++;
    install();
    if((window.updateOps&&window.updateOps.__eotVisibleGuard&&window.renderEconomy&&window.renderEconomy.__eotVisibleGuard&&window.renderSimulation&&window.renderSimulation.__eotVisibleGuard)||tries>=12)clearInterval(timer);
  },250);
  install();

  /* İlgili ekrana girildiğinde süre/durum hemen güncellensin. */
  window.addEventListener('hashchange',function(){
    if(!document.hidden&&businessVisible()){
      requestAnimationFrame(function(){
        try{if(typeof window.updateOps==='function')window.updateOps()}catch(e){}
        try{if(typeof window.renderEconomy==='function')window.renderEconomy()}catch(e){}
        try{if(typeof window.renderSimulation==='function')window.renderSimulation()}catch(e){}
      });
    }
  },true);
})();