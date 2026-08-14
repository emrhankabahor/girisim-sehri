/* Yatırım görünürlük yaması — özellik kodları silinmez, yalnızca arayüzden gizlenir. */
(function(){
  function norm(s){return String(s||'').toLocaleLowerCase('tr-TR').replace(/ı/g,'i').replace(/ş/g,'s').replace(/ğ/g,'g').replace(/ü/g,'u').replace(/ö/g,'o').replace(/ç/g,'c').replace(/\s+/g,' ').trim()}
  function hideStockResearch(){
    document.querySelectorAll('a,button,[role="button"],.menu-card,.finance-card,.info-card,.asset-card,.home-main-card,.item-card,.investment-card,.quick-btn,li').forEach(el=>{
      const t=norm(el.textContent);
      if(t.includes('hisse arastirma')||t.includes('hisse arastir')||t.includes('hisse analizi')){
        const card=el.closest('.menu-card,.finance-card,.info-card,.asset-card,.home-main-card,.item-card,.investment-card,li')||el;
        card.style.setProperty('display','none','important');
        card.setAttribute('data-stock-research-hidden','1');
      }
    });
  }
  const obs=new MutationObserver(hideStockResearch);
  obs.observe(document.body,{childList:true,subtree:true});
  window.addEventListener('hashchange',()=>setTimeout(hideStockResearch,0));
  setInterval(hideStockResearch,1000);
  setTimeout(hideStockResearch,0);
})();
