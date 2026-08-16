/* Empire of Trade V1.70 • Oynanabilirlik Güncellemesi */
(function(){
  const MAX_ACTIVE_LOANS=2;
  function removeGameMonth(){const el=document.getElementById('homeCycle');if(el){const card=el.closest('.home-status-row > div');if(card)card.remove();}}
  function normalizeText(s){return String(s||'').toLocaleLowerCase('tr-TR').replace(/ı/g,'i').replace(/ş/g,'s').replace(/ğ/g,'g').replace(/ü/g,'u').replace(/ö/g,'o').replace(/ç/g,'c').replace(/\s+/g,' ').trim();}
  function featureNodes(){return document.querySelectorAll('a,button,[role="button"],.menu-card,.finance-card,.info-card,.asset-card,.home-main-card,.item-card,.investment-card,.quick-btn,li');}
  function closestFeature(el){return el.closest('.menu-card,.finance-card,.info-card,.asset-card,.home-main-card,.item-card,.investment-card,li')||el;}
  function hideIPO(){featureNodes().forEach(el=>{const t=normalizeText(el.textContent);if(t.includes('halka arz')||t.includes('ipo')){const card=closestFeature(el);card.style.setProperty('display','none','important');card.setAttribute('data-v167-ipo-hidden','1');}});}
  function disableStockResearch(){
    featureNodes().forEach(el=>{
      const t=normalizeText(el.textContent);
      if(t.includes('hisse arastirma')||t.includes('hisse arastir')||t.includes('hisse analizi')){
        const card=closestFeature(el);card.style.setProperty('opacity','.42','important');card.style.setProperty('filter','grayscale(.5)','important');card.style.setProperty('pointer-events','none','important');card.style.setProperty('cursor','not-allowed','important');card.setAttribute('aria-disabled','true');card.setAttribute('data-v167-stock-research-disabled','1');
        if(!card.querySelector('.v167-coming-soon')){const badge=document.createElement('span');badge.className='v167-coming-soon';badge.textContent='Şimdilik Pasif';badge.style.cssText='display:inline-flex;margin-top:7px;padding:4px 7px;border-radius:999px;font-size:7px;font-weight:800;background:rgba(148,163,184,.12);border:1px solid rgba(148,163,184,.18);color:#9fb0c3';card.appendChild(badge);}
      }
    });
  }
  function enforceInvestmentVisibility(){removeGameMonth();hideIPO();disableStockResearch();}
  function parseTRY(v){let s=String(v??'').trim().replace(/₺|\s/g,'');if(!s)return 0;if(s.includes(','))s=s.replace(/\./g,'').replace(',','.');else s=s.replace(/\./g,'');let n=Number(s);return Number.isFinite(n)?n:0}
  function isMoneyInput(el){if(!el||el.tagName!=='INPUT')return false;let key=((el.id||'')+' '+(el.name||'')+' '+(el.placeholder||'')).toLowerCase();return /loanamt|creditamount|capital|sermaye|tutar|amount|price|fiyat|cash|nakit/.test(key)&&!/term|vade|month|ay/.test(key)}

  // Para alanlarında görüntü için binlik nokta kullanmak Number(input.value) kullanan eski oyun işlemlerini bozuyordu.
  // Değer artık daima JavaScript'in doğrudan okuyabileceği sade sayısal biçimde tutulur.
  function prepareMoneyInputs(root=document){
    root.querySelectorAll('input').forEach(el=>{
      if(!isMoneyInput(el)||el.dataset.tryFormat==='2')return;
      el.dataset.tryFormat='2';el.type='text';el.inputMode='decimal';
      const clean=()=>{if(el.value!==''){const n=parseTRY(el.value);el.value=Number.isFinite(n)&&n>0?String(n):''}};
      el.addEventListener('input',()=>{el.value=el.value.replace(/[^0-9,.]/g,'')});
      el.addEventListener('change',clean);el.addEventListener('blur',clean);
      clean();
    })
  }

  function activeLoanCount(){try{return Array.isArray(loans)?loans.filter(l=>!l.closed&&Number(l.remaining||0)>.01).length:0}catch(e){return 0}}
  function blockThirdLoan(){if(activeLoanCount()>=MAX_ACTIVE_LOANS){if(typeof toast==='function')toast('Aktif kredi limitine ulaştın • Aynı anda en fazla 2 kredi kullanabilirsin');return true}return false}
  window.acceptLoan=function(id,name,limit,rate,maxTerm){
    if(blockThirdLoan())return false;
    let requested=parseTRY(document.getElementById('loanamt_'+id)?.value),months=Number(document.getElementById('loanterm_'+id)?.value);
    if(!requested||requested<100000||requested>limit){if(typeof toast==='function')toast('Kredi tutarı geçersiz');return false}
    if(!months||months<1||months>maxTerm||months>6){if(typeof toast==='function')toast('Vade 1-6 ay olmalı');return false}
    let rawTrust=Number(trusts[id]),trust=Number.isFinite(rawTrust)?clamp(rawTrust,0,100):50,assess=creditAssessment(limit,trust),score=Number(assess.score||0),allowed=Math.min(limit,Math.max(100000,Number(assess.limit||0)));
    if(score<25){let reasons=[];if(Number(creditScore)<30)reasons.push('kredi puanı düşük');if(trust<30)reasons.push('banka güveni düşük');if(Number(assess.debtRatio||0)>.65)reasons.push('borç oranı yüksek');if(Number(assess.income||0)<=0)reasons.push('düzenli gelir görünmüyor');if(!reasons.length)reasons.push('genel finansal skor yetersiz');if(typeof toast==='function')toast('Başvuru reddedildi • '+reasons.join(' • '));return false}
    let amount=Math.min(requested,allowed);amount=Math.floor(amount/1000)*1000;if(amount<100000){if(typeof toast==='function')toast('Onaylanan kredi tutarı minimum kullanım tutarının altında');return false}
    let riskPremium=score<40?.9:score<55?.45:score>=80?-.3:0,r=Math.max(.5,rate+riskPremium+(trust>=80?-.2:trust<40?.35:0)+((sim.macro?.rate||42.5)-42.5)/25+currentNews().credit*2),total=amount*(1+(r/100)*months),inst=total/months,d=new Date();d.setMonth(d.getMonth()+1);
    cash+=amount;loans.push({id,name,amount,requestedAmount:requested,approvedLimit:allowed,assessmentScore:score,rate:r,months,total,installment:inst,remaining:total,t:Date.now(),nextDue:d.getTime(),paidCount:0,hadLate:false,closed:false});trusts[id]=clamp(trust+2,0,100);tx.unshift({t:Date.now(),kind:'loan',type:'loan_in',sym:name,total:amount});
    save();if(typeof saveAccountCareer==='function'){try{let u=currentAccount();if(u&&u.id&&u.id!=='guest')saveAccountCareer(u.id)}catch(e){}}render();renderFinanceExtras();renderGameExtras();
    let st=document.getElementById('loanstatus_'+id);if(st)st.innerHTML='✅ Kredi kullanıldı • Banka skoru: <b>'+Math.round(score)+'/100</b> • Onaylanan tutar: <b>'+money(amount)+'</b> • Aylık taksit: <b>'+money(inst)+'</b>';
    if(requested>amount){if(typeof toast==='function')toast('Talebin '+money(requested)+' • Banka '+money(amount)+' onayladı ve bakiyene aktardı')}else if(typeof toast==='function')toast(name+' kredisi hesabına geçti');return true
  };
  const originalBusinessCredit=window.takeBusinessCredit;if(typeof originalBusinessCredit==='function')window.takeBusinessCredit=function(){let el=document.getElementById('businessCreditAmount');if(el)el.value=String(parseTRY(el.value));return originalBusinessCredit.apply(this,arguments)};
  const originalSecuredLoan=window.takeSecuredLoan;if(typeof originalSecuredLoan==='function')window.takeSecuredLoan=function(){if(blockThirdLoan())return false;document.querySelectorAll('input').forEach(el=>{if(isMoneyInput(el)&&el.value)el.value=String(parseTRY(el.value))});return originalSecuredLoan.apply(this,arguments)};
  function addLoanRuleInfo(){const el=document.getElementById('activeLoansList');if(!el||document.getElementById('v167LoanRule'))return;const box=document.createElement('div');box.id='v167LoanRule';box.className='info-card';box.innerHTML='<b>Kredi Politikası</b><p>Aynı anda en fazla <strong>2 aktif kredi</strong> kullanılabilir. Bankalar kredi puanı, gelir, borç oranı, net servet, ödeme geçmişi ve banka güvenini birlikte değerlendirir.</p>';el.parentNode&&el.parentNode.insertBefore(box,el)}
  function updateLoanButtons(){const full=activeLoanCount()>=MAX_ACTIVE_LOANS;document.querySelectorAll('[onclick*="acceptLoan("],[onclick*="takeSecuredLoan("]').forEach(btn=>{if(full){btn.classList.add('v167-loan-limit');btn.title='Aynı anda en fazla 2 aktif kredi'}else{btn.classList.remove('v167-loan-limit');btn.title=''}})}
  const oldRender=window.render;if(typeof oldRender==='function')window.render=function(){const r=oldRender.apply(this,arguments);setTimeout(()=>{enforceInvestmentVisibility();addLoanRuleInfo();updateLoanButtons();prepareMoneyInputs()},0);return r};
  const observer=new MutationObserver(()=>{enforceInvestmentVisibility();prepareMoneyInputs()});observer.observe(document.body,{childList:true,subtree:true});
  window.addEventListener('hashchange',()=>setTimeout(enforceInvestmentVisibility,0));
  setInterval(enforceInvestmentVisibility,1000);
  setTimeout(()=>{enforceInvestmentVisibility();addLoanRuleInfo();updateLoanButtons();prepareMoneyInputs()},100);
})();
