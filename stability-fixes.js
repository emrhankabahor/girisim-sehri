/* Empire of Trade • V1.70 güvenli kayıt ve oynanış istikrar katmanı */
(function(){
  const BACKUP_PREFIX='eot_corrupt_career_backup_';
  let patched=false;

  function currentUser(){try{return typeof currentAccount==='function'?currentAccount():null}catch(e){return null}}
  function accountKey(id){return 'gs_account_career_'+id}
  function safeNumber(v,d=0){v=Number(v);return Number.isFinite(v)?v:d}
  function safeArray(v){return Array.isArray(v)?v:[]}
  function safeObject(v){return v&&typeof v==='object'&&!Array.isArray(v)?v:{}}

  function normalizeCareer(data){
    if(!data||typeof data!=='object'||!data.sim||typeof data.sim!=='object')return null;
    const d={...data};
    d.cash=safeNumber(d.cash,0);
    d.pf=safeObject(d.pf);d.tx=safeArray(d.tx);d.loans=safeArray(d.loans);d.deposits=safeArray(d.deposits);d.ownedAssets=safeArray(d.ownedAssets);
    d.creditScore=Math.max(0,Math.min(100,safeNumber(d.creditScore,50)));
    d.reputation=Math.max(0,Math.min(100,safeNumber(d.reputation,50)));
    d.lateCount=Math.max(0,Math.floor(safeNumber(d.lateCount,0)));
    d.sim={...d.sim};
    d.sim.companies=safeArray(d.sim.companies);d.sim.employees=safeArray(d.sim.employees);d.sim.notifications=safeArray(d.sim.notifications);
    d.sim.monthlyHistory=safeArray(d.sim.monthlyHistory);d.sim.currentMonth=safeObject(d.sim.currentMonth);d.sim.companyProfile=safeObject(d.sim.companyProfile);
    d.sim.cycleDue=Number.MAX_SAFE_INTEGER;
    d.savedAt=safeNumber(d.savedAt,Date.now());
    return d;
  }

  function backupBadRaw(id,raw){try{if(raw)localStorage.setItem(BACKUP_PREFIX+id+'_'+Date.now(),raw)}catch(e){}}

  function persistNow(){
    try{
      const u=currentUser();
      if(u&&u.id&&u.id!=='guest'&&typeof saveAccountCareer==='function')saveAccountCareer(u.id);
      if(typeof save==='function')save();
      if(typeof simSave==='function')simSave();
      if(typeof saveOwned==='function')saveOwned();
      if(typeof saveDeposits==='function')saveDeposits();
    }catch(e){console.warn('Güvenli kayıt:',e)}
  }

  function patchCore(){
    if(patched)return true;
    if(typeof currentAccount!=='function'||typeof applyCareerState!=='function'||typeof captureCareerState!=='function')return false;

    window.careerStateLooksBroken=function(d){
      return !d||typeof d!=='object'||!d.sim||typeof d.sim!=='object'||!Number.isFinite(Number(d.cash));
    };

    window.loadAccountCareer=function(id){
      if(!id||id==='guest')return false;
      const key=accountKey(id);let raw=null;
      try{
        raw=localStorage.getItem(key);if(!raw)return false;
        const data=normalizeCareer(JSON.parse(raw));
        if(!data){backupBadRaw(id,raw);return false}
        const ok=applyCareerState(data);
        if(ok){try{render();renderFinanceExtras();renderGameExtras()}catch(e){}return true}
        backupBadRaw(id,raw);return false;
      }catch(e){backupBadRaw(id,raw);console.warn('Kariyer güvenli yükleme:',e);return false}
    };

    window.saveAccountCareer=function(id){
      if(!id||id==='guest')return false;
      try{
        const state=normalizeCareer(captureCareerState());if(!state)return false;
        localStorage.setItem(accountKey(id),JSON.stringify(state));return true;
      }catch(e){console.warn('Kariyer güvenli kayıt:',e);return false}
    };

    window.repairLegacyCareerBeforeRender=function(){
      try{localStorage.setItem('gs_v170_safe_repair_done','1')}catch(e){}
      return false;
    };

    patched=true;persistNow();return true;
  }

  function releaseClosedLoanCollateral(index){
    try{
      if(typeof loans==='undefined'||!Array.isArray(loans))return;
      const l=loans[index];
      if(!l||!l.closed||!l.collateralId||typeof ownedAssets==='undefined'||!Array.isArray(ownedAssets))return;
      const a=ownedAssets.find(x=>x&&x.id===l.collateralId);
      if(a)a.collateral=false;
    }catch(e){}
  }

  function patchLoanActions(){
    try{
      if(typeof window.loanMgmtPay==='function'&&!window.loanMgmtPay.__eotSafe){
        const original=window.loanMgmtPay;
        const wrapped=function(i){
          const r=original.apply(this,arguments);
          setTimeout(()=>{releaseClosedLoanCollateral(i);persistNow();try{renderFinanceExtras();renderGameExtras()}catch(e){}},120);
          return r;
        };
        wrapped.__eotSafe=true;window.loanMgmtPay=wrapped;
      }
      if(typeof window.loanMgmtClose==='function'&&!window.loanMgmtClose.__eotSafe){
        const original=window.loanMgmtClose;
        const wrapped=function(i){
          const r=original.apply(this,arguments);
          setTimeout(()=>{releaseClosedLoanCollateral(i);persistNow();try{renderFinanceExtras();renderGameExtras()}catch(e){}},120);
          return r;
        };
        wrapped.__eotSafe=true;window.loanMgmtClose=wrapped;
      }
    }catch(e){}
  }

  function improveMobileUsability(){
    if(document.getElementById('eot-v170-usability'))return;
    const s=document.createElement('style');s.id='eot-v170-usability';s.textContent=`
      button,a,input,select{touch-action:manipulation}
      button,.menu-card,.nav-btn,.eot-quick,.eot-business{min-height:44px}
      input,select,textarea{font-size:16px!important}
      .loan-mgmt-sheet{-webkit-overflow-scrolling:touch}
      @media(max-width:430px){
        .menu-grid{gap:9px!important}.menu-card{padding:13px!important}
        .section-head{margin-top:17px!important}
        .modal,.sheet,.panel{max-width:100%!important}
      }
    `;document.head.appendChild(s);
  }

  const timer=setInterval(function(){
    patchCore();patchLoanActions();improveMobileUsability();
    if(patched&&typeof window.loanMgmtPay==='function')clearInterval(timer);
  },250);
  setTimeout(()=>clearInterval(timer),20000);

  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')persistNow()});
  window.addEventListener('pagehide',persistNow);
  setInterval(()=>{if(patched)persistNow()},30000);
})();
