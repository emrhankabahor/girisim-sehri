/* Empire of Trade • Eski şirket portföyü + gereksiz kredi bilgilendirmelerini kaldır */
(function(){
  'use strict';
  if(window.__eotLegacyCompanyUiCleanup)return;
  window.__eotLegacyCompanyUiCleanup=true;

  function relevant(){const h=String(location.hash||'').toLocaleLowerCase('tr-TR');return h.includes('business')||h.includes('compan')||h.includes('credit')||h.includes('ticari')||h.includes('loan')||h.includes('teminat')||h.includes('secured')}
  function normalized(el){return String(el&&el.textContent||'').replace(/\s+/g,' ').trim()}
  function removableCard(el){
    const t=normalized(el);
    if(!t)return false;
    if(t.startsWith('Değerlendirme')&&t.includes('Şirket sermayesi')&&t.includes('kredi puanı')&&t.includes('itibar'))return true;
    if(t.includes('Nasıl çalışır?')&&t.includes('Teminat verdiğin varlığın')&&t.includes('kredi kullanabilirsin')&&t.includes('teminatlı varlık satılamaz'))return true;
    return false;
  }
  function removeCreditInfoCards(root){
    const scope=root&&root.querySelectorAll?root:document;
    scope.querySelectorAll('.info-card,.card,.panel,section,article,div').forEach(el=>{
      if(!removableCard(el))return;
      let card=el;
      while(card.parentElement&&card.parentElement!==document.body){
        const p=card.parentElement;
        const pt=normalized(p);
        if(pt!==normalized(card))break;
        card=p;
      }
      card.remove();
    });
  }
  function removeLegacy(){
    const screens=[document.getElementById('business'),document.getElementById('companies')].filter(Boolean);
    screens.forEach(screen=>{
      screen.querySelectorAll('.companies-header-card,.companies-summary').forEach(el=>el.remove());
      const list=screen.querySelector('#companyPortfolioList');
      if(list){const title=list.previousElementSibling;if(title&&title.classList.contains('company-section-title'))title.remove();list.remove()}
    });
    removeCreditInfoCards(document);
  }
  function disableLegacyRenderer(){try{window.renderCompanyPortfolio=function(){if(relevant())removeLegacy()}}catch(e){}}
  let frame=0;function run(force){disableLegacyRenderer();if(!force&&!relevant())return;if(frame)return;frame=requestAnimationFrame(()=>{frame=0;removeLegacy()})}
  let observer;
  function watch(){
    if(observer||!document.body)return;
    observer=new MutationObserver(mutations=>{
      if(!relevant())return;
      for(const m of mutations){for(const node of m.addedNodes||[]){if(node.nodeType===1){removeCreditInfoCards(node);if(removableCard(node)){node.remove();return}}}}
    });
    observer.observe(document.body,{childList:true,subtree:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{run(true);watch()},{once:true});else{run(true);watch()}
  window.addEventListener('hashchange',()=>run(false),true);
  window.addEventListener('pageshow',()=>run(false));
  document.addEventListener('eot:route-rendered',()=>run(false));
})();
