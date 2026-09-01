/* Empire of Trade - şirket kurulmadan oyunu açma */
(function(){
  'use strict';

  function savedCompanyExists(){
    try{
      const candidates=[
        localStorage.getItem('gs140_state'),
        localStorage.getItem('gs132_sim')
      ].filter(Boolean);

      const current=JSON.parse(localStorage.getItem('gs_current_account')||'null');
      if(current&&current.id){
        const accountState=localStorage.getItem('gs_account_career_'+current.id);
        if(accountState)candidates.unshift(accountState);
      }

      return candidates.some(raw=>{
        try{
          const d=JSON.parse(raw);
          const s=d&&d.sim?d.sim:d;
          if(!s)return false;
          return !!(
            (s.companyProfile&&s.companyProfile.established&&String(s.companyProfile.name||'').trim()) ||
            String(s.companyName||'').trim() ||
            (Array.isArray(s.companies)&&s.companies.some(c=>c&&c.isMainCompany&&String(c.name||'').trim()))
          );
        }catch(e){return false}
      });
    }catch(e){return false}
  }

  const needsCompany=!savedCompanyExists();
  window.__EOT_NEEDS_COMPANY__=needsCompany;

  if(needsCompany){
    const style=document.createElement('style');
    style.id='eot-company-boot-gate-style';
    style.textContent='#app-root{visibility:hidden!important}';
    document.head.appendChild(style);
  }

  window.EOTReleaseCompanyBootGate=function(){
    const s=document.getElementById('eot-company-boot-gate-style');
    if(s)s.remove();
    window.__EOT_NEEDS_COMPANY__=false;
  };
})();