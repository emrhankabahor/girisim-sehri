/* Empire of Trade • Sabit günlük vadeli hesap döngüsü */
(function(){
  'use strict';
  if(window.__eotDepositCycleEngine)return;
  window.__eotDepositCycleEngine=true;

  var DAY=24*60*60*1000;
  var RATE=0.0099;
  var MAX_OFFLINE_CYCLES=4;
  var TYPE='eot_daily_deposit';
  var processing=false;

  function list(){
    try{if(typeof deposits!=='undefined'&&Array.isArray(deposits))return deposits}catch(e){}
    try{return JSON.parse(localStorage.getItem('gs113_deposits')||'[]')||[]}catch(e){return []}
  }
  function persist(){
    try{if(typeof saveDeposits==='function')saveDeposits();else localStorage.setItem('gs113_deposits',JSON.stringify(list()))}catch(e){}
    try{if(typeof save==='function')save()}catch(e){}
    try{
      if(typeof currentAccount==='function'&&typeof saveAccountCareer==='function'){
        var u=currentAccount();if(u&&u.id&&u.id!=='guest')saveAccountCareer(u.id);
      }
    }catch(e){}
  }
  function notify(){
    try{window.dispatchEvent(new CustomEvent('eot:deposit-updated'))}catch(e){}
  }
  function txAdd(type,total,sym){
    try{if(typeof tx!=='undefined'&&Array.isArray(tx))tx.unshift({t:Date.now(),kind:'deposit',type:type,sym:sym||'Vadeli Hesap',total:Number(total||0)})}catch(e){}
  }
  function account(){return list().find(function(d){return d&&d.type===TYPE})||null}

  function migrateLegacy(){
    var arr=list();
    if(!arr.length||account())return;
    var valid=arr.filter(function(d){return d&&Number(d.amount||0)>0});
    if(!valid.length)return;
    var balance=valid.reduce(function(s,d){return s+Math.max(0,Number(d.amount||0))},0);
    var earned=valid.reduce(function(s,d){return s+Math.max(0,Number(d.earned||0))},0);
    var anchors=valid.map(function(d){var t=Number(d.t||0);if(t)return t;var m=Number(d.maturity||0);return m?m-DAY:0}).filter(Boolean);
    var anchor=anchors.length?Math.min.apply(Math,anchors):Date.now();
    var next=anchor+DAY;
    while(next<=Date.now()-DAY*30)next+=DAY;
    arr.splice(0,arr.length,{
      type:TYPE,amount:balance,rate:0.99,ret:earned,earnedTotal:earned,
      anchorAt:anchor,nextAt:next,maturity:next,t:anchor,lastProcessedAt:Date.now(),cycles:0
    });
    persist();
  }

  function process(now,quiet){
    if(processing)return 0;
    processing=true;
    try{
      now=Number(now||Date.now());
      var a=account();if(!a||Number(a.amount||0)<=0)return 0;
      var next=Number(a.nextAt||a.maturity||0);
      if(!next){next=Number(a.anchorAt||a.t||now)+DAY;a.nextAt=next;a.maturity=next}
      if(now<next)return 0;

      var elapsedCycles=Math.floor((now-next)/DAY)+1;
      var credited=Math.min(MAX_OFFLINE_CYCLES,Math.max(0,elapsedCycles));
      var totalInterest=0;
      for(var i=0;i<credited;i++){
        var interest=Number(a.amount||0)*RATE;
        a.amount=Number(a.amount||0)+interest;
        totalInterest+=interest;
        a.cycles=Number(a.cycles||0)+1;
      }

      a.nextAt=next+(elapsedCycles*DAY);
      a.maturity=a.nextAt;
      a.earnedTotal=Number(a.earnedTotal||0)+totalInterest;
      a.ret=a.earnedTotal;
      a.lastProcessedAt=now;
      if(totalInterest>0)txAdd('deposit_interest',totalInterest,credited+' Gün Vadeli Faiz');
      persist();
      if(totalInterest>0&&!quiet&&typeof toast==='function')toast('Vadeli hesap faizi +₺'+totalInterest.toLocaleString('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:2}));
      notify();
      return credited;
    }finally{processing=false}
  }

  function open24HourDeposit(inputId){
    process(Date.now(),true);
    var el=document.getElementById(inputId),amount=Number(el&&el.value||0);
    if(!Number.isFinite(amount)||amount<=0){if(typeof toast==='function')toast('Geçerli bir tutar gir');return false}
    try{if(typeof cash==='undefined'||Number(cash)<amount){if(typeof toast==='function')toast('Yetersiz nakit');return false}}catch(e){return false}
    var arr=list(),a=account(),now=Date.now();
    try{cash-=amount}catch(e){return false}
    if(!a){
      a={type:TYPE,amount:0,rate:0.99,ret:0,earnedTotal:0,anchorAt:now,nextAt:now+DAY,maturity:now+DAY,t:now,lastProcessedAt:now,cycles:0};
      arr.push(a);
    }
    a.amount=Number(a.amount||0)+amount;
    txAdd('deposit_open',amount,'24 Saatlik Vadeli');
    persist();notify();
    if(el)el.value='';
    if(typeof toast==='function')toast('Tutar vadeli hesaba aktarıldı');
    return true;
  }

  function withdrawAll(){
    process(Date.now(),true);
    var arr=list(),a=account();
    if(!a||Number(a.amount||0)<=0){if(typeof toast==='function')toast('Çekilebilir vadeli bakiye yok');return false}
    var amount=Number(a.amount||0);
    try{cash+=amount}catch(e){return false}
    var i=arr.indexOf(a);if(i>-1)arr.splice(i,1);
    txAdd('deposit_withdraw',amount,'Vadeli Hesap Çekimi');
    persist();notify();
    if(typeof toast==='function')toast('Vadeli hesaptan ₺'+amount.toLocaleString('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:2})+' nakde aktarıldı');
    return true;
  }

  migrateLegacy();
  window.open24HourDeposit=open24HourDeposit;
  window.processMaturedDeposits=function(quiet){return process(Date.now(),quiet!==false)};
  window.withdrawAllDepositsEarly=withdrawAll;
  window.eotProcessDepositCycles=process;

  process(Date.now(),true);
  window.addEventListener('pageshow',function(){process(Date.now(),true)});
  document.addEventListener('visibilitychange',function(){if(!document.hidden)process(Date.now(),true)});
  setInterval(function(){if(!document.hidden)process(Date.now(),true)},60000);
})();