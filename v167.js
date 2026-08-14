/* Girişim Şehri V1.67 • Oynanabilirlik Güncellemesi */
(function(){
  const MAX_ACTIVE_LOANS=2;

  function activeLoanCount(){
    try{return Array.isArray(loans)?loans.filter(l=>!l.closed&&Number(l.remaining||0)>.01).length:0}catch(e){return 0}
  }
  function blockThirdLoan(){
    if(activeLoanCount()>=MAX_ACTIVE_LOANS){
      if(typeof toast==='function')toast('Aktif kredi limitine ulaştın • Aynı anda en fazla 2 kredi kullanabilirsin');
      return true;
    }
    return false;
  }

  window.acceptLoan=function(id,name,limit,rate,maxTerm){
    if(blockThirdLoan())return false;

    let requested=Number(document.getElementById('loanamt_'+id)?.value),months=Number(document.getElementById('loanterm_'+id)?.value);
    if(!requested||requested<100000||requested>limit){
      if(typeof toast==='function')toast('Kredi tutarı geçersiz');
      return false;
    }
    if(!months||months<1||months>maxTerm||months>6){
      if(typeof toast==='function')toast('Vade 1-6 ay olmalı');
      return false;
    }

    let rawTrust=Number(trusts[id]);
    let trust=Number.isFinite(rawTrust)?clamp(rawTrust,0,100):50;
    let assess=creditAssessment(limit,trust);
    let score=Number(assess.score||0);
    let allowed=Math.min(limit,Math.max(100000,Number(assess.limit||0)));

    /* Tek bir düşük değere göre otomatik red yok. Toplam finansal skor kullanılır. */
    if(score<25){
      let reasons=[];
      if(Number(creditScore)<30)reasons.push('kredi puanı düşük');
      if(trust<30)reasons.push('banka güveni düşük');
      if(Number(assess.debtRatio||0)>.65)reasons.push('borç oranı yüksek');
      if(Number(assess.income||0)<=0)reasons.push('düzenli gelir görünmüyor');
      if(!reasons.length)reasons.push('genel finansal skor yetersiz');
      if(typeof toast==='function')toast('Başvuru reddedildi • '+reasons.join(' • '));
      return false;
    }

    let amount=Math.min(requested,allowed);
    amount=Math.floor(amount/1000)*1000;
    if(amount<100000){
      if(typeof toast==='function')toast('Onaylanan kredi tutarı minimum kullanım tutarının altında');
      return false;
    }

    let riskPremium=score<40?.9:score<55?.45:score>=80?-.3:0;
    let r=Math.max(.5,rate+riskPremium+(trust>=80?-.2:trust<40?.35:0)+((sim.macro?.rate||42.5)-42.5)/25+currentNews().credit*2);
    let total=amount*(1+(r/100)*months),inst=total/months,d=new Date();d.setMonth(d.getMonth()+1);

    cash+=amount;
    loans.push({id,name,amount,requestedAmount:requested,approvedLimit:allowed,assessmentScore:score,rate:r,months,total,installment:inst,remaining:total,t:Date.now(),nextDue:d.getTime(),paidCount:0,hadLate:false,closed:false});
    trusts[id]=clamp(trust+2,0,100);
    tx.unshift({t:Date.now(),kind:'loan',type:'loan_in',sym:name,total:amount});

    save();
    if(typeof saveAccountCareer==='function'){
      try{let u=currentAccount();if(u&&u.id&&u.id!=='guest')saveAccountCareer(u.id)}catch(e){}
    }
    render();renderFinanceExtras();renderGameExtras();

    let st=document.getElementById('loanstatus_'+id);
    if(st)st.innerHTML='✅ Kredi kullanıldı • Banka skoru: <b>'+Math.round(score)+'/100</b> • Onaylanan tutar: <b>'+money(amount)+'</b> • Aylık taksit: <b>'+money(inst)+'</b>';
    let title=document.getElementById('loan_success_'+id+'_title');
    let text=document.getElementById('loan_success_'+id+'_text');
    let detail=document.getElementById('loan_success_'+id+'_detail');
    if(title)title.textContent='✅ Kredi hesabına geçti';
    if(text)text.textContent=money(amount)+' nakit bakiyene eklendi.';
    if(detail)detail.innerHTML='Banka skoru: <b>'+Math.round(score)+'/100</b> • Yeni nakit: <b>'+money(cash)+'</b> • Aylık taksit: <b>'+money(inst)+'</b> • Toplam geri ödeme: <b>'+money(total)+'</b>';

    if(requested>amount){
      if(typeof toast==='function')toast('Talebin '+money(requested)+' • Banka '+money(amount)+' onayladı ve bakiyene aktardı');
    }else if(typeof toast==='function'){
      toast(name+' kredisi hesabına geçti');
    }
    return true;
  };

  const originalSecuredLoan=window.takeSecuredLoan;
  if(typeof originalSecuredLoan==='function'){
    window.takeSecuredLoan=function(){
      if(blockThirdLoan())return false;
      return originalSecuredLoan.apply(this,arguments);
    };
  }

  function addLoanRuleInfo(){
    const targets=['activeLoansList'];
    targets.forEach(id=>{
      const el=document.getElementById(id);if(!el||document.getElementById('v167LoanRule'))return;
      const box=document.createElement('div');box.id='v167LoanRule';box.className='info-card';
      box.innerHTML='<b>Kredi Politikası</b><p>Aynı anda en fazla <strong>2 aktif kredi</strong> kullanılabilir. Bankalar kredi puanı, gelir, borç oranı, net servet, ödeme geçmişi ve banka güvenini birlikte değerlendirir.</p>';
      el.parentNode&&el.parentNode.insertBefore(box,el);
    });
  }

  function updateLoanButtons(){
    const full=activeLoanCount()>=MAX_ACTIVE_LOANS;
    document.querySelectorAll('[onclick*="acceptLoan("],[onclick*="takeSecuredLoan("]').forEach(btn=>{
      btn.dataset.v167Original=btn.dataset.v167Original||btn.textContent;
      if(full){btn.classList.add('v167-loan-limit');btn.title='Aynı anda en fazla 2 aktif kredi';}
      else{btn.classList.remove('v167-loan-limit');btn.title='';}
    });
  }

  const oldRender=window.render;
  if(typeof oldRender==='function')window.render=function(){const r=oldRender.apply(this,arguments);setTimeout(()=>{addLoanRuleInfo();updateLoanButtons()},0);return r};
  setTimeout(()=>{addLoanRuleInfo();updateLoanButtons()},300);
})();
