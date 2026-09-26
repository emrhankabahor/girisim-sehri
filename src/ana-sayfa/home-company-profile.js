/* Empire of Trade • Ana sayfa şirket kimliği + CEO kimliği - hafif sürüm */
(function(){
  'use strict';
  if(window.__eotHomeCompanyProfileLoaded)return;
  window.__eotHomeCompanyProfileLoaded=true;

  function account(){try{return typeof currentAccount==='function'?currentAccount():null}catch(e){return null}}
  function company(){
    try{
      if(typeof sim!=='undefined'&&sim){
        const p=sim.companyProfile&&typeof sim.companyProfile==='object'?sim.companyProfile:null;
        if(p&&p.established&&String(p.name||'').trim())return p;
        const list=Array.isArray(sim.companies)?sim.companies:[];
        const hit=list.find(c=>c&&c.isMainCompany&&String(c.name||'').trim())||list.find(c=>c&&String(c.name||'').trim());if(hit)return hit;
      }
      const u=account();
      if(u&&u.id&&u.id!=='guest'){
        const saved=JSON.parse(localStorage.getItem('gs_account_career_'+u.id)||'null');
        if(saved&&saved.sim){const p=saved.sim.companyProfile;if(p&&p.established&&String(p.name||'').trim())return p;const list=Array.isArray(saved.sim.companies)?saved.sim.companies:[];return list.find(c=>c&&c.isMainCompany&&String(c.name||'').trim())||list.find(c=>c&&String(c.name||'').trim())||null}
      }
      return null;
    }catch(e){return null}
  }
  function savedCeoName(){
    try{
      const u=account();if(u&&u.ceoName)return String(u.ceoName).trim();
      if(u&&u.id){const saved=localStorage.getItem('eot_ceo_'+u.id);if(saved)return saved.trim();const users=JSON.parse(localStorage.getItem('gs_accounts')||'[]');const hit=Array.isArray(users)?users.find(x=>x&&x.id===u.id):null;if(hit&&hit.ceoName)return String(hit.ceoName).trim()}
      const c=company();if(c&&c.ceoName)return String(c.ceoName).trim();
      return String((u&&u.name)||'Oyuncu').trim()||'Oyuncu';
    }catch(e){return'Oyuncu'}
  }
  function escapeHtml(v){return String(v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[m]))}

  function ensureStyle(){if(document.getElementById('eot-home-company-profile-style'))return;const s=document.createElement('style');s.id='eot-home-company-profile-style';s.textContent=`
.eot-profile{padding:18px!important;border-radius:25px!important;background:linear-gradient(145deg,#103354,#0a2239 70%,#091d31)!important;border:1px solid rgba(98,184,240,.24)!important;box-shadow:0 16px 38px rgba(0,0,0,.24)!important}.eot-profile-main{grid-template-columns:72px minmax(0,1fr) 66px!important;gap:14px!important}.eot-avatar{width:70px!important;height:70px!important;border-radius:22px!important;background:linear-gradient(145deg,#183e62,#0d2945)!important;border-color:rgba(117,197,247,.32)!important}.eot-identity small{font-size:7.5px!important;letter-spacing:.18em!important;color:#67def4!important}.eot-company-name-row{display:flex;align-items:baseline;flex-wrap:wrap;gap:5px 8px;margin:5px 0 3px}.eot-identity h2{font-size:17px!important;line-height:1.15!important;margin:0!important;white-space:normal!important}.eot-company-legal-inline{font-size:9px;font-weight:800;color:#83dff1;background:rgba(64,168,207,.09);border:1px solid rgba(104,201,231,.17);padding:3px 6px;border-radius:7px}.eot-identity p{font-size:9.5px!important;color:#a9bdcf!important;margin:0!important}.eot-ceo-name{font-weight:850;color:#f3f8fc}.eot-company-meta{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}.eot-company-pill{display:inline-flex;align-items:center;min-height:24px;padding:5px 8px;border-radius:999px;border:1px solid rgba(104,201,231,.18);background:rgba(64,168,207,.08);color:#b8dbea;font-size:7.5px;font-weight:800}.eot-tier{min-width:64px!important;padding:10px 8px!important;border-radius:18px!important;background:rgba(7,24,41,.78)!important;border-color:rgba(114,181,224,.18)!important}.eot-tier span{font-size:7px!important}.eot-tier b{font-size:22px!important}#accountCeoWrap small{display:block;margin-top:6px;color:#7f98b0;font-size:10px;line-height:1.35}@media(max-width:390px){.eot-profile-main{grid-template-columns:60px minmax(0,1fr) 58px!important;gap:10px!important}.eot-avatar{width:58px!important;height:58px!important;border-radius:18px!important}.eot-identity h2{font-size:14px!important}.eot-company-legal-inline{font-size:7.5px}.eot-company-pill{font-size:6.8px!important;padding:4px 7px!important}.eot-tier{min-width:56px!important}}`;
    document.head.appendChild(s)}

  function sync(){
    const id=document.querySelector('#home .eot-identity');if(!id)return false;ensureStyle();
    const c=company(),title=id.querySelector('h2'),sub=id.querySelector('p'),ceo=savedCeoName();
    if(!c){if(title)title.textContent='Ekonomi İmparatorluğu';if(sub)sub.innerHTML='CEO • <span class="eot-ceo-name">'+escapeHtml(ceo)+'</span>';return true}
    const legal=String(c.legalType||'Şirket'),city=String(c.city||(c.headquarters&&c.headquarters.city)||'Türkiye');
    let row=id.querySelector('.eot-company-name-row');if(!row){row=document.createElement('div');row.className='eot-company-name-row';if(title)title.replaceWith(row);else id.appendChild(row)}
    row.innerHTML='<h2>'+escapeHtml(String(c.name||'Şirketim'))+'</h2><span class="eot-company-legal-inline">'+escapeHtml(legal)+'</span>';
    if(sub)sub.innerHTML='CEO • <span class="eot-ceo-name">'+escapeHtml(ceo)+'</span>';
    let meta=id.querySelector('.eot-company-meta');if(!meta){meta=document.createElement('div');meta.className='eot-company-meta';id.appendChild(meta)}meta.innerHTML='<span class="eot-company-pill">📍 '+escapeHtml(city)+'</span>';return true;
  }

  function isRegisterMode(){const tab=document.querySelector('[data-account-tab="register"]');return!!(tab&&tab.classList.contains('active'))}
  function mountCeoField(){ensureStyle();const nameWrap=document.getElementById('accountNameWrap');if(!nameWrap)return false;let wrap=document.getElementById('accountCeoWrap');if(!wrap){wrap=document.createElement('label');wrap.id='accountCeoWrap';wrap.className='hidden';wrap.innerHTML='Şirket CEO\'su<input id="accountCeoName" type="text" maxlength="40" autocomplete="name" placeholder="Örn. Emirhan Kabahor"><small>Şirket profilinde CEO olarak bu isim görünecek.</small>';nameWrap.insertAdjacentElement('afterend',wrap)}wrap.classList.toggle('hidden',!isRegisterMode());return true}

  /* Yalnızca gerçek kullanıcı değişikliğinde kalıcı kayıt yap. */
  function persistCeoForCurrent(raw){
    try{
      const value=String(raw||'').trim(),u=account();if(!u||!u.id||!value)return false;
      const old=String(u.ceoName||localStorage.getItem('eot_ceo_'+u.id)||'').trim();
      u.ceoName=value;localStorage.setItem('eot_ceo_'+u.id,value);localStorage.setItem('gs_current_account',JSON.stringify(u));
      let users=JSON.parse(localStorage.getItem('gs_accounts')||'[]');const hit=Array.isArray(users)?users.find(x=>x&&x.id===u.id):null;if(hit&&hit.ceoName!==value){hit.ceoName=value;localStorage.setItem('gs_accounts',JSON.stringify(users))}
      if(typeof sim!=='undefined'&&sim){sim.companyProfile=sim.companyProfile&&typeof sim.companyProfile==='object'?sim.companyProfile:{};sim.companyProfile.ceoName=value;const main=Array.isArray(sim.companies)?sim.companies.find(x=>x&&x.isMainCompany):null;if(main)main.ceoName=value}
      if(old!==value){try{if(typeof saveAccountCareer==='function')saveAccountCareer(u.id);if(typeof simSave==='function')simSave()}catch(e){}}
      return true;
    }catch(e){console.warn('CEO adı kaydedilemedi:',e);return false}
  }

  /* Açılışta sadece belleği hydrate et; storage'a geri yazma yapma. */
  function hydrateCeoInMemory(){
    try{
      const u=account();if(!u||!u.id)return false;const value=savedCeoName();if(!value)return false;
      if(!u.ceoName)u.ceoName=value;
      if(typeof sim!=='undefined'&&sim){if(sim.companyProfile&&typeof sim.companyProfile==='object'&&!sim.companyProfile.ceoName)sim.companyProfile.ceoName=value;const main=Array.isArray(sim.companies)?sim.companies.find(x=>x&&x.isMainCompany):null;if(main&&!main.ceoName)main.ceoName=value}
      return true;
    }catch(e){return false}
  }

  function patchAccountFlow(){
    mountCeoField();
    if(typeof window.setAccountMode==='function'&&!window.setAccountMode.__eotCeo){const original=window.setAccountMode;const wrapped=function(mode){const r=original.apply(this,arguments);requestAnimationFrame(mountCeoField);return r};wrapped.__eotCeo=true;window.setAccountMode=wrapped}
    if(typeof window.submitEmailAccount==='function'&&!window.submitEmailAccount.__eotCeo){const original=window.submitEmailAccount;const wrapped=function(){const register=isRegisterMode(),input=document.getElementById('accountCeoName'),value=String(input&&input.value||'').trim();if(register&&value.length<2){if(typeof showAccountError==='function')showAccountError('Şirket CEO adı en az 2 karakter olmalı.');if(input)input.focus();return false}const r=original.apply(this,arguments);setTimeout(()=>{if(register&&value)persistCeoForCurrent(value);else hydrateCeoInMemory();sync()},20);return r};wrapped.__eotCeo=true;window.submitEmailAccount=wrapped}
  }

  let tries=0;function boot(){tries++;patchAccountFlow();hydrateCeoInMemory();sync();if((typeof window.submitEmailAccount==='function'&&document.getElementById('accountNameWrap'))||tries>=20)return;setTimeout(boot,120)}
  setTimeout(boot,0);
  window.addEventListener('hashchange',()=>{if((location.hash||'#home')==='#home')requestAnimationFrame(()=>{hydrateCeoInMemory();sync()})});
  window.addEventListener('pageshow',()=>requestAnimationFrame(()=>{patchAccountFlow();hydrateCeoInMemory();sync()}));
  window.EOTSyncHomeCompanyProfile=sync;
})();