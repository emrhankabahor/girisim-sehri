/* Empire of Trade • Eski şirket portföyü arayüzünü kaldır - hafif sürüm */
(function(){
  'use strict';
  if(window.__eotLegacyCompanyUiCleanup)return;
  window.__eotLegacyCompanyUiCleanup=true;

  function relevant(){const h=String(location.hash||'').toLocaleLowerCase('tr-TR');return h.includes('business')||h.includes('compan')}
  function removeLegacy(){
    const screens=[document.getElementById('business'),document.getElementById('companies')].filter(Boolean);
    screens.forEach(screen=>{
      screen.querySelectorAll('.companies-header-card,.companies-summary').forEach(el=>el.remove());
      const list=screen.querySelector('#companyPortfolioList');
      if(list){const title=list.previousElementSibling;if(title&&title.classList.contains('company-section-title'))title.remove();list.remove()}
    });
  }
  function disableLegacyRenderer(){try{window.renderCompanyPortfolio=function(){if(relevant())removeLegacy()}}catch(e){}}
  let frame=0;function run(force){disableLegacyRenderer();if(!force&&!relevant())return;if(frame)return;frame=requestAnimationFrame(()=>{frame=0;removeLegacy()})}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>run(true),{once:true});else run(true);
  window.addEventListener('hashchange',()=>run(false),true);
  window.addEventListener('pageshow',()=>run(false));
})();