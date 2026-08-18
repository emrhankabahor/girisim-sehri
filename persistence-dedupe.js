/* Empire of Trade • Gereksiz tekrar kayıtlarını birleştirir. */
(function(){
  'use strict';
  if(window.__eotPersistenceDedupe)return;
  window.__eotPersistenceDedupe=true;

  const lastSig={};
  const lastAt={};
  let force=false;

  function json(v){try{return JSON.stringify(v)}catch(e){return String(Date.now())}}
  function sigSave(){try{return json([cash,pf,tx,realized,loans,creditScore,trusts,lateCount])}catch(e){return ''}}
  function sigOwned(){try{return json([ownedAssets,factoryOp,constructionOp,selectedLandId,factoryLevel,reputation,economyState,sim])}catch(e){return ''}}
  function sigSim(){try{return json(sim)}catch(e){return ''}}
  function sigDeposits(){try{return json(deposits)}catch(e){return ''}}
  function sigCareer(id){try{return json([id,cash,pf,tx,realized,loans,creditScore,trusts,lateCount,deposits,ownedAssets,factoryOp,constructionOp,selectedLandId,factoryLevel,reputation,sim])}catch(e){return ''}}

  function wrap(name,signature,minGap){
    try{
      const fn=window[name];
      if(typeof fn!=='function'||fn.__eotPersistenceDedupe)return false;
      const w=function(){
        const s=signature.apply(this,arguments);
        const now=performance.now();
        if(!force&&s&&lastSig[name]===s&&(now-(lastAt[name]||0))<minGap)return;
        lastSig[name]=s;lastAt[name]=now;
        return fn.apply(this,arguments);
      };
      w.__eotPersistenceDedupe=true;
      w.__eotOriginal=fn;
      window[name]=w;
      return true;
    }catch(e){return false}
  }

  function install(){
    wrap('save',sigSave,15000);
    wrap('saveOwned',sigOwned,15000);
    wrap('simSave',sigSim,15000);
    wrap('saveDeposits',sigDeposits,15000);
    wrap('saveAccountCareer',sigCareer,15000);
  }

  function flush(){
    force=true;
    try{
      ['save','saveOwned','simSave','saveDeposits'].forEach(function(name){const fn=window[name];if(typeof fn==='function')try{fn()}catch(e){}});
      try{const u=typeof currentAccount==='function'?currentAccount():null;if(u&&u.id&&u.id!=='guest'&&typeof window.saveAccountCareer==='function')window.saveAccountCareer(u.id)}catch(e){}
    }finally{force=false}
  }

  [0,250,700,1500,3000,6000].forEach(function(ms){setTimeout(install,ms)});
  window.addEventListener('pagehide',flush);
  document.addEventListener('visibilitychange',function(){if(document.visibilityState==='hidden')flush()});
})();
