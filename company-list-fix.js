/* Girişim Şehri • Şirket portföyü kalıcı senkronizasyon */
(function(){
  const MIGRATION_KEY='gs_company_portfolio_recovery_v2';

  function persist(){
    try{simSave()}catch(e){}
    try{save()}catch(e){}
    try{saveOwned()}catch(e){}
    try{
      const u=typeof currentAccount==='function'?currentAccount():null;
      if(u&&u.id&&u.id!=='guest'&&typeof saveAccountCareer==='function')saveAccountCareer(u.id);
    }catch(e){}
  }

  function validName(v){
    const s=String(v||'').trim();
    return s.length>=2 && s!=='Girişim Şehri Holding';
  }

  function recoverCompany(){
    try{
      if(typeof sim==='undefined'||!sim||typeof sim!=='object')return false;
      if(!Array.isArray(sim.companies))sim.companies=[];
      if(sim.companies.length)return false;

      const p=sim.companyProfile&&typeof sim.companyProfile==='object'?sim.companyProfile:{};
      let source=null;

      // Öncelik: kurulmuş companyProfile kaydı.
      if(p.established&&validName(p.name))source={...p};

      // Eski sürümde şirket listesi kaybolduysa kuruluş işleminden adı kurtar.
      if(!source&&typeof tx!=='undefined'&&Array.isArray(tx)){
        const foundation=tx.find(x=>x&&x.type==='company_foundation'&&validName(x.sym));
        if(foundation){
          source={
            ...p,
            name:String(foundation.sym).trim(),
            established:true,
            establishedAt:Number(foundation.t||Date.now()),
            sector:p.sector||'İnşaat',
            city:p.city||'İstanbul',
            capital:Number(p.capital||0),
            companyCash:Number(p.companyCash||p.capital||0),
            legalType:p.legalType||'Şahıs İşletmesi',
            office:p.office||'home',
            accountant:p.accountant||'basic',
            brand:Number(p.brand||500000),
            employees:Array.isArray(p.employees)?p.employees:[],
            monthlyHistory:Array.isArray(p.monthlyHistory)?p.monthlyHistory:[],
            currentMonth:p.currentMonth||{revenue:0,expense:0},
            raw:Number(p.raw||0)
          };
        }
      }

      // Son çare: eski companyName alanı.
      if(!source&&validName(sim.companyName)){
        source={...p,name:String(sim.companyName).trim(),established:true};
      }

      if(!source)return false;
      source.id=source.id||('company_recovered_'+Date.now());
      source.established=true;
      source.name=String(source.name).trim();
      source.sector=source.sector||'İnşaat';
      source.city=source.city||'İstanbul';
      source.capital=Number(source.capital||0);
      source.companyCash=Number(source.companyCash||0);
      source.employees=Array.isArray(source.employees)?source.employees:[];
      source.monthlyHistory=Array.isArray(source.monthlyHistory)?source.monthlyHistory:[];
      source.currentMonth=source.currentMonth||{revenue:0,expense:0};

      sim.companies=[source];
      sim.selectedCompanyId=source.id;
      sim.companyProfile={...source};
      sim.companyName=source.name;
      localStorage.setItem(MIGRATION_KEY,'1');
      persist();
      return true;
    }catch(e){console.warn('Şirket kaydı kurtarma:',e);return false}
  }

  function synchronizeProfile(){
    try{
      if(typeof sim==='undefined'||!sim)return false;
      if(!Array.isArray(sim.companies))sim.companies=[];
      const p=sim.companyProfile;
      if(p&&p.established&&validName(p.name)){
        p.id=p.id||('company_'+Date.now());
        const i=sim.companies.findIndex(c=>c&&c.id===p.id);
        if(i<0)sim.companies.push({...p});
        else sim.companies[i]={...sim.companies[i],...p};
        if(!sim.selectedCompanyId)sim.selectedCompanyId=p.id;
        return true;
      }
    }catch(e){}
    return false;
  }

  function refreshPortfolio(){
    try{
      const recovered=recoverCompany();
      const synced=synchronizeProfile();
      if(recovered||synced)persist();
      if(typeof renderCompanyPortfolio==='function')renderCompanyPortfolio();
    }catch(e){console.warn('Şirket portföyü yenileme:',e)}
  }

  // Şirket kurulduktan sonra hesap kariyerine de anında yaz.
  function persistAfterCompanyAction(){
    setTimeout(()=>{
      try{
        synchronizeProfile();
        persist();
        if(typeof renderCompanyPortfolio==='function')renderCompanyPortfolio();
      }catch(e){}
    },30);
  }

  if(typeof renderGameExtras==='function'){
    const original=renderGameExtras;
    renderGameExtras=function(){
      const r=original.apply(this,arguments);
      setTimeout(refreshPortfolio,0);
      return r;
    };
  }

  document.addEventListener('click',e=>{
    const el=e.target&&e.target.closest?e.target.closest('button,a'):null;
    if(!el)return;
    const txt=String(el.textContent||'').toLocaleLowerCase('tr-TR');
    if(txt.includes('şirket')&&(txt.includes('oluştur')||txt.includes('kur')||txt.includes('kaydet')))persistAfterCompanyAction();
  },true);

  window.addEventListener('hashchange',()=>setTimeout(refreshPortfolio,80));
  setTimeout(refreshPortfolio,150);
  setTimeout(refreshPortfolio,700);
})();
