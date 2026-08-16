/* Empire of Trade • V1.70 güvenli kayıt ve oynanış istikrar katmanı */
(function(){
  const BACKUP_PREFIX='eot_corrupt_career_backup_';
  let patched=false;

  function currentUser(){try{return typeof currentAccount==='function'?currentAccount():null}catch(e){return null}}
  function accountKey(id){return 'gs_account_career_'+id}
  function safeNumber(v,d=0){v=Number(v);return Number.isFinite(v)?v:d}
  function safeArray(v){return Array.isArray(v)?v:[]}
  function safeObject(v){return v&&typeof v==='object'&&!Array.isArray(v)?v:{}}
  function money(n){try{return '₺'+Number(n||0).toLocaleString('tr-TR',{maximumFractionDigits:0})}catch(e){return '₺0'}}

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

  function patchRealtimeWealthHistory(){
    try{
      if(typeof sim==='undefined'||!sim||typeof totalWealth!=='function')return;
      if(window.recordWealth&&window.recordWealth.__eotRealtime)return;
      const record=function(){
        try{
          if(!Array.isArray(sim.wealthHistory))sim.wealthHistory=[];
          const now=new Date(),dayKey=now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0')+'-'+String(now.getDate()).padStart(2,'0');
          const value=Number(totalWealth()||0),first=sim.wealthHistory[0];
          if(first&&first.day===dayKey){first.value=value;first.t=Date.now()}
          else sim.wealthHistory.unshift({day:dayKey,value,t:Date.now()});
          sim.wealthHistory=sim.wealthHistory.slice(0,30);
        }catch(e){}
      };
      record.__eotRealtime=true;window.recordWealth=record;
      window.renderWealth=function(){
        record();
        const e=document.getElementById('wealthChart'),l=document.getElementById('wealthHistoryList'),vals=safeArray(sim.wealthHistory).slice(0,12);
        if(e){const rev=vals.slice().reverse(),mx=Math.max(1,...rev.map(x=>Math.max(0,Number(x.value||0))));e.innerHTML=rev.map(x=>'<div class="wealth-bar" style="height:'+Math.max(8,Math.round(Math.max(0,Number(x.value||0))/mx*100))+'%"><span>'+new Date(x.t||Date.now()).toLocaleDateString('tr-TR',{day:'2-digit',month:'2-digit'})+'</span></div>').join('')}
        if(l)l.innerHTML=vals.map(x=>'<div class="wealth-row"><span>'+new Date(x.t||Date.now()).toLocaleDateString('tr-TR')+'</span><b>'+money(x.value)+'</b></div>').join('');
      };
    }catch(e){}
  }

  function syncDashboardTruth(){
    try{
      if(typeof sim==='undefined'||!sim)return;
      const companies=safeArray(sim.companies);
      const assets=typeof ownedAssets!=='undefined'?safeArray(ownedAssets):[];
      const has=(text,words)=>words.some(w=>String(text||'').toLocaleLowerCase('tr-TR').includes(w));
      const counts=[
        companies.filter(c=>has(c.sector,['perakende','mağaza','market'])).length,
        companies.filter(c=>has(c.sector,['sanayi','üretim','fabrika'])).length+assets.filter(a=>a.id==='factory_basic'||has(a.type,['fabrika'])).length,
        companies.filter(c=>has(c.sector,['inşaat'])).length,
        companies.filter(c=>has(c.sector,['otomotiv','galeri'])).length,
        assets.filter(a=>has(a.type,['gayrimenkul','konut','emlak'])).length,
        assets.filter(a=>has(a.type,['arsa'])||String(a.id||'').includes('land')).length
      ];
      document.querySelectorAll('.eot-business .eot-count').forEach((el,i)=>{if(i<counts.length)el.textContent=counts[i]+' ADET'});
      const companyValue=companies.reduce((s,c)=>s+Math.max(0,safeNumber(c.companyCash))+Math.max(0,safeNumber(c.brand)),0);
      const stat=document.querySelector('.eot-profile-stats>div:first-child b');if(stat)stat.textContent=money(companyValue);
      const notifications=safeArray(sim.notifications),badge=document.querySelector('.eot-badge');
      if(badge){if(notifications.length){badge.style.display='grid';badge.textContent=String(Math.min(99,notifications.length))}else badge.style.display='none'}
      const alert=document.querySelector('.eot-account-alert span');if(alert)alert.textContent='Hesabın aktif • Kariyerin bu cihazda kayıtlı.';
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
    patchCore();patchLoanActions();patchRealtimeWealthHistory();improveMobileUsability();syncDashboardTruth();
    if(patched&&typeof window.loanMgmtPay==='function')clearInterval(timer);
  },250);
  setTimeout(()=>clearInterval(timer),20000);

  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')persistNow()});
  window.addEventListener('pagehide',persistNow);
  setInterval(()=>{if(patched){persistNow();syncDashboardTruth();patchRealtimeWealthHistory()}},30000);
  setInterval(syncDashboardTruth,2000);
})();
