/* Empire of Trade • CEO kimliği kayıt + şirket kuruluş entegrasyonu */
(function(){
  'use strict';
  if(window.__eotCeoIdentityLoaded)return;
  window.__eotCeoIdentityLoaded=true;

  function esc(v){return String(v||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
  function current(){try{return typeof currentAccount==='function'?currentAccount():JSON.parse(localStorage.getItem('gs_current_account')||'null')}catch(e){return null}}
  function saveAccountCeo(ceo){
    ceo=String(ceo||'').trim();if(!ceo)return;
    try{
      const u=current();if(!u||!u.id)return;
      u.ceoName=ceo;localStorage.setItem('gs_current_account',JSON.stringify(u));
      const users=JSON.parse(localStorage.getItem('gs_accounts')||'[]');
      const hit=users.find(x=>x&&x.id===u.id);if(hit){hit.ceoName=ceo;localStorage.setItem('gs_accounts',JSON.stringify(users))}
    }catch(e){}
  }
  function accountCeo(){const u=current();return String(u&&u.ceoName||'').trim()}

  function patchAccountMode(){
    if(typeof window.setAccountMode!=='function'||window.setAccountMode.__eotCeo)return;
    const original=window.setAccountMode;
    const wrapped=function(mode){const r=original.apply(this,arguments);const w=document.getElementById('accountCeoWrap');if(w)w.classList.toggle('hidden',mode!=='register');return r};
    wrapped.__eotCeo=true;window.setAccountMode=wrapped;
  }
  function patchAccountSubmit(){
    if(typeof window.submitEmailAccount!=='function'||window.submitEmailAccount.__eotCeo)return;
    const original=window.submitEmailAccount;
    const wrapped=function(){
      const registering=(typeof accountMode!=='undefined'&&accountMode==='register');
      const ceo=String(document.getElementById('accountCeoName')?.value||'').trim();
      if(registering&&ceo.length<2){if(typeof showAccountError==='function')showAccountError('Şirket CEO adı en az 2 karakter olmalı.');return}
      const r=original.apply(this,arguments);
      if(registering&&ceo){setTimeout(()=>{saveAccountCeo(ceo);syncProfile();},0)}
      return r;
    };
    wrapped.__eotCeo=true;window.submitEmailAccount=wrapped;
  }

  function ensureCompanyCeoField(){
    const city=document.getElementById('eotCompanyCity');
    if(!city||document.getElementById('eotCompanyCeo'))return;
    const cityField=city.closest('.eot-field');if(!cityField)return;
    const field=document.createElement('div');field.className='eot-field';field.innerHTML='<label>Şirket CEO\'su</label><input id="eotCompanyCeo" maxlength="40" autocomplete="name" placeholder="Örn. Emirhan Kabahor">';
    cityField.parentNode.insertBefore(field,cityField);
    const preset=accountCeo();if(preset)field.querySelector('input').value=preset;
    const btn=document.getElementById('eotCompanySubmit');
    if(btn&&btn.onclick&&!btn.onclick.__eotCeo){
      const original=btn.onclick;
      const wrapped=function(e){
        const ceo=String(document.getElementById('eotCompanyCeo')?.value||'').trim();
        const err=document.getElementById('eotCompanySetupError');
        if(ceo.length<2){if(err)err.textContent='Şirket CEO adı en az 2 karakter olmalı.';return false}
        saveAccountCeo(ceo);
        const r=original.call(this,e);
        try{
          if(typeof sim!=='undefined'&&sim){
            if(sim.companyProfile)sim.companyProfile.ceoName=ceo;
            const main=Array.isArray(sim.companies)?sim.companies.find(c=>c&&c.isMainCompany):null;if(main)main.ceoName=ceo;
            if(typeof simSave==='function')simSave();if(typeof saveAccountCareer==='function'){const u=current();if(u&&u.id&&u.id!=='guest')saveAccountCareer(u.id)}
          }
        }catch(x){}
        setTimeout(syncProfile,30);return r;
      };
      wrapped.__eotCeo=true;btn.onclick=wrapped;
    }
  }

  function profileCeo(){
    try{if(typeof sim!=='undefined'&&sim&&sim.companyProfile&&sim.companyProfile.ceoName)return String(sim.companyProfile.ceoName).trim()}catch(e){}
    return accountCeo()||String(current()&&current().name||'Oyuncu');
  }
  function syncProfile(){
    try{
      const sub=document.querySelector('#home .eot-identity p');if(!sub)return;
      sub.innerHTML='CEO • <span class="eot-ceo-name">'+esc(profileCeo())+'</span>';
    }catch(e){}
  }

  function tick(){patchAccountMode();patchAccountSubmit();ensureCompanyCeoField();syncProfile()}
  setTimeout(tick,200);setTimeout(tick,800);setInterval(tick,1500);
  window.addEventListener('hashchange',()=>setTimeout(tick,80));
  window.addEventListener('pageshow',()=>setTimeout(tick,120));
})();