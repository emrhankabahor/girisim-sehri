/* Empire of Trade • Ana şirket -> işletmeler -> şubeler temel yapısı */
(function(){
  'use strict';
  if(window.__eotBusinessHierarchy)return;
  window.__eotBusinessHierarchy=true;

  const TYPES=[
    {id:'retail',name:'Perakende Mağazası',icon:'🏪',cost:750000,expense:95000,staff:'2-4',risk:'Düşük',desc:'Hızlı nakit akışı ve dengeli başlangıç.'},
    {id:'market',name:'Market',icon:'🛒',cost:1000000,expense:130000,staff:'3-6',risk:'Düşük',desc:'Düzenli müşteri trafiği ve istikrarlı ciro.'},
    {id:'restaurant',name:'Restoran',icon:'🍽️',cost:1250000,expense:185000,staff:'5-8',risk:'Orta',desc:'Yüksek operasyon ihtiyacı, güçlü gelir potansiyeli.'},
    {id:'factory',name:'Fabrika',icon:'🏭',cost:5000000,expense:620000,staff:'10-20',risk:'Yüksek',desc:'Büyük sermaye, yüksek kapasite ve ölçeklenebilir üretim.'},
    {id:'dealer',name:'Oto Galeri',icon:'🚘',cost:3000000,expense:260000,staff:'3-6',risk:'Orta',desc:'Araç ticareti için yüksek sermayeli satış noktası.'},
    {id:'construction',name:'İnşaat İşletmesi',icon:'🏗️',cost:4000000,expense:430000,staff:'6-12',risk:'Yüksek',desc:'Proje bazlı yüksek kazanç ve daha yüksek finansal risk.'}
  ];
  let selectedType='retail';

  function money(n){return '₺'+Math.round(Number(n||0)).toLocaleString('tr-TR')}
  function mainCompany(){try{if(typeof sim==='undefined'||!sim)return null;if(sim.companyProfile&&sim.companyProfile.established)return sim.companyProfile;if(Array.isArray(sim.companies))return sim.companies.find(c=>c&&c.isMainCompany)||sim.companies[0]||null}catch(e){}return null}
  function businesses(){try{if(typeof sim==='undefined'||!sim)return[];if(!Array.isArray(sim.businesses))sim.businesses=[];return sim.businesses}catch(e){return[]}}
  function cashNow(){try{return typeof cash!=='undefined'?Number(cash||0):0}catch(e){return 0}}
  function persist(){try{if(typeof simSave==='function')simSave()}catch(e){}try{if(typeof save==='function')save()}catch(e){}try{const u=typeof currentAccount==='function'?currentAccount():null;if(u&&u.id&&u.id!=='guest'&&typeof saveAccountCareer==='function')saveAccountCareer(u.id)}catch(e){}}

  function ensureStyle(){
    if(document.getElementById('eot-business-hierarchy-style'))return;
    const s=document.createElement('style');s.id='eot-business-hierarchy-style';s.textContent=`
      .eot-bh-wrap{margin:10px 0 22px}.eot-bh-company,.eot-bh-create,.eot-bh-list{border:1px solid rgba(105,167,218,.18);border-radius:20px;background:linear-gradient(145deg,rgba(15,42,67,.96),rgba(8,26,45,.96));padding:15px;margin-bottom:12px}.eot-bh-company small,.eot-bh-create p,.eot-bh-empty,.eot-bh-card span{color:#879db2}.eot-bh-company small{font-size:8px;font-weight:900;letter-spacing:.12em}.eot-bh-company h3{margin:5px 0 4px;font-size:16px}.eot-bh-company p{margin:0;color:#91a7bc;font-size:9px}.eot-bh-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-top:12px}.eot-bh-stats div{padding:9px;border-radius:12px;background:rgba(255,255,255,.04)}.eot-bh-stats span{display:block;color:#8298ae;font-size:7px}.eot-bh-stats b{display:block;margin-top:4px;font-size:10px}
      .eot-bh-create{padding:16px}.eot-bh-create-head{display:flex;justify-content:space-between;gap:10px;align-items:flex-start;margin-bottom:12px}.eot-bh-create-head h3{margin:0;font-size:15px}.eot-bh-create-head p{font-size:8px;margin:4px 0 0;line-height:1.45}.eot-bh-step{flex:0 0 auto;padding:6px 8px;border-radius:999px;background:rgba(53,198,216,.09);border:1px solid rgba(53,198,216,.14);color:#79d9e7;font-size:7px;font-weight:900;letter-spacing:.06em}
      .eot-bh-types{display:grid;grid-template-columns:1fr 1fr;gap:8px}.eot-bh-type{position:relative;border:1px solid rgba(255,255,255,.08);border-radius:15px;background:rgba(255,255,255,.035);color:#fff;padding:11px;text-align:left;min-height:92px}.eot-bh-type.active{border-color:rgba(74,210,194,.52);background:linear-gradient(145deg,rgba(36,126,128,.20),rgba(22,64,84,.30));box-shadow:0 0 0 1px rgba(74,210,194,.08) inset}.eot-bh-type-icon{font-size:22px}.eot-bh-type b{display:block;font-size:10px;margin-top:6px}.eot-bh-type small{display:block;color:#8ba0b5;font-size:7px;margin-top:4px}.eot-bh-type strong{display:block;color:#79dfbd;font-size:9px;margin-top:6px}.eot-bh-selected{position:absolute;right:8px;top:8px;width:18px;height:18px;border-radius:50%;display:grid;place-items:center;background:#42d39b;color:#062118;font-size:10px;font-weight:900}
      .eot-bh-setup{margin-top:10px;padding:13px;border:1px solid rgba(88,196,225,.15);border-radius:16px;background:rgba(5,22,37,.48)}.eot-bh-summary-top{display:grid;grid-template-columns:46px minmax(0,1fr);gap:11px;align-items:center}.eot-bh-summary-icon{width:46px;height:46px;border-radius:14px;display:grid;place-items:center;font-size:23px;background:linear-gradient(145deg,rgba(59,130,246,.18),rgba(53,198,216,.08));border:1px solid rgba(104,180,232,.10)}.eot-bh-summary-top span{display:block;color:#7f98ae;font-size:7px;font-weight:900;letter-spacing:.08em}.eot-bh-summary-top b{display:block;margin-top:3px;font-size:12px}.eot-bh-summary-top p{margin:3px 0 0;font-size:7.5px;line-height:1.4;color:#879db2}.eot-bh-summary-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:11px}.eot-bh-summary-grid div{padding:8px;border-radius:11px;background:rgba(255,255,255,.035)}.eot-bh-summary-grid span{display:block;font-size:6.5px;color:#7891a8}.eot-bh-summary-grid b{display:block;margin-top:4px;font-size:8.5px}.eot-bh-name-label{display:block;margin-top:12px;color:#8fa6bb;font-size:7px;font-weight:900;letter-spacing:.07em}.eot-bh-name{width:100%;box-sizing:border-box;margin-top:6px;border:1px solid rgba(121,172,211,.18);border-radius:12px;background:#091d30;color:#f7fbff;padding:11px 12px;font:inherit;font-size:10px;outline:none}.eot-bh-name:focus{border-color:rgba(75,198,218,.48)}.eot-bh-found{width:100%;margin-top:9px;border:0;border-radius:13px;padding:12px;background:linear-gradient(90deg,#227cc8,#23a9b7);color:#fff;font-size:10px;font-weight:900}.eot-bh-found:disabled{opacity:.38}.eot-bh-balance-note{display:flex;justify-content:space-between;gap:10px;margin-top:8px;color:#7891a8;font-size:7px}.eot-bh-balance-note b{color:#b9d2e4}
      .eot-bh-list h3{margin:0;font-size:14px}.eot-bh-card{padding:11px 0;border-top:1px solid rgba(255,255,255,.07);display:grid;grid-template-columns:36px 1fr auto;gap:10px;align-items:center}.eot-bh-card:first-of-type{border-top:0}.eot-bh-icon{width:36px;height:36px;border-radius:11px;background:rgba(255,255,255,.05);display:grid;place-items:center}.eot-bh-card b{display:block;font-size:10px}.eot-bh-card span{display:block;font-size:8px;margin-top:3px}.eot-bh-badge{font-size:7px;padding:5px 7px;border-radius:999px;background:rgba(52,211,153,.10);color:#7ee3bd}.eot-bh-empty{font-size:9px;padding-top:10px}
      @media(max-width:380px){.eot-bh-types{gap:6px}.eot-bh-type{padding:9px;min-height:88px}.eot-bh-summary-grid{gap:5px}.eot-bh-summary-grid div{padding:7px 5px}}
    `;document.head.appendChild(s)
  }

  function createBusiness(typeId,suppliedName){
    const company=mainCompany(),type=TYPES.find(x=>x.id===typeId);if(!company||!type)return false;
    if(cashNow()<type.cost){if(typeof toast==='function')toast('İşletme kurmak için yeterli nakit yok');return false}
    let name=String(suppliedName||'').trim();
    if(!name){name=prompt('İşletme adı',company.name+' '+type.name)||''}
    if(name.length<2){if(typeof toast==='function')toast('İşletme adı en az 2 karakter olmalı');return false}
    try{
      cash=Number(cash||0)-type.cost;
      businesses().push({id:'biz_'+Date.now(),parentCompanyId:company.id||sim.selectedCompanyId||'main',name,type:type.id,typeName:type.name,icon:type.icon,city:company.city||company.headquarters?.city||'İstanbul',branches:[{id:'branch_'+Date.now(),name:'Merkez Şube',city:company.city||company.headquarters?.city||'İstanbul',openedAt:Date.now(),active:true}],employees:[],revenue:0,expense:0,profit:0,openedAt:Date.now(),active:true});
      if(typeof tx!=='undefined'&&Array.isArray(tx))tx.unshift({t:Date.now(),kind:'business_foundation',type:type.id,sym:name,total:type.cost});
      persist();
      if(typeof window.render==='function')window.render();
      if(typeof window.renderGameExtras==='function')window.renderGameExtras();
      renderHierarchy();
      if(typeof toast==='function')toast(name+' kuruldu');
      return true;
    }catch(e){console.warn('İşletme kurulamadı:',e);return false}
  }
  window.eotCreateBusiness=createBusiness;
  window.eotSelectBusinessType=function(typeId){if(!TYPES.some(x=>x.id===typeId))return;selectedType=typeId;renderHierarchy()};
  window.eotCreateSelectedBusiness=function(){const input=document.getElementById('eotBusinessName');return createBusiness(selectedType,input?input.value:'')};

  function renderHierarchy(){
    ensureStyle();const screen=document.getElementById('business');if(!screen)return;
    let wrap=document.getElementById('eotBusinessHierarchy');if(!wrap){wrap=document.createElement('section');wrap.id='eotBusinessHierarchy';wrap.className='eot-bh-wrap';const head=screen.querySelector('.panel-head');if(head)head.insertAdjacentElement('afterend',wrap);else screen.prepend(wrap)}
    const company=mainCompany(),list=businesses();if(!company){wrap.innerHTML='<div class="eot-bh-company"><h3>Önce ana şirketini kur</h3><p>İşletmeler ana şirketin altında faaliyet gösterir.</p></div>';return}
    const branchCount=list.reduce((n,b)=>n+(Array.isArray(b.branches)?b.branches.length:0),0),type=TYPES.find(x=>x.id===selectedType)||TYPES[0],remaining=Math.max(0,cashNow()-type.cost),canAfford=cashNow()>=type.cost,defaultName=(company.name||'Şirketim')+' '+type.name;
    wrap.innerHTML=`
      <div class="eot-bh-company"><small>ANA ŞİRKET</small><h3>${company.name||'Şirketim'}</h3><p>${company.legalType||'Şirket'} • ${company.city||company.headquarters?.city||'Türkiye'}</p><div class="eot-bh-stats"><div><span>İŞLETME</span><b>${list.length}</b></div><div><span>ŞUBE</span><b>${branchCount}</b></div><div><span>NAKİT</span><b>${money(cashNow())}</b></div></div></div>
      <div class="eot-bh-create">
        <div class="eot-bh-create-head"><div><h3>Yeni İşletme Kur</h3><p>Ana şirketinin altında yeni bir ticari faaliyet başlat.</p></div><span class="eot-bh-step">KURULUŞ MERKEZİ</span></div>
        <div class="eot-bh-types">${TYPES.map(t=>`<button class="eot-bh-type ${t.id===selectedType?'active':''}" onclick="eotSelectBusinessType('${t.id}')"><span class="eot-bh-type-icon">${t.icon}</span>${t.id===selectedType?'<i class="eot-bh-selected">✓</i>':''}<b>${t.name}</b><small>${t.staff} başlangıç çalışanı • ${t.risk} risk</small><strong>${money(t.cost)}</strong></button>`).join('')}</div>
        <div class="eot-bh-setup">
          <div class="eot-bh-summary-top"><div class="eot-bh-summary-icon">${type.icon}</div><div><span>SEÇİLEN İŞLETME</span><b>${type.name}</b><p>${type.desc}</p></div></div>
          <div class="eot-bh-summary-grid"><div><span>KURULUŞ</span><b>${money(type.cost)}</b></div><div><span>TAHMİNİ AYLIK GİDER</span><b>${money(type.expense)}</b></div><div><span>RİSK / PERSONEL</span><b>${type.risk} • ${type.staff}</b></div></div>
          <label class="eot-bh-name-label" for="eotBusinessName">İŞLETME ADI</label><input id="eotBusinessName" class="eot-bh-name" maxlength="42" value="${defaultName.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}">
          <button class="eot-bh-found" onclick="eotCreateSelectedBusiness()" ${canAfford?'':'disabled'}>${canAfford?type.icon+' '+type.name+' Kur':'Yetersiz Nakit'}</button>
          <div class="eot-bh-balance-note"><span>Mevcut nakit <b>${money(cashNow())}</b></span><span>Kuruluş sonrası <b>${money(remaining)}</b></span></div>
        </div>
      </div>
      <div class="eot-bh-list"><h3>İşletmelerim</h3>${list.length?list.map(b=>`<div class="eot-bh-card"><div class="eot-bh-icon">${b.icon||'🏢'}</div><div><b>${b.name}</b><span>${b.typeName||'İşletme'} • ${b.city||'Türkiye'} • ${(b.branches||[]).length} şube</span></div><strong class="eot-bh-badge">AKTİF</strong></div>`).join(''):'<div class="eot-bh-empty">Henüz işletmen yok. İlk işletmeni ana şirketinin altında kur.</div>'}</div>`;
  }
  function schedule(){if((location.hash||'')==='#business'||document.getElementById('business')?.classList.contains('active'))setTimeout(renderHierarchy,20)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();window.addEventListener('hashchange',schedule,true);window.addEventListener('pageshow',schedule);
})();