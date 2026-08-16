/* Empire of Trade • Banka, kredi ve vadeli hesap güvenlik katmanı */
(function(){
  function fmt(n){try{return '₺'+Number(n||0).toLocaleString('tr-TR',{maximumFractionDigits:2})}catch(e){return '₺0'}}
  function runtimeCash(){try{return typeof cash!=='undefined'&&Number.isFinite(Number(cash))?Number(cash):Number(localStorage.getItem('gs124_cash')||0)}catch(e){return 0}}
  function persistCareer(){
    try{
      if(typeof saveDeposits==='function')saveDeposits();
      if(typeof saveOwned==='function')saveOwned();
      if(typeof save==='function')save();
      if(typeof saveUnifiedState==='function')saveUnifiedState();
      if(typeof currentAccount==='function'&&typeof saveAccountCareer==='function'){
        const u=currentAccount();if(u&&u.id&&u.id!=='guest')saveAccountCareer(u.id);
      }
    }catch(e){console.warn('Finans kaydı tamamlanamadı:',e)}
  }
  function normalizeLoans(){
    try{
      if(typeof loans==='undefined'||!Array.isArray(loans))return;
      loans.forEach(l=>{
        if(!l||typeof l!=='object')return;
        l.amount=Math.max(0,Number(l.amount||0));
        l.remaining=Math.max(0,Number(l.remaining||0));
        l.installment=Math.max(0,Number(l.installment||0));
        l.rate=Math.max(0,Number(l.rate||0));
        l.paidCount=Math.max(0,Number(l.paidCount||0));
        if(!Number.isFinite(Number(l.nextDue||0))||Number(l.nextDue||0)<=0){let d=new Date();d.setMonth(d.getMonth()+1);l.nextDue=d.getTime()}
        if(l.remaining<=.01)l.closed=true;
      });
    }catch(e){}
  }
  function releaseCollateral(loan){
    try{
      if(!loan||!loan.collateralId||typeof ownedAssets==='undefined'||!Array.isArray(ownedAssets))return;
      const a=ownedAssets.find(x=>x&&String(x.id)===String(loan.collateralId));
      if(a)a.collateral=false;
    }catch(e){}
  }
  function patchLoans(){
    try{
      normalizeLoans();
      if(typeof window.payInstallment==='function'&&!window.payInstallment.__eotFinanceSafe){
        const original=window.payInstallment;
        const wrapped=function(i){
          const l=Array.isArray(loans)?loans[i]:null;if(!l||l.closed)return false;
          const beforeCash=runtimeCash(),beforeRemaining=Number(l.remaining||0);
          const r=original.apply(this,arguments);
          normalizeLoans();
          if(l.closed||Number(l.remaining||0)<=.01)releaseCollateral(l);
          if(runtimeCash()!==beforeCash||Number(l.remaining||0)!==beforeRemaining)persistCareer();
          try{renderLoans&&renderLoans();renderFinanceExtras&&renderFinanceExtras()}catch(e){}
          return r;
        };wrapped.__eotFinanceSafe=true;window.payInstallment=wrapped;
      }
      if(typeof window.closeLoan==='function'&&!window.closeLoan.__eotFinanceSafe){
        const original=window.closeLoan;
        const wrapped=function(i){
          const l=Array.isArray(loans)?loans[i]:null;if(!l||l.closed)return false;
          const beforeCash=runtimeCash(),beforeRemaining=Number(l.remaining||0);
          const r=original.apply(this,arguments);
          normalizeLoans();
          if(l.closed||Number(l.remaining||0)<=.01)releaseCollateral(l);
          if(runtimeCash()!==beforeCash||Number(l.remaining||0)!==beforeRemaining)persistCareer();
          try{renderLoans&&renderLoans();renderFinanceExtras&&renderFinanceExtras()}catch(e){}
          return r;
        };wrapped.__eotFinanceSafe=true;window.closeLoan=wrapped;
      }
      if(typeof window.takeSecuredLoan==='function'&&!window.takeSecuredLoan.__eotFinanceSafe){
        const original=window.takeSecuredLoan;
        const wrapped=function(index){
          const a=typeof ownedAssets!=='undefined'&&Array.isArray(ownedAssets)?ownedAssets[index]:null;
          if(!a||a.collateral){if(typeof toast==='function')toast('Varlık teminata uygun değil');return false}
          const before=runtimeCash(),count=Array.isArray(loans)?loans.length:0;
          const r=original.apply(this,arguments);
          if(runtimeCash()>before&&Array.isArray(loans)&&loans.length>count)persistCareer();
          return r;
        };wrapped.__eotFinanceSafe=true;window.takeSecuredLoan=wrapped;
      }
    }catch(e){console.warn('Kredi güvenliği kurulamadı:',e)}
  }
  function normalizeDeposits(){
    try{
      if(typeof deposits==='undefined'||!Array.isArray(deposits))return;
      deposits=deposits.filter(d=>d&&Number.isFinite(Number(d.amount))&&Number(d.amount)>0).map(d=>{
        d.amount=Math.max(0,Number(d.amount||0));d.ret=Math.max(0,Number(d.ret||0));d.rate=Math.max(0,Number(d.rate||0));
        d.months=Math.max(1,Number(d.months||1));d.maturity=Number(d.maturity||0);d.t=Number(d.t||Date.now());
        if(!Number.isFinite(d.maturity)||d.maturity<=0)d.maturity=d.t+d.months*30*86400000;
        return d;
      });
    }catch(e){}
  }
  function claimDeposit(index){
    normalizeDeposits();
    const d=Array.isArray(deposits)?deposits[index]:null;if(!d)return false;
    if(Date.now()<Number(d.maturity||0)){if(typeof toast==='function')toast('Vadeli hesabın vadesi henüz dolmadı');return false}
    const principal=Number(d.amount||0),ret=Number(d.ret||0),total=principal+ret;
    cash=runtimeCash()+total;
    deposits.splice(index,1);
    if(Array.isArray(tx))tx.unshift({t:Date.now(),kind:'deposit',type:'deposit_collect',sym:(d.months||1)+' Ay Vadeli',total});
    persistCareer();
    try{render();renderFinanceExtras&&renderFinanceExtras();renderDeposits&&renderDeposits()}catch(e){}
    if(typeof toast==='function')toast('Vadeli hesap kapandı • +'+fmt(total));
    return true;
  }
  window.collectMaturedDeposit=claimDeposit;
  function patchDeposits(){
    try{
      normalizeDeposits();
      if(typeof window.openDeposit==='function'&&!window.openDeposit.__eotFinanceSafe){
        const original=window.openDeposit;
        const wrapped=function(months,rate,inputId){
          const el=document.getElementById(inputId),raw=String(el&&el.value||'').trim().replace(/\s/g,'').replace(',','.');
          if(el)el.value=raw;
          const beforeCash=runtimeCash(),count=Array.isArray(deposits)?deposits.length:0;
          const r=original.apply(this,arguments);
          normalizeDeposits();
          if(runtimeCash()<beforeCash&&Array.isArray(deposits)&&deposits.length===count+1)persistCareer();
          return r;
        };wrapped.__eotFinanceSafe=true;window.openDeposit=wrapped;
      }
    }catch(e){}
  }
  function refreshDepositUI(){
    try{
      const list=document.getElementById('depositList');if(!list||typeof deposits==='undefined'||!Array.isArray(deposits))return;
      normalizeDeposits();
      if(!deposits.length)return;
      list.innerHTML=deposits.map((d,i)=>{const ready=Date.now()>=Number(d.maturity||0),total=Number(d.amount||0)+Number(d.ret||0);return '<div class="portfolio-row"><div><b>'+d.months+' Ay Vadeli</b><br><span>Vade: '+new Date(d.maturity).toLocaleDateString('tr-TR')+' • %'+String(d.rate).replace('.',',')+'</span></div><div style="text-align:right"><b>'+fmt(d.amount)+'</b><br><span class="profit">+'+fmt(d.ret)+'</span><br><button '+(ready?'':'disabled aria-disabled="true"')+' onclick="window.collectMaturedDeposit('+i+')" style="margin-top:7px;padding:7px 9px;border:0;border-radius:9px;font-size:9px;font-weight:800">'+(ready?'Vade Sonunu Tahsil Et':'Vade Bekleniyor')+'</button><div style="font-size:8px;color:#8ea2ba;margin-top:4px">Vade sonu: '+fmt(total)+'</div></div></div>'}).join('');
    }catch(e){}
  }
  function refresh(){normalizeLoans();normalizeDeposits();patchLoans();patchDeposits();refreshDepositUI()}
  window.addEventListener('pagehide',persistCareer);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)persistCareer();else setTimeout(refresh,80)});
  window.addEventListener('hashchange',()=>setTimeout(refresh,80));
  setInterval(refresh,4000);setTimeout(refresh,600);
})();
