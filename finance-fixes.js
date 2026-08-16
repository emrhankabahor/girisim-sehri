/* Empire of Trade • Banka, kredi ve 24 saatlik vadeli hesap güvenlik katmanı */
(function(){
  const DEPOSIT_RATE=0.99;
  const DEPOSIT_MS=24*60*60*1000;

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
      let changed=false;
      deposits=deposits.filter(d=>d&&Number.isFinite(Number(d.amount))&&Number(d.amount)>0).map(d=>{
        d.amount=Math.max(0,Number(d.amount||0));
        d.t=Number(d.t||Date.now());
        d.rate=DEPOSIT_RATE;
        d.ret=Math.round(d.amount*(DEPOSIT_RATE/100)*100)/100;
        d.maturity=d.t+DEPOSIT_MS;
        d.periodHours=24;
        if(d.months!==undefined){delete d.months;changed=true}
        return d;
      });
      if(changed&&typeof saveDeposits==='function')saveDeposits();
    }catch(e){}
  }

  function processMaturedDeposits(showToast){
    try{
      normalizeDeposits();
      if(typeof deposits==='undefined'||!Array.isArray(deposits)||!deposits.length)return false;
      const now=Date.now();let payout=0,interest=0,changed=false;
      const keep=[];
      deposits.forEach(d=>{
        if(now>=Number(d.maturity||0)){
          const principal=Number(d.amount||0),ret=Number(d.ret||0);
          payout+=principal+ret;interest+=ret;changed=true;
          if(Array.isArray(tx))tx.unshift({t:now,kind:'deposit',type:'deposit_auto_payout',sym:'24 Saat Vadeli',total:principal+ret,interest:ret});
        }else keep.push(d);
      });
      if(!changed)return false;
      deposits=keep;
      cash=runtimeCash()+payout;
      persistCareer();
      try{render();renderFinanceExtras&&renderFinanceExtras();renderDeposits&&renderDeposits()}catch(e){}
      window.dispatchEvent(new CustomEvent('eot:deposit-updated'));
      if(showToast&&typeof toast==='function')toast('24 saatlik vade tamamlandı • '+fmt(payout)+' hesabına aktarıldı');
      return true;
    }catch(e){console.warn('Vadeli hesap aktarımı tamamlanamadı:',e);return false}
  }

  function open24HourDeposit(inputId){
    try{
      processMaturedDeposits(false);
      const el=document.getElementById(inputId);
      const raw=String(el&&el.value||'').trim().replace(/\s/g,'').replace(',','.');
      const amount=Number(raw);
      if(!Number.isFinite(amount)||amount<=0){if(typeof toast==='function')toast('Geçerli bir tutar gir');return false}
      if(runtimeCash()<amount){if(typeof toast==='function')toast('Yetersiz nakit');return false}
      if(typeof deposits==='undefined'||!Array.isArray(deposits))deposits=[];
      const now=Date.now();
      const ret=Math.round(amount*(DEPOSIT_RATE/100)*100)/100;
      cash=runtimeCash()-amount;
      deposits.push({amount,t:now,maturity:now+DEPOSIT_MS,rate:DEPOSIT_RATE,ret,periodHours:24});
      if(Array.isArray(tx))tx.unshift({t:now,kind:'deposit',type:'deposit_open',sym:'24 Saat Vadeli',total:-amount});
      if(el)el.value='';
      persistCareer();
      try{render();renderFinanceExtras&&renderFinanceExtras();renderDeposits&&renderDeposits()}catch(e){}
      window.dispatchEvent(new CustomEvent('eot:deposit-updated'));
      if(typeof toast==='function')toast('Para yatırıldı • 24 saat sonra %0,99 faizle otomatik aktarılacak');
      return true;
    }catch(e){console.warn('Vadeli hesap açılamadı:',e);return false}
  }

  function withdrawAllDepositsEarly(){
    try{
      processMaturedDeposits(false);
      normalizeDeposits();
      if(typeof deposits==='undefined'||!Array.isArray(deposits)||!deposits.length){if(typeof toast==='function')toast('Aktif vadeli hesabın bulunmuyor');return false}
      const principal=deposits.reduce((s,d)=>s+Number(d.amount||0),0);
      deposits=[];
      cash=runtimeCash()+principal;
      if(Array.isArray(tx))tx.unshift({t:Date.now(),kind:'deposit',type:'deposit_early_withdraw',sym:'Vadeli Hesap Erken Çekim',total:principal});
      persistCareer();
      try{render();renderFinanceExtras&&renderFinanceExtras();renderDeposits&&renderDeposits()}catch(e){}
      window.dispatchEvent(new CustomEvent('eot:deposit-updated'));
      if(typeof toast==='function')toast('Para çekildi • Erken çekimde faiz uygulanmadı');
      return true;
    }catch(e){return false}
  }

  window.open24HourDeposit=open24HourDeposit;
  window.withdrawAllDepositsEarly=withdrawAllDepositsEarly;
  window.processMaturedDeposits=processMaturedDeposits;

  function patchDeposits(){
    try{
      normalizeDeposits();
      if(typeof window.openDeposit==='function'&&!window.openDeposit.__eot24Hour){
        const wrapped=function(_months,_rate,inputId){return open24HourDeposit(inputId)};
        wrapped.__eot24Hour=true;
        window.openDeposit=wrapped;
      }
    }catch(e){}
  }

  function hideLegacyDepositList(){
    try{
      const list=document.getElementById('depositList');if(list)list.innerHTML='';
    }catch(e){}
  }
  function loadCareerSafety(){
    if(document.querySelector('script[data-eot-career-safety]'))return;
    const s=document.createElement('script');s.src='career-persistence-fixes.js?v=1&_='+Date.now();s.dataset.eotCareerSafety='1';document.body.appendChild(s);
  }
  function refresh(){normalizeLoans();normalizeDeposits();patchLoans();patchDeposits();processMaturedDeposits(true);hideLegacyDepositList()}
  window.addEventListener('pagehide',persistCareer);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)persistCareer();else setTimeout(refresh,80)});
  window.addEventListener('hashchange',()=>setTimeout(refresh,80));
  setInterval(refresh,30000);setTimeout(refresh,600);setTimeout(loadCareerSafety,900);
})();
