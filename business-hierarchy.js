/* Empire of Trade • Ana şirket -> işletmeler -> şubeler temel yapısı */
(function(){
  'use strict';
  if(window.__eotBusinessHierarchy)return;
  window.__eotBusinessHierarchy=true;

  const TYPES=[
    {id:'retail',name:'Perakende Mağazası',icon:'🏪',cost:750000},
    {id:'market',name:'Market',icon:'🛒',cost:1000000},
    {id:'restaurant',name:'Restoran',icon:'🍽️',cost:1250000},
    {id:'factory',name:'Fabrika',icon:'🏭',cost:5000000},
    {id:'dealer',name:'Oto Galeri',icon:'🚘',cost:3000000},
    {id:'construction',name:'İnşaat İşletmesi',icon:'🏗️',cost:4000000}
  ];

  function money(n){return '₺'+Math.round(Number(n||0)).toLocaleString('tr-TR')}
  function mainCompany(){
    try{
      if(typeof sim==='undefined'||!sim)return null;
      if(sim.companyProfile&&sim.companyProfile.established)return sim.companyProfile;
      if(Array.isArray(sim.companies))return sim.companies.find(c=>c&&c.isMainCompany)||sim.companies[0]||null;
    }catch(e){}
    return null;
  }
  function businesses(){
    try{
      if(typeof sim==='undefined'||!sim)return [];
      if(!Array.isArray(sim.businesses))sim.businesses=[];
      return sim.businesses;
    }catch(e){return []}
  }
  function cashNow(){try{return typeof cash!=='undefined'?Number(cash||0):0}catch(e){return 0}}
  function persist(){
    try{if(typeof simSave==='function')simSave()}catch(e){}
    try{if(typeof save==='function')save()}catch(e){}
    try{const u=typeof currentAccount==='function'?currentAccount():null;if(u&&u.id&&u.id!=='guest'&&typeof saveAccountCareer==='function')saveAccountCareer(u.id)}catch(e){}
  }

  function ensureStyle(){
    if(document.getElementById('eot-business-hierarchy-style'))return;
    const s=document.createElement('style');s.id='eot-business-hierarchy-style';s.textContent=`
      .eot-bh-wrap{margin:10px 0 22px}.eot-bh-company,.eot-bh-create,.eot-bh-list{border:1px solid rgba(105,167,218,.18);border-radius:20px;background:linear-gradient(145deg,rgba(15,42,67,.96),rgba(8,26,45,.96));padding:15px;margin-bottom:12px}
      .eot-bh-company small,.eot-bh-create p,.eot-bh-empty,.eot-bh-card span{color:#879db2}.eot-bh-company small{font-size:8px;font-weight:900;letter-spacing:.12em}.eot-bh-company h3{margin:5px 0 4px;font-size:16px}.eot-bh-company p{margin:0;color:#91a7bc;font-size:9px}.eot-bh-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-top:12px}.eot-bh-stats div{padding:9px;border-radius:12px;background:rgba(255,255,255,.04)}.eot-bh-stats span{display:block;color:#8298ae;font-size:7px}.eot-bh-stats b{display:block;margin-top:4px;font-size:10px}
      .eot-bh-create h3,.eot-bh-list h3{margin:0;font-size:14px}.eot-bh-create p{font-size:8px;margin:4px 0 10px}.eot-bh-types{display:grid;grid-template-columns:1fr 1fr;gap:8px}.eot-bh-type{border:1px solid rgba(255,255,255,.08);border-radius:14px;background:rgba(255,255,255,.035);color:#fff;padding:11px;text-align:left}.eot-bh-type b{display:block;font-size:10px;margin-top:5px}.eot-bh-type span{display:block;color:#87a0b5;font-size:8px;margin-top:3px}.eot-bh-card{padding:11px 0;border-top:1px solid rgba(255,255,255,.07);display:grid;grid-template-columns:36px 1fr auto;gap:10px;align-items:center}.eot-bh-card:first-of-type{border-top:0}.eot-bh-icon{width:36px;height:36px;border-radius:11px;background:rgba(255,255,255,.05);display:grid;place-items:center}.eot-bh-card b{display:block;font-size:10px}.eot-bh-card span{display:block;font-size:8px;margin-top:3px}.eot-bh-badge{font-size:7px;padding:5px 7px;border-radius:999px;background:rgba(52,211,153,.10);color:#7ee3bd}.eot-bh-empty{font-size:9px;padding-top:10px}
    `;document.head.appendChild(s)
  }

  function createBusiness(typeId){
    const company=mainCompany(),type=TYPES.find(x=>x.id===typeId);if(!company||!type)return false;
    if(cashNow()<type.cost){if(typeof toast==='function')toast('İşletme kurmak için yeterli nakit yok');return false}
    const name=prompt('İşletme adı',company.name+' '+type.name);if(!name||String(name).trim().length<2)return false;
    try{
      cash=Number(cash||0)-type.cost;
      const list=businesses();
      list.push({id:'biz_'+Date.now(),parentCompanyId:company.id||sim.selectedCompanyId||'main',name:String(name).trim(),type:type.id,typeName:type.name,icon:type.icon,city:company.city||company.headquarters?.city||'İstanbul',branches:[{id:'branch_'+Date.now(),name:'Merkez Şube',city:company.city||company.headquarters?.city||'İstanbul',openedAt:Date.now(),active:true}],employees:[],revenue:0,expense:0,profit:0,openedAt:Date.now(),active:true});
      if(typeof tx!=='undefined'&&Array.isArray(tx))tx.unshift({t:Date.now(),kind:'business_foundation',type:type.id,sym:String(name).trim(),total:type.cost});
      persist();
      if(typeof render==='function')render();
      if(typeof renderGameExtras==='function')renderGameExtras();
      render();
      if(typeof toast==='function')toast(String(name).trim()+' kuruldu');
      return true;
    }catch(e){console.warn('İşletme kurulamadı:',e);return false}
  }
  window.eotCreateBusiness=createBusiness;

  function render(){
    ensureStyle();
    const screen=document.getElementById('business');if(!screen)return;
    let wrap=document.getElementById('eotBusinessHierarchy');
    if(!wrap){wrap=document.createElement('section');wrap.id='eotBusinessHierarchy';wrap.className='eot-bh-wrap';const head=screen.querySelector('.panel-head');if(head)head.insertAdjacentElement('afterend',wrap);else screen.prepend(wrap)}
    const company=mainCompany(),list=businesses();
    if(!company){wrap.innerHTML='<div class="eot-bh-company"><h3>Önce ana şirketini kur</h3><p>İşletmeler ana şirketin altında faaliyet gösterir.</p></div>';return}
    const branchCount=list.reduce((n,b)=>n+(Array.isArray(b.branches)?b.branches.length:0),0);
    wrap.innerHTML=`<div class="eot-bh-company"><small>ANA ŞİRKET</small><h3>${company.name||'Şirketim'}</h3><p>${company.legalType||'Şirket'} • ${company.city||company.headquarters?.city||'Türkiye'}</p><div class="eot-bh-stats"><div><span>İŞLETME</span><b>${list.length}</b></div><div><span>ŞUBE</span><b>${branchCount}</b></div><div><span>NAKİT</span><b>${money(cashNow())}</b></div></div></div><div class="eot-bh-create"><h3>Yeni İşletme Kur</h3><p>Ana şirketinin altında yeni bir ticari faaliyet başlat.</p><div class="eot-bh-types">${TYPES.map(t=>`<button class="eot-bh-type" onclick="eotCreateBusiness('${t.id}')"><span>${t.icon}</span><b>${t.name}</b><span>Kuruluş ${money(t.cost)}</span></button>`).join('')}</div></div><div class="eot-bh-list"><h3>İşletmelerim</h3>${list.length?list.map(b=>`<div class="eot-bh-card"><div class="eot-bh-icon">${b.icon||'🏢'}</div><div><b>${b.name}</b><span>${b.typeName||'İşletme'} • ${b.city||'Türkiye'} • ${(b.branches||[]).length} şube</span></div><strong class="eot-bh-badge">AKTİF</strong></div>`).join(''):'<div class="eot-bh-empty">Henüz işletmen yok. İlk işletmeni ana şirketinin altında kur.</div>'}</div>`;
  }

  function schedule(){setTimeout(render,50)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
  window.addEventListener('hashchange',schedule,true);window.addEventListener('pageshow',schedule);
})();