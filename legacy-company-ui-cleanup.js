/* Empire of Trade • Eski şirket portföyü + dar kapsamlı kredi bilgi kartı temizliği */
(function(){
  'use strict';
  if(window.__eotLegacyCompanyUiCleanup)return;
  window.__eotLegacyCompanyUiCleanup=true;

  function relevant(){
    const h=String(location.hash||'').toLocaleLowerCase('tr-TR');
    return h.includes('business')||h.includes('compan')||h.includes('credit')||h.includes('ticari')||h.includes('loan')||h.includes('teminat')||h.includes('secured');
  }
  function text(el){return String(el&&el.textContent||'').replace(/\s+/g,' ').trim()}
  function removeCommercialAssessment(){
    document.querySelectorAll('.info-card').forEach(card=>{
      const t=text(card);
      if(t.startsWith('Değerlendirme')&&t.includes('Şirket sermayesi')&&t.includes('kredi puanı')&&t.includes('itibar'))card.remove();
    });
  }
  function removeSecuredLoanInfo(){
    const screen=document.getElementById('secured_loans');
    if(!screen)return;
    screen.querySelectorAll(':scope > .info-card').forEach(card=>{
      const t=text(card);
      if(t.includes('Nasıl çalışır?')&&t.includes('Teminat verdiğin varlığın')&&t.includes('kredi kullanabilirsin')&&t.includes('teminatlı varlık satılamaz'))card.remove();
    });
  }
  function removeLegacyCompanyUi(){
    const screens=[document.getElementById('business'),document.getElementById('companies')].filter(Boolean);
    screens.forEach(screen=>{
      screen.querySelectorAll('.companies-header-card,.companies-summary').forEach(el=>el.remove());
      const list=screen.querySelector('#companyPortfolioList');
      if(list){
        const title=list.previousElementSibling;
        if(title&&title.classList.contains('company-section-title'))title.remove();
        list.remove();
      }
    });
  }
  function run(force){
    if(!force&&!relevant())return;
    removeLegacyCompanyUi();
    removeCommercialAssessment();
    removeSecuredLoanInfo();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>run(true),{once:true});
  else run(true);
  window.addEventListener('hashchange',()=>requestAnimationFrame(()=>run(false)),true);
  window.addEventListener('pageshow',()=>requestAnimationFrame(()=>run(false)));
  document.addEventListener('eot:route-rendered',()=>requestAnimationFrame(()=>run(false)));
})();
