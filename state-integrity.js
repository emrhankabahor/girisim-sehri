/* Empire of Trade • Güvenli birleşik kayıt ve veri bütünlüğü katmanı */
(function(){
  const SNAPSHOT_KEY='gs_state_integrity_snapshot_v2';
  const SNAPSHOT_PREV_KEY='gs_state_integrity_snapshot_prev_v2';
  const VERSION=2;

  function num(v,d=0){v=Number(v);return Number.isFinite(v)?v:d}
  function arr(v){return Array.isArray(v)?v:[]}
  function obj(v){return v&&typeof v==='object'&&!Array.isArray(v)?v:{}}
  function safeParse(raw){try{return JSON.parse(raw)}catch(e){return null}}
  function currentUserId(){try{const u=typeof currentAccount==='function'?currentAccount():null;return u&&u.id&&u.id!=='guest'?u.id:null}catch(e){return null}}

  function normalizeCompany(c){
    c=obj(c);
    const name=String(c.name||'').trim();
    if(name.length<2)return null;
    return {
      ...c,
      id:c.id||('company_'+Date.now()+'_'+Math.random().toString(36).slice(2,7)),
      established:c.established!==false,
      name,
      sector:c.sector||'İnşaat',city:c.city||'İstanbul',
      capital:Math.max(0,num(c.capital)),companyCash:Math.max(0,num(c.companyCash)),
      brand:Math.max(0,num(c.brand)),employees:arr(c.employees),monthlyHistory:arr(c.monthlyHistory),
      currentMonth:obj(c.currentMonth),raw:Math.max(0,num(c.raw))
    }
  }

  function normalizeStateInPlace(){
    try{
      if(typeof sim==='undefined'||!sim||typeof sim!=='object')return false;
      if(typeof cash!=='undefined'&&!Number.isFinite(Number(cash)))cash=0;
      if(typeof creditScore!=='undefined')creditScore=Math.max(0,Math.min(100,num(creditScore,50)));
      if(typeof reputation!=='undefined')reputation=Math.max(0,Math.min(100,num(reputation,50)));
      if(typeof tx!=='undefined')tx=arr(tx).filter(x=>x&&typeof x==='object').slice(0,1000);
      if(typeof loans!=='undefined')loans=arr(loans).filter(x=>x&&typeof x==='object').map(l=>({
        ...l,
        amount:Math.max(0,num(l.amount)),remaining:Math.max(0,num(l.remaining)),
        installment:Math.max(0,num(l.installment)),paidCount:Math.max(0,Math.floor(num(l.paidCount))),
        nextDue:Math.max(0,num(l.nextDue)),closed:!!l.closed
      }));
      if(typeof deposits!=='undefined')deposits=arr(deposits);
      if(typeof ownedAssets!=='undefined')ownedAssets=arr(ownedAssets);
      if(typeof pf!=='undefined')pf=obj(pf);
      if(typeof trusts!=='undefined')trusts=obj(trusts);

      sim.notifications=arr(sim.notifications);sim.companies=arr(sim.companies);sim.employees=arr(sim.employees);
      sim.monthlyHistory=arr(sim.monthlyHistory);sim.currentMonth=obj(sim.currentMonth);sim.companyProfile=obj(sim.companyProfile);

      const seen=new Set();
      sim.companies=sim.companies.map(normalizeCompany).filter(c=>c&&!seen.has(c.id)&&(seen.add(c.id),true));
      if(sim.selectedCompanyId&&!sim.companies.some(c=>c.id===sim.selectedCompanyId))sim.selectedCompanyId='';
      if(!sim.selectedCompanyId&&sim.companies.length)sim.selectedCompanyId=sim.companies[0].id;
      if(sim.selectedCompanyId){
        const selected=sim.companies.find(c=>c.id===sim.selectedCompanyId);
        if(selected){sim.companyProfile={...sim.companyProfile,...selected};sim.companyName=selected.name}
      }
      // Eski hızlandırılmış oyun-ayı muhasebesi kapalı kalır.
      sim.cycleDue=Number.MAX_SAFE_INTEGER;
      return true;
    }catch(e){console.warn('State normalize:',e);return false}
  }

  function capture(){
    try{
      if(typeof sim==='undefined'||!sim||typeof sim!=='object')return null;
      const state={
        integrityVersion:VERSION,savedAt:Date.now(),
        cash:num(typeof cash!=='undefined'?cash:0),pf:obj(typeof pf!=='undefined'?pf:{}),tx:arr(typeof tx!=='undefined'?tx:[]),
        realized:num(typeof realized!=='undefined'?realized:0),loans:arr(typeof loans!=='undefined'?loans:[]),
        creditScore:num(typeof creditScore!=='undefined'?creditScore:50),trusts:obj(typeof trusts!=='undefined'?trusts:{}),
        lateCount:num(typeof lateCount!=='undefined'?lateCount:0),deposits:arr(typeof deposits!=='undefined'?deposits:[]),
        ownedAssets:arr(typeof ownedAssets!=='undefined'?ownedAssets:[]),factoryOp:obj(typeof factoryOp!=='undefined'?factoryOp:{}),
        constructionOp:obj(typeof constructionOp!=='undefined'?constructionOp:{}),selectedLandId:typeof selectedLandId!=='undefined'?selectedLandId:'',
        factoryLevel:num(typeof factoryLevel!=='undefined'?factoryLevel:1,1),reputation:num(typeof reputation!=='undefined'?reputation:50,50),
        sim:JSON.parse(JSON.stringify(sim))
      };
      if(!Number.isFinite(state.cash)||!state.sim)return null;
      return state;
    }catch(e){return null}
  }

  function persistSnapshot(){
    try{
      if(!normalizeStateInPlace())return false;
      const state=capture();if(!state)return false;
      const old=localStorage.getItem(SNAPSHOT_KEY);if(old)localStorage.setItem(SNAPSHOT_PREV_KEY,old);
      const json=JSON.stringify(state);
      localStorage.setItem(SNAPSHOT_KEY,json);
      localStorage.setItem('gs140_state',json);
      localStorage.setItem('gs132_sim',JSON.stringify(state.sim));
      const uid=currentUserId();if(uid)localStorage.setItem('gs_account_career_'+uid,json);
      return true;
    }catch(e){console.warn('State snapshot:',e);return false}
  }

  function companyCandidatesFromStorage(){
    const out=[];
    function takeState(s){
      if(!s||typeof s!=='object')return;
      const ss=s.sim&&typeof s.sim==='object'?s.sim:s;
      arr(ss.companies).forEach(c=>{const n=normalizeCompany(c);if(n)out.push(n)});
      const p=normalizeCompany(ss.companyProfile);if(p&&p.established)out.push(p);
    }
    // Kurtarma yalnızca güncel kaynaklardan yapılır. Eski snapshot, silinmiş şirketleri geri getirmesin.
    try{takeState(safeParse(localStorage.getItem('gs140_state')))}catch(e){}
    try{takeState(safeParse(localStorage.getItem('gs132_sim')))}catch(e){}
    try{takeState(safeParse(localStorage.getItem(SNAPSHOT_KEY)))}catch(e){}
    const uid=currentUserId();if(uid)try{takeState(safeParse(localStorage.getItem('gs_account_career_'+uid)))}catch(e){}
    return out;
  }

  function repairCompaniesFromStorage(){
    try{
      if(typeof sim==='undefined'||!sim)return false;
      if(!Array.isArray(sim.companies))sim.companies=[];
      // Mevcut şirket listesi varsa eski depolama verisini birleştirip çoğaltma.
      if(sim.companies.length){
        normalizeStateInPlace();
        return false;
      }
      const candidates=companyCandidatesFromStorage();
      const byId=new Map();candidates.forEach(c=>{if(c&&!byId.has(c.id))byId.set(c.id,c)});
      let merged=[...byId.values()].filter(c=>c&&c.name);
      if(!merged.length&&typeof tx!=='undefined'&&Array.isArray(tx)){
        const f=tx.find(x=>x&&x.type==='company_foundation'&&String(x.sym||'').trim());
        if(f)merged=[normalizeCompany({id:'company_recovered_'+num(f.t,Date.now()),name:String(f.sym).trim(),established:true,establishedAt:num(f.t,Date.now()),sector:'İnşaat',city:'İstanbul',capital:0,companyCash:0,brand:500000})].filter(Boolean);
      }
      if(!merged.length)return false;
      sim.companies=merged;
      sim.selectedCompanyId=merged[0].id;
      sim.companyProfile={...sim.companyProfile,...merged[0],established:true};sim.companyName=merged[0].name;
      persistSnapshot();
      return true;
    }catch(e){console.warn('Company repair:',e);return false}
  }

  function removeLegacyMonthArtifacts(){
    try{
      if(typeof tx!=='undefined'&&Array.isArray(tx))tx=tx.filter(x=>!(x&&x.type==='monthly_close')&&!String(x&&x.sym||'').toLocaleLowerCase('tr-TR').includes('oyun ayı'));
      if(sim&&typeof sim==='object')sim.cycleDue=Number.MAX_SAFE_INTEGER;
    }catch(e){}
  }

  function wrapPersistence(){
    try{if(typeof simSave==='function'&&!simSave.__integrityWrapped){const orig=simSave;const wrapped=function(){const r=orig.apply(this,arguments);setTimeout(persistSnapshot,0);return r};wrapped.__integrityWrapped=true;simSave=wrapped}}catch(e){}
    try{if(typeof saveOwned==='function'&&!saveOwned.__integrityWrapped){const orig=saveOwned;const wrapped=function(){const r=orig.apply(this,arguments);setTimeout(persistSnapshot,0);return r};wrapped.__integrityWrapped=true;saveOwned=wrapped}}catch(e){}
  }

  function refresh(){
    if(!normalizeStateInPlace())return;
    removeLegacyMonthArtifacts();repairCompaniesFromStorage();persistSnapshot();
    try{if(typeof renderCompanyPortfolio==='function')renderCompanyPortfolio()}catch(e){}
  }

  wrapPersistence();
  setTimeout(refresh,150);setTimeout(refresh,900);
  window.addEventListener('hashchange',()=>setTimeout(refresh,100));
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')persistSnapshot()});
  window.addEventListener('pagehide',persistSnapshot);
  setInterval(persistSnapshot,20000);
})();
