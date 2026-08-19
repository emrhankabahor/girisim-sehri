/* Empire of Trade • Eski şirket portföyü arayüzünü kaldır */
(function(){
  'use strict';
  if(window.__eotLegacyCompanyUiCleanup)return;
  window.__eotLegacyCompanyUiCleanup=true;

  function removeLegacy(){
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

  /* app.js içinde kalan eski render fonksiyonunu etkisizleştir; veri modeli korunur. */
  function disableLegacyRenderer(){
    try{window.renderCompanyPortfolio=function(){removeLegacy()}}catch(e){}
  }

  function run(){removeLegacy();disableLegacyRenderer();setTimeout(removeLegacy,0);setTimeout(removeLegacy,120)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
  window.addEventListener('hashchange',run,true);
  window.addEventListener('pageshow',run);
})();