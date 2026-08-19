/* Empire of Trade • Ana şirket kaydı yalnızca gerçekten değiştiğinde senkronize edilir */
(function(){
  'use strict';
  if(window.__eotCompanyRecordSync)return;
  window.__eotCompanyRecordSync=true;

  const MIGRATION_KEY='gs_company_portfolio_recovery_v3';

  function persist(){
    try{if(typeof simSave==='function')simSave()}catch(e){}
    try{if(typeof save==='function')save()}catch(e){}
    try{if(typeof saveOwned==='function')saveOwned()}catch(e){}
    try{const u=typeof currentAccount==='function'?currentAccount():null;if(u&&u.id&&u.id!=='guest'&&typeof saveAccountCareer==='function')saveAccountCareer(u.id)}catch(e){}
  }
  function validName(v){const s=String(v||'').trim();return s.length>=2&&s!=='Girişim Şehri Holding'&&s!=='Empire of Trade Holding'}
  function sameName(a,b){return String(a||'').trim().toLocaleLowerCase('tr-TR')===String(b||'').trim().toLocaleLowerCase('tr-TR')}
  function sameCompany(a,b){
    try{
      const pick=x=>({
        id:String(x&&x.id||''),name:String(x&&x.name||''),legalType:String(x&&x.legalType||''),
        sector:String(x&&x.sector||''),city:String(x&&x.city||''),capital:Number(x&&x.capital||0),
        companyCash:Number(x&&x.companyCash||0),brand:Number(x&&x.brand||0),isMainCompany:!!(x&&x.isMainCompany),
        employees:Array.isArray(x&&x.employees)?x.employees:[],monthlyHistory:Array.isArray(x&&x.monthlyHistory)?x.monthlyHistory:[],
        currentMonth:x&&x.currentMonth||{}
      });
      return JSON.stringify(pick(a))===JSON.stringify(pick(b));
    }catch(e){return false}
  }

  function recoverCompany(){
    try{
      if(typeof sim==='undefined'||!sim||typeof sim!=='object')return false;
      if(!Array.isArray(sim.companies))sim.companies=[];
      if(sim.companies.length)return false;
      const p=sim.companyProfile&&typeof sim.companyProfile==='object'?sim.companyProfile:{};
      let source=null;
      if(p.established&&validName(p.name))source={...p};
      if(!source&&typeof tx!=='undefined'&&Array.isArray(tx)){
        const foundation=tx.find(x=>x&&x.type==='company_foundation'&&validName(x.sym));
        if(foundation)source={...p,name:String(foundation.sym).trim(),established:true,establishedAt:Number(foundation.t||Date.now()),sector:p.sector||'İnşaat',city:p.city||'İstanbul',capital:Number(p.capital||0),companyCash:Number(p.companyCash||p.capital||0),legalType:p.legalType||'Şahıs İşletmesi',office:p.office||'home',accountant:p.accountant||'basic',brand:Number(p.brand||500000),employees:Array.isArray(p.employees)?p.employees:[],monthlyHistory:Array.isArray(p.monthlyHistory)?p.monthlyHistory:[],currentMonth:p.currentMonth||{revenue:0,expense:0},raw:Number(p.raw||0)};
      }
      if(!source&&validName(sim.companyName))source={...p,name:String(sim.companyName).trim(),established:true};
      if(!source)return false;
      source.id=source.id||('company_recovered_'+Date.now());source.established=true;source.name=String(source.name).trim();
      source.sector=source.sector||'İnşaat';source.city=source.city||'İstanbul';source.capital=Number(source.capital||0);
      source.companyCash=Number(source.companyCash||0);source.employees=Array.isArray(source.employees)?source.employees:[];
      source.monthlyHistory=Array.isArray(source.monthlyHistory)?source.monthlyHistory:[];source.currentMonth=source.currentMonth||{revenue:0,expense:0};
      sim.companies=[source];sim.selectedCompanyId=source.id;sim.companyProfile={...source};sim.companyName=source.name;
      localStorage.setItem(MIGRATION_KEY,'1');persist();return true;
    }catch(e){console.warn('Şirket kaydı kurtarma:',e);return false}
  }

  function synchronizeProfile(){
    try{
      if(typeof sim==='undefined'||!sim)return false;
      if(!Array.isArray(sim.companies))sim.companies=[];
      const p=sim.companyProfile;
      if(!p||!p.established||!validName(p.name))return false;
      let changed=false;
      let i=p.id?sim.companies.findIndex(c=>c&&c.id===p.id):-1;
      if(i<0)i=sim.companies.findIndex(c=>c&&sameName(c.name,p.name));
      if(i>=0){
        const existing=sim.companies[i];
        const id=existing.id||p.id||('company_'+Date.now());
        if(p.id!==id){p.id=id;changed=true}
        const next={...existing,...p,id};
        if(!sameCompany(existing,next)){sim.companies[i]=next;changed=true}
      }else{
        p.id=p.id||('company_'+Date.now());sim.companies.push({...p});changed=true;
      }
      if(!sim.selectedCompanyId){sim.selectedCompanyId=p.id;changed=true}
      return changed;
    }catch(e){return false}
  }

  function syncRecords(){
    try{
      if(recoverCompany())return true;
      const changed=synchronizeProfile();
      if(changed)persist();
      return changed;
    }catch(e){console.warn('Şirket kaydı senkronizasyonu:',e);return false}
  }

  /* Navigasyon ve genel render sırasında disk/storage yazımı yapılmaz.
     Yalnızca başlangıç kurtarması ve gerçek şirket işlemleri senkronizasyonu tetikler. */
  document.addEventListener('click',e=>{
    const el=e.target&&e.target.closest?e.target.closest('button,a'):null;if(!el)return;
    const txt=String(el.textContent||'').toLocaleLowerCase('tr-TR');
    if(txt.includes('şirket')&&(txt.includes('oluştur')||txt.includes('kur')||txt.includes('kaydet')))setTimeout(syncRecords,60);
  },true);

  setTimeout(syncRecords,180);
  setTimeout(syncRecords,900);
})();