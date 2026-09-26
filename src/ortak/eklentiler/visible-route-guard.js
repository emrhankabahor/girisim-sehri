/* Empire of Trade • Görünmeyen route'larda ağır arka plan renderlarını durdur */
(function(){
  'use strict';
  if(window.__eotVisibleRouteGuard)return;
  window.__eotVisibleRouteGuard=true;

  function route(){return String(location.hash||'#home').toLocaleLowerCase('tr-TR')}
  function has(words){const h=route();return words.some(x=>h.includes(x))}
  function opsVisible(){return has(['business','compan','factory','construction'])}
  function simulationVisible(){return has(['business','compan','employee','tender','inventory','simulation'])}
  function economyVisible(){return has(['economy','simulation'])}

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
    wrap('updateOps',opsVisible);
    wrap('renderEconomy',economyVisible);
    wrap('renderSimulation',simulationVisible);
  }

  let tries=0;
  const timer=setInterval(function(){
    tries++;
    install();
    if((window.updateOps&&window.updateOps.__eotVisibleGuard&&window.renderEconomy&&window.renderEconomy.__eotVisibleGuard&&window.renderSimulation&&window.renderSimulation.__eotVisibleGuard)||tries>=12)clearInterval(timer);
  },250);
  install();

  let refreshToken=0;
  let idleId=0;
  function cancelPending(){
    refreshToken++;
    if(idleId&&'cancelIdleCallback' in window){try{cancelIdleCallback(idleId)}catch(e){}idleId=0}
  }
  function refreshAfterPaint(){
    cancelPending();
    if(document.hidden)return;
    const token=refreshToken;
    const run=function(){
      idleId=0;
      if(token!==refreshToken||document.hidden)return;
      try{if(opsVisible()&&typeof window.updateOps==='function')window.updateOps()}catch(e){}
      try{if(simulationVisible()&&typeof window.renderSimulation==='function')window.renderSimulation()}catch(e){}
      try{if(economyVisible()&&typeof window.renderEconomy==='function')window.renderEconomy()}catch(e){}
    };
    requestAnimationFrame(function(){
      if(token!==refreshToken)return;
      if('requestIdleCallback' in window)idleId=requestIdleCallback(run,{timeout:300});
      else setTimeout(run,60);
    });
  }

  window.addEventListener('hashchange',refreshAfterPaint,true);
  window.addEventListener('pageshow',refreshAfterPaint);
})();