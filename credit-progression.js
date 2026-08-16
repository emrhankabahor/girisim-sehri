/* Empire of Trade • Kredi ilerleme sistemi */
(function(){
  'use strict';
  if(window.__eotCreditProgression)return;
  window.__eotCreditProgression=true;

  const BANK_LIMITS={sehir:5000000,anadolu:8000000,nova:12000000,ticaret:20000000,varlik:50000000,girisim:15000000};
  const fmt=n=>'₺'+Math.max(0,Number(n||0)).toLocaleString('tr-TR',{maximumFractionDigits:0});

  function assetValue(){
    try{return Array.isArray(ownedAssets)?ownedAssets.reduce((s,a)=>s+Math.max(0,Number(a&&a.price||0)),0):0}catch(e){return 0}
  }
  function completedLoans(){
    try{return Array.isArray(loans)?loans.filter(l=>l&&l.closed&&!l.hadLate).length:0}catch(e){return 0}
  }
  function scoreBase(score){
    if(score<40)return 250000;
    if(score<60)return 500000;
    if(score<70)return 1000000;
    if(score<80)return 2500000;
    if(score<90)return 5000000;
    return 10000000;
  }
  function personalLimit(bankId){
    const score=Number(typeof creditScore!=='undefined'?creditScore:50);
    const reputationValue=Number(typeof reputation!=='undefined'?reputation:50);
    const trust=Number(typeof trusts!=='undefined'&&trusts?trusts[bankId]||50:50);
    const assets=assetValue();
    const history=completedLoans();
    const late=Number(typeof lateCount!=='undefined'?lateCount:0);

    let limit=scoreBase(score);
    limit+=Math.min(15000000,assets*.20);
    limit+=Math.min(5000000,history*500000);
    if(reputationValue>=70)limit*=1.10;
    if(reputationValue>=85)limit*=1.10;
    if(trust>=70)limit*=1.10;
    if(trust<40)limit*=.70;
    limit*=Math.max(.35,1-late*.15);

    const bankCap=Number(BANK_LIMITS[bankId]||5000000);
    limit=Math.min(bankCap,limit);
    return Math.max(100000,Math.floor(limit/100000)*100000);
  }
  window.getPersonalCreditLimit=personalLimit;

  function refreshLoanScreens(){
    Object.keys(BANK_LIMITS).forEach(id=>{
      const screen=document.getElementById('loan_'+id);if(!screen)return;
      const approved=personalLimit(id);
      const input=document.getElementById('loanamt_'+id);
      if(input){input.max=String(approved);if(Number(input.value)>approved)input.value=String(approved)}
      const meta=screen.querySelector('.offer-meta');
      if(meta){
        let box=meta.querySelector('[data-eot-approved-limit]');
        if(!box){box=document.createElement('div');box.setAttribute('data-eot-approved-limit','1');meta.prepend(box)}
        box.innerHTML='<span>ONAYLI LİMİTİN</span><b>'+fmt(approved)+'</b>';
      }
      const status=document.getElementById('loanstatus_'+id);
      if(status)status.innerHTML='Kişisel kredi limitin: <b>'+fmt(approved)+'</b> • Kredi puanı, banka güveni, ödeme geçmişi ve varlıkların arttıkça yükselir.';
    });
  }

  function patchAcceptLoan(){
    if(typeof window.acceptLoan!=='function'||window.acceptLoan.__eotProgressive)return;
    const original=window.acceptLoan;
    const wrapped=function(id,name,limit,rate,maxTerm){
      const allowed=personalLimit(id);
      const amount=Number(document.getElementById('loanamt_'+id)?.value||0);
      if(amount>allowed){
        if(typeof toast==='function')toast('Onaylı kredi limitin: '+fmt(allowed));
        if(typeof event!=='undefined'&&event&&event.preventDefault)event.preventDefault();
        return false;
      }
      return original.apply(this,arguments);
    };
    wrapped.__eotProgressive=true;
    window.acceptLoan=wrapped;
  }

  function refresh(){patchAcceptLoan();refreshLoanScreens()}
  window.addEventListener('hashchange',()=>setTimeout(refresh,30));
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)setTimeout(refresh,30)});
  setTimeout(refresh,80);
  setInterval(refresh,3000);
})();
