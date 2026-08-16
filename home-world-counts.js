/* Empire of Trade • Ana ekran İş Dünyam sayaç senkronizasyonu */
(function(){
  function norm(v){return String(v||'').trim().toLocaleLowerCase('tr-TR')}
  function runtimeAssets(){
    try{if(typeof ownedAssets!=='undefined'&&Array.isArray(ownedAssets))return ownedAssets}catch(e){}
    try{return JSON.parse(localStorage.getItem('gs117_assets')||localStorage.getItem('gs_owned_assets')||'[]')||[]}catch(e){return []}
  }
  function runtimeCompanies(){
    try{if(typeof sim!=='undefined'&&sim&&Array.isArray(sim.companies))return sim.companies}catch(e){}
    try{const s=JSON.parse(localStorage.getItem('gs132_sim')||'{}');return Array.isArray(s.companies)?s.companies:[]}catch(e){return []}
  }
  function uniqueAssets(list){
    const seen=new Set();
    return (Array.isArray(list)?list:[]).filter((a,i)=>{
      if(!a||typeof a!=='object')return false;
      const key=a.id!=null?'id:'+String(a.id):'row:'+i;
      if(seen.has(key))return false;seen.add(key);return true;
    });
  }
  function countAsset(types){
    const keys=types.map(norm);
    return uniqueAssets(runtimeAssets()).filter(a=>{
      const t=norm(a.type||a.category||a.group||a.kind);
      return keys.some(k=>t===k||t.includes(k));
    }).length;
  }
  function countCompany(sectors){
    const keys=sectors.map(norm),seen=new Set();
    return runtimeCompanies().filter((c,i)=>{
      if(!c||typeof c!=='object'||c.established===false)return false;
      const key=c.id!=null?'id:'+String(c.id):'row:'+i;if(seen.has(key))return false;seen.add(key);
      const s=norm(c.sector||c.type||c.category);
      return keys.some(k=>s===k||s.includes(k));
    }).length;
  }
  function constructionCount(){
    let n=countCompany(['inşaat','insaat']);
    try{if(typeof constructionOp!=='undefined'&&constructionOp&&constructionOp.status&&constructionOp.status!=='idle')n+=1}catch(e){}
    return n;
  }
  function companyValue(){
    try{return runtimeCompanies().reduce((sum,c)=>sum+Math.max(0,Number(c.value||c.companyValue||c.capital||0))+Math.max(0,Number(c.companyCash||0)),0)}catch(e){return 0}
  }
  function money(n){try{return '₺'+Number(n||0).toLocaleString('tr-TR',{maximumFractionDigits:2})}catch(e){return '₺0'}}

  // Finans > Bankacılık: Vadeli Hesap, Bankalar/Kredilerim gibi standart bir menu-card olarak açılır.
  function ensureDepositBankingAction(){
    try{
      const finance=document.getElementById('finance');if(!finance)return;
      const heads=[...finance.querySelectorAll('.section-head')];
      const bankingHead=heads.find(h=>norm(h.textContent).includes('bankacılık')||norm(h.textContent).includes('bankacilik'));
      const grid=bankingHead&&bankingHead.nextElementSibling&&bankingHead.nextElementSibling.classList.contains('menu-grid')?bankingHead.nextElementSibling:finance.querySelector('.menu-grid');
      if(!grid)return;

      const candidates=[...grid.querySelectorAll('.menu-card,a,button')];
      let card=candidates.find(el=>{
        const title=el.querySelector&&el.querySelector('h4');
        const t=norm(title?title.textContent:el.textContent);
        const href=el.getAttribute&&el.getAttribute('href');
        return t==='vadeli hesap'||t==='kredilerimi yönet'||t==='kredilerimi yonet'||t==='kredi kartı'||t==='kredi karti'||href==='#deposits';
      });
      if(!card)return;

      // Kart başka bir render tarafından button/div olarak kurulursa standart menü bağlantısına çevir.
      if(card.tagName!=='A'){
        const a=document.createElement('a');
        a.className=card.className||'menu-card';
        [...card.attributes].forEach(attr=>{if(!['class','onclick'].includes(attr.name))a.setAttribute(attr.name,attr.value)});
        a.innerHTML=card.innerHTML;
        card.replaceWith(a);card=a;
      }
      card.classList.add('menu-card');
      card.setAttribute('href','#deposits');
      card.removeAttribute('onclick');
      card.dataset.eotBankingAction='deposits';
      const icon=card.querySelector('.iconbox'),title=card.querySelector('h4'),desc=card.querySelector('p'),arrow=card.querySelector('.arrow');
      if(icon)icon.textContent='💰';
      if(title)title.textContent='Vadeli Hesap';
      if(desc)desc.textContent='Nakitini vadeli değerlendir.';
      if(arrow)arrow.textContent='›';

      // Aynı kartın başka kopyaları oluşursa tek bir Vadeli Hesap kartı bırak.
      const duplicates=[...grid.querySelectorAll('.menu-card')].filter(el=>el!==card&&(
        norm(el.querySelector('h4')?.textContent)==='vadeli hesap'||el.getAttribute('href')==='#deposits'
      ));
      duplicates.forEach(el=>el.remove());
    }catch(e){console.warn('Vadeli hesap menüsü güncellenemedi:',e)}
  }

  function sync(){
    try{
      const cards=[...document.querySelectorAll('#home .eot-business')];
      if(cards.length){
        const values=[
          countCompany(['mağaza','magaza','perakende','market','dükkan','dukkan']),
          countAsset(['fabrika'])+countCompany(['fabrika','üretim','uretim']),
          constructionCount(),
          countAsset(['araç','arac','otomobil','suv','vehicle']),
          countAsset(['gayrimenkul','emlak','konut','daire','villa','dükkan','dukkan']),
          countAsset(['arsa','arazi','land'])
        ];
        cards.forEach((card,i)=>{const e=card.querySelector('.eot-count');if(e&&Number.isFinite(values[i]))e.textContent=values[i]+' ADET'});
      }
      const stats=[...document.querySelectorAll('#home .eot-profile-stats > div')];
      if(stats[0]){const b=stats[0].querySelector('b,strong');if(b)b.textContent=money(companyValue())}
      ensureDepositBankingAction();
    }catch(e){console.warn('İş Dünyam sayaçları güncellenemedi:',e)}
  }
  window.syncEotBusinessCounts=sync;
  window.ensureDepositBankingAction=ensureDepositBankingAction;

  let menuRefreshQueued=false;
  const observer=new MutationObserver(()=>{
    if(menuRefreshQueued)return;
    menuRefreshQueued=true;
    requestAnimationFrame(()=>{menuRefreshQueued=false;ensureDepositBankingAction()});
  });
  const startObserver=()=>{try{observer.observe(document.body,{childList:true,subtree:true})}catch(e){}};
  if(document.body)startObserver();else document.addEventListener('DOMContentLoaded',startObserver,{once:true});

  window.addEventListener('hashchange',()=>setTimeout(sync,80));
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')setTimeout(sync,80)});
  setInterval(sync,1200);setTimeout(sync,250);setTimeout(sync,1200);
})();
