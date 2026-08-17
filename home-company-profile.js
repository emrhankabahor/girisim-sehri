/* Empire of Trade • Ana sayfa şirket kimliği kartı */
(function(){
  'use strict';
  if(window.__eotHomeCompanyProfileLoaded)return;
  window.__eotHomeCompanyProfileLoaded=true;

  function company(){
    try{
      if(typeof sim==='undefined'||!sim)return null;
      const p=sim.companyProfile&&typeof sim.companyProfile==='object'?sim.companyProfile:null;
      if(p&&p.established&&String(p.name||'').trim())return p;
      const list=Array.isArray(sim.companies)?sim.companies:[];
      return list.find(c=>c&&c.isMainCompany&&String(c.name||'').trim())||null;
    }catch(e){return null}
  }

  function ensureStyle(){
    if(document.getElementById('eot-home-company-profile-style'))return;
    const s=document.createElement('style');
    s.id='eot-home-company-profile-style';
    s.textContent=`
      .eot-profile{padding:18px!important;border-radius:25px!important;background:linear-gradient(145deg,#103354,#0a2239 70%,#091d31)!important;border:1px solid rgba(98,184,240,.24)!important;box-shadow:0 16px 38px rgba(0,0,0,.24)!important}
      .eot-profile-main{grid-template-columns:72px minmax(0,1fr) 66px!important;gap:14px!important}
      .eot-avatar{width:70px!important;height:70px!important;border-radius:22px!important;background:linear-gradient(145deg,#183e62,#0d2945)!important;border-color:rgba(117,197,247,.32)!important}
      .eot-identity small{font-size:7.5px!important;letter-spacing:.18em!important;color:#67def4!important}
      .eot-identity h2{font-size:17px!important;line-height:1.15!important;margin:5px 0 3px!important;white-space:normal!important;overflow:visible!important;text-overflow:clip!important;display:-webkit-box!important;-webkit-line-clamp:2!important;-webkit-box-orient:vertical!important}
      .eot-identity p{font-size:9.5px!important;color:#9db2c5!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
      .eot-company-meta{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
      .eot-company-pill{display:inline-flex;align-items:center;min-height:24px;padding:5px 8px;border-radius:999px;border:1px solid rgba(104,201,231,.18);background:rgba(64,168,207,.08);color:#b8dbea;font-size:7.5px;font-weight:800}
      .eot-tier{min-width:64px!important;padding:10px 8px!important;border-radius:18px!important;background:rgba(7,24,41,.78)!important;border-color:rgba(114,181,224,.18)!important}
      .eot-tier span{font-size:7px!important}.eot-tier b{font-size:22px!important}
      @media(max-width:390px){.eot-profile-main{grid-template-columns:60px minmax(0,1fr) 58px!important;gap:10px!important}.eot-avatar{width:58px!important;height:58px!important;border-radius:18px!important}.eot-identity h2{font-size:14px!important}.eot-company-pill{font-size:6.8px!important;padding:4px 7px!important}.eot-tier{min-width:56px!important}}
    `;
    document.head.appendChild(s);
  }

  function sync(){
    const box=document.querySelector('#home .eot-profile');
    const id=document.querySelector('#home .eot-identity');
    if(!box||!id)return;
    ensureStyle();
    const c=company();
    const title=id.querySelector('h2');
    const sub=id.querySelector('p');
    if(!c){if(title)title.textContent='Ekonomi İmparatorluğu';if(sub)sub.textContent='CEO • Empire of Trade';return;}
    if(title)title.textContent=String(c.name||'Şirketim');
    const legal=String(c.legalType||'Şirket');
    if(sub)sub.textContent='CEO • '+legal;
    let meta=id.querySelector('.eot-company-meta');
    if(!meta){meta=document.createElement('div');meta.className='eot-company-meta';id.appendChild(meta)}
    const city=String(c.city||(c.headquarters&&c.headquarters.city)||'Türkiye');
    meta.innerHTML='<span class="eot-company-pill">🏢 '+legal+'</span><span class="eot-company-pill">📍 '+city+'</span>';
  }

  setTimeout(sync,700);
  setTimeout(sync,1500);
  window.addEventListener('hashchange',()=>{if((location.hash||'#home')==='#home')setTimeout(sync,80)});
  window.addEventListener('pageshow',()=>setTimeout(sync,120));
  window.EOTSyncHomeCompanyProfile=sync;
})();
