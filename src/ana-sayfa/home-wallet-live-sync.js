/* Empire of Trade • Ana Sayfa üst cüzdan kartlarını doğrudan oyun state'inden anlık senkronla */
(function(){
  'use strict';
  if(window.__eotHomeWalletLiveSync)return;
  window.__eotHomeWalletLiveSync=true;

  let frame=0;

  function homeVisible(){
    return !document.hidden && String(location.hash||'#home')==='#home';
  }

  function fmt(v){
    try{if(typeof money==='function')return money(Number(v||0))}catch(e){}
    return '₺'+Number(v||0).toLocaleString('tr-TR',{minimumFractionDigits:0,maximumFractionDigits:2});
  }

  function stateValues(){
    let cashVal=0,worthVal=0,flowVal=0;
    try{cashVal=Number(cash||0)}catch(e){}
    try{
      const inv=Number(stats('stock').value||0)+Number(stats('crypto').value||0)+Number(stats('gold').value||0);
      const assets=Number(ownedValue()||0);
      const depositsVal=Number(depositStats().total||0);
      const debtVal=Number(debt()||0);
      worthVal=cashVal+inv+assets+depositsVal-debtVal;
    }catch(e){
      const legacy=document.getElementById('homeNetWorth');
      if(legacy){const n=Number(String(legacy.textContent||'').replace(/[^0-9,-]/g,'').replace(/\./g,'').replace(',','.'));if(Number.isFinite(n))worthVal=n}
    }
    try{flowVal=Number(operatingStats().net||0)}catch(e){
      const legacy=document.getElementById('homeCashflow');
      if(legacy){const n=Number(String(legacy.textContent||'').replace(/[^0-9,-]/g,'').replace(/\./g,'').replace(',','.'));if(Number.isFinite(n))flowVal=n}
    }
    return [cashVal,worthVal,flowVal];
  }

  function syncNow(force){
    frame=0;
    if(!force&&!homeVisible())return;
    const values=stateValues();
    const targets=[document.getElementById('eotCash'),document.getElementById('eotWorth'),document.getElementById('eotFlow')];
    for(let i=0;i<targets.length;i++){
      const el=targets[i];if(!el)continue;
      const text=fmt(values[i]);
      if(el.textContent!==text)el.textContent=text;
    }
  }

  function schedule(force){
    if(frame)return;
    frame=requestAnimationFrame(function(){syncNow(!!force)});
  }

  function wrapRender(){
    try{
      const fn=window.render;
      if(typeof fn!=='function'||fn.__eotHomeWalletWrapped)return false;
      const wrapped=function(){
        const out=fn.apply(this,arguments);
        if(homeVisible())syncNow(false);
        return out;
      };
      wrapped.__eotHomeWalletWrapped=true;
      wrapped.__eotOriginal=fn;
      window.render=wrapped;
      return true;
    }catch(e){return false}
  }

  function install(){
    wrapRender();
    syncNow(true);
    let tries=0;
    const timer=setInterval(function(){
      tries++;
      if(wrapRender()||tries>=20)clearInterval(timer);
    },100);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
  window.addEventListener('hashchange',function(){if(String(location.hash||'#home')==='#home')schedule(true)},true);
  window.addEventListener('pageshow',function(){wrapRender();schedule(true)});
  document.addEventListener('visibilitychange',function(){if(!document.hidden)schedule(true)});
  ['eot:deposit-updated','eot:navigation-settled','eot:route-rendered'].forEach(function(name){window.addEventListener(name,function(){schedule(false)})});
  window.eotSyncHomeWallet=function(){syncNow(true)};
})();
