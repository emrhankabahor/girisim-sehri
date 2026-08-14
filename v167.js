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

    let trust=Number(trusts[id]||50),assess=creditAssessment(limit,trust),allowed=Math.min(limit,Math.max(250000,Number(assess.limit||0)));
    if(creditScore<20||trust<20||allowed<100000){
      if(typeof toast==='function')toast('Kredi başvurun banka kriterlerini karşılamıyor');
      return false;
    }

    let amount=Math.min(requested,allowed);
    amount=Math.floor(amount/1000)*1000;
    if(amount<100000){
      if(typeof toast==='function')toast('Onaylanan kredi tutarı minimum kullanım tutarının altında');
      return false;
    }

    let r=Math.max(.5,rate+(creditScore<40?.6:creditScore>=80?-.3:0)+(trust>=80?-.2:trust<40?.4:0)+((sim.macro?.rate||42.5)-42.5)/25+currentNews().credit*2);
    let total=amount*(1+(r/100)*months),inst=total/months,d=new Date();d.setMonth(d.getMonth()+1);

    cash+=amount;
    loans.push({id,name,amount,requestedAmount:requested,approvedLimit:allowed,rate:r,months,total,installment:inst,remaining:total,t:Date.now(),nextDue:d.getTime(),paidCount:0,hadLate:false,closed:false});
    trusts[id]=clamp(trust+2,0,100);
    tx.unshift({t:Date.now(),kind:'loan',type:'loan_in',sym:name,total:amount});

    save();
    if(typeof saveAccountCareer==='function'){
      try{let u=currentAccount();if(u&&u.id&&u.id!=='guest')saveAccountCareer(u.id)}catch(e){}
    }
    render();renderFinanceExtras();renderGameExtras();

    let st=document.getElementById('loanstatus_'+id);
    if(st)st.innerHTML='✅ Kredi kullanıldı • Onaylanan tutar: <b>'+money(amount)+'</b> • Aylık taksit: <b>'+money(inst)+'</b> • Toplam geri ödeme: <b>'+money(total)+'</b>';
    let title=document.getElementById('loan_success_'+id+'_title');
    let text=document.getElementById('loan_success_'+id+'_text');
    let detail=document.getElementById('loan_success_'+id+'_detail');
    if(title)title.textContent='✅ Kredi hesabına geçti';
    if(text)text.textContent=money(amount)+' nakit bakiyene eklendi.';
    if(detail)detail.innerHTML='Yeni nakit bakiyesi: <b>'+money(cash)+'</b> • Aylık taksit: <b>'+money(inst)+'</b> • Toplam geri ödeme: <b>'+money(total)+'</b>';

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
      box.innerHTML='<b>Kredi Politikası</b><p>Aynı anda en fazla <strong>2 aktif kredi</strong> kullanılabilir. Bir kredi tamamen kapandığında yeni başvuru hakkı açılır. Teminatlı krediler de bu sınıra dahildir.</p>';
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
