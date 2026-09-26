/* Empire of Trade • Ana ekran İş Dünyam sayaç senkronizasyonu - hafif sürüm */
(function(){
  'use strict';
  if(window.__eotHomeWorldCountsLight)return;window.__eotHomeWorldCountsLight=true;
  function norm(v){return String(v||'').trim().toLocaleLowerCase('tr-TR')}
  function route(){return String(location.hash||'#home').slice(1).toLocaleLowerCase('tr-TR')}
  function onHome(){return route()==='home'}
  function onFinance(){const h=route();return ['finance','bank','loan','credit','deposit','stock','crypto','gold','investment'].some(x=>h.includes(x))}
  function runtimeAssets(){try{if(typeof ownedAssets!=='undefined'&&Array.isArray(ownedAssets))return ownedAssets}catch(e){}try{return JSON.parse(localStorage.getItem('gs117_assets')||localStorage.getItem('gs_owned_assets')||'[]')||[]}catch(e){return []}}
  function runtimeCompanies(){try{if(typeof sim!=='undefined'&&sim&&Array.isArray(sim.companies))return sim.companies}catch(e){}try{const s=JSON.parse(localStorage.getItem('gs132_sim')||'{}');return Array.isArray(s.companies)?s.companies:[]}catch(e){return []}}
  function uniqueAssets(list){const seen=new Set();return(Array.isArray(list)?list:[]).filter((a,i)=>{if(!a||typeof a!=='object')return false;const key=a.id!=null?'id:'+String(a.id):'row:'+i;if(seen.has(key))return false;seen.add(key);return true})}
  function countAsset(types){const keys=types.map(norm);return uniqueAssets(runtimeAssets()).filter(a=>{const t=norm(a.type||a.category||a.group||a.kind);return keys.some(k=>t===k||t.includes(k))}).length}
  function countCompany(sectors){const keys=sectors.map(norm),seen=new Set();return runtimeCompanies().filter((c,i)=>{if(!c||typeof c!=='object'||c.established===false)return false;const key=c.id!=null?'id:'+String(c.id):'row:'+i;if(seen.has(key))return false;seen.add(key);const s=norm(c.sector||c.type||c.category);return keys.some(k=>s===k||s.includes(k))}).length}
  function constructionCount(){let n=countCompany(['inşaat','insaat']);try{if(typeof constructionOp!=='undefined'&&constructionOp&&constructionOp.status&&constructionOp.status!=='idle')n+=1}catch(e){}return n}
  function companyValue(){try{return runtimeCompanies().reduce((sum,c)=>sum+Math.max(0,Number(c.value||c.companyValue||c.capital||0))+Math.max(0,Number(c.companyCash||0)),0)}catch(e){return 0}}
  function money(n){try{return'₺'+Number(n||0).toLocaleString('tr-TR',{maximumFractionDigits:2})}catch(e){return'₺0'}}

  function ensureDepositBankingAction(){
    if(!onFinance())return;
    try{
      const finance=document.getElementById('finance');if(!finance)return;
      const heads=[...finance.querySelectorAll('.section-head')];
      const bankingHead=heads.find(h=>norm(h.textContent).includes('bankacılık')||norm(h.textContent).includes('bankacilik'));
      const grid=bankingHead&&bankingHead.nextElementSibling&&bankingHead.nextElementSibling.classList.contains('menu-grid')?bankingHead.nextElementSibling:finance.querySelector('.menu-grid');
      if(!grid)return;
      const candidates=[...grid.querySelectorAll('.menu-card,a,button')];
      let card=candidates.find(el=>{const title=el.querySelector&&el.querySelector('h4');const t=norm(title?title.textContent:el.textContent);const href=el.getAttribute&&el.getAttribute('href');return t==='vadeli hesap'||t==='kredilerimi yönet'||t==='kredilerimi yonet'||t==='kredi kartı'||t==='kredi karti'||href==='#deposits'});
      if(!card)return;
      if(card.tagName!=='A'){
        const a=document.createElement('a');a.className=card.className||'menu-card';[...card.attributes].forEach(attr=>{if(!['class','onclick'].includes(attr.name))a.setAttribute(attr.name,attr.value)});a.innerHTML=card.innerHTML;card.replaceWith(a);card=a;
      }
      card.classList.add('menu-card');card.setAttribute('href','#deposits');card.removeAttribute('onclick');card.dataset.eotBankingAction='deposits';
      const icon=card.querySelector('.iconbox'),title=card.querySelector('h4'),desc=card.querySelector('p'),arrow=card.querySelector('.arrow');if(icon)icon.textContent='💰';if(title)title.textContent='Vadeli Hesap';if(desc)desc.textContent='Nakitini vadeli değerlendir.';if(arrow)arrow.textContent='›';
      [...grid.querySelectorAll('.menu-card')].filter(el=>el!==card&&(norm(el.querySelector('h4')?.textContent)==='vadeli hesap'||el.getAttribute('href')==='#deposits')).forEach(el=>el.remove());
    }catch(e){console.warn('Vadeli hesap menüsü güncellenemedi:',e)}
  }

  function syncHome(){
    if(!onHome()||document.hidden)return;
    try{
      const cards=[...document.querySelectorAll('#home .eot-business')];
      if(cards.length){const values=[countCompany(['mağaza','magaza','perakende','market','dükkan','dukkan']),countAsset(['fabrika'])+countCompany(['fabrika','üretim','uretim']),constructionCount(),countAsset(['araç','arac','otomobil','suv','vehicle']),countAsset(['gayrimenkul','emlak','konut','daire','villa','dükkan','dukkan']),countAsset(['arsa','arazi','land'])];cards.forEach((card,i)=>{const e=card.querySelector('.eot-count');if(e&&Number.isFinite(values[i]))e.textContent=values[i]+' ADET'})}
      const stats=[...document.querySelectorAll('#home .eot-profile-stats > div')];if(stats[0]){const b=stats[0].querySelector('b,strong');if(b)b.textContent=money(companyValue())}
    }catch(e){console.warn('İş Dünyam sayaçları güncellenemedi:',e)}
  }
  function sync(){if(onHome())syncHome();if(onFinance())ensureDepositBankingAction()}
  window.syncEotBusinessCounts=sync;window.ensureDepositBankingAction=ensureDepositBankingAction;

  let frame=0;function schedule(){if(frame)return;frame=requestAnimationFrame(()=>{frame=0;sync()})}
  window.addEventListener('hashchange',schedule,true);
  window.addEventListener('pageshow',schedule);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)schedule()});
  window.addEventListener('eot:navigation-intent',schedule,true);
  /* Sadece ilgili ekran açıkken seyrek doğrulama; sürekli 1.2 sn DOM taraması yok. */
  setInterval(()=>{if(!document.hidden&&(onHome()||onFinance()))schedule()},15000);
  setTimeout(schedule,120);setTimeout(schedule,900);
})();