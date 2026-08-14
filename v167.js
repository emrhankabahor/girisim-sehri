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

  const originalAcceptLoan=window.acceptLoan;
  if(typeof originalAcceptLoan==='function'){
    window.acceptLoan=function(){
      if(blockThirdLoan())return false;
      return originalAcceptLoan.apply(this,arguments);
    };
  }

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
