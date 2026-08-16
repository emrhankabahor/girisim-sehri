/* Empire of Trade • Hesap/kariyer kayıt güvenliği */
(function(){
  const BACKUP_PREFIX='gs_account_career_prev_';
  const RECOVERY_PREFIX='gs_account_career_recovery_';

  function parse(raw){try{return raw?JSON.parse(raw):null}catch(e){return null}}
  function isObject(v){return !!v&&typeof v==='object'&&!Array.isArray(v)}
  function validState(s){
    return !!(s&&isObject(s)&&Number.isFinite(Number(s.cash))&&isObject(s.sim));
  }
  function sanitizeState(s){
    if(!validState(s))return null;
    const d={...s};
    d.cash=Number(d.cash);
    d.pf=isObject(d.pf)?d.pf:{};
    d.tx=Array.isArray(d.tx)?d.tx.filter(x=>x&&typeof x==='object').slice(0,1000):[];
    d.loans=Array.isArray(d.loans)?d.loans:[];
    d.deposits=Array.isArray(d.deposits)?d.deposits:[];
    d.ownedAssets=Array.isArray(d.ownedAssets)?d.ownedAssets:[];
    d.creditScore=Math.max(0,Math.min(100,Number.isFinite(Number(d.creditScore))?Number(d.creditScore):50));
    d.reputation=Math.max(0,Math.min(100,Number.isFinite(Number(d.reputation))?Number(d.reputation):50));
    d.factoryLevel=Math.max(1,Number.isFinite(Number(d.factoryLevel))?Number(d.factoryLevel):1);
    d.factoryOp=isObject(d.factoryOp)?d.factoryOp:{status:'idle',finish:0};
    d.constructionOp=isObject(d.constructionOp)?d.constructionOp:{status:'idle',finish:0};
    d.sim={...d.sim};
    d.sim.companies=Array.isArray(d.sim.companies)?d.sim.companies:[];
    d.sim.notifications=Array.isArray(d.sim.notifications)?d.sim.notifications:[];
    d.sim.monthlyHistory=Array.isArray(d.sim.monthlyHistory)?d.sim.monthlyHistory:[];
    d.sim.currentMonth=isObject(d.sim.currentMonth)?d.sim.currentMonth:{};
    d.savedAt=Number.isFinite(Number(d.savedAt))?Number(d.savedAt):Date.now();
    return d;
  }
  function currentId(){
    try{const u=typeof currentAccount==='function'?currentAccount():null;return u&&u.id&&u.id!=='guest'?String(u.id):null}catch(e){return null}
  }
  function key(id){return 'gs_account_career_'+id}
  function backupKey(id){return BACKUP_PREFIX+id}
  function recoveryKey(id){return RECOVERY_PREFIX+id}

  // Finansal olarak kötü durumda olmak "bozuk kayıt" değildir. Yalnızca yapısal olarak okunamayan kayıt bozuk sayılır.
  try{
    window.careerStateLooksBroken=function(d){return !validState(d)};
  }catch(e){}

  function backupValidCurrent(id){
    if(!id)return;
    try{
      const raw=localStorage.getItem(key(id)),data=parse(raw);
      if(!validState(data))return;
      const prev=parse(localStorage.getItem(backupKey(id)));
      if(!prev||Number(data.savedAt||0)>=Number(prev.savedAt||0))localStorage.setItem(backupKey(id),JSON.stringify(data));
    }catch(e){}
  }

  try{
    if(typeof window.saveAccountCareer==='function'&&!window.saveAccountCareer.__eotSafe){
      const original=window.saveAccountCareer;
      const wrapped=function(id){
        id=id&&id!=='guest'?String(id):null;if(!id)return;
        backupValidCurrent(id);
        const r=original.apply(this,arguments);
        const now=parse(localStorage.getItem(key(id)));
        if(validState(now)){
          localStorage.setItem(recoveryKey(id),JSON.stringify(now));
          backupValidCurrent(id);
        }
        return r;
      };
      wrapped.__eotSafe=true;window.saveAccountCareer=wrapped;
    }
  }catch(e){}

  function candidates(id){
    const list=[];
    function add(source,raw){const d=sanitizeState(parse(raw));if(d)list.push({source,data:d})}
    add('hesap kaydı',localStorage.getItem(key(id)));
    add('hesap yedeği',localStorage.getItem(backupKey(id)));
    add('kurtarma kaydı',localStorage.getItem(recoveryKey(id)));
    add('bütünlük snapshotı',localStorage.getItem('gs_state_integrity_snapshot_v2'));
    add('önceki snapshot',localStorage.getItem('gs_state_integrity_snapshot_prev_v2'));
    add('birleşik kayıt',localStorage.getItem('gs140_state'));
    return list;
  }

  try{
    window.loadAccountCareer=function(id){
      if(!id||id==='guest')return false;
      id=String(id);
      const raw=localStorage.getItem(key(id));
      if(raw&&!parse(raw)){
        try{localStorage.setItem('gs_corrupt_career_'+id+'_'+Date.now(),raw)}catch(e){}
      }
      const list=candidates(id);
      if(!list.length){
        if(typeof toast==='function')toast('Kariyer kaydı bulunamadı; mevcut oyun verisi korunuyor');
        return false;
      }
      // Önce hesaba ait güncel kayıt; o bozuksa güvenli yedeklerden en yenisini kullan.
      const own=list.find(x=>x.source==='hesap kaydı');
      const chosen=own||list.sort((a,b)=>Number(b.data.savedAt||0)-Number(a.data.savedAt||0))[0];
      try{
        if(typeof applyCareerState!=='function')return false;
        const ok=applyCareerState(chosen.data);
        if(!ok)return false;
        localStorage.setItem(key(id),JSON.stringify(chosen.data));
        localStorage.setItem(recoveryKey(id),JSON.stringify(chosen.data));
        backupValidCurrent(id);
        try{if(typeof render==='function')render();if(typeof renderFinanceExtras==='function')renderFinanceExtras();if(typeof renderGameExtras==='function')renderGameExtras()}catch(e){}
        if(chosen.source!=='hesap kaydı'&&typeof toast==='function')toast('Kariyer güvenli yedekten kurtarıldı');
        return true;
      }catch(e){
        console.warn('Kariyer yüklenemedi:',e);
        return false;
      }
    };
  }catch(e){}

  function checkpoint(){
    const id=currentId();if(!id)return;
    try{
      if(typeof captureCareerState!=='function')return;
      const state=sanitizeState(captureCareerState());if(!state)return;
      const raw=JSON.stringify(state);
      localStorage.setItem(recoveryKey(id),raw);
      const existing=parse(localStorage.getItem(key(id)));
      if(!validState(existing))localStorage.setItem(key(id),raw);
      backupValidCurrent(id);
    }catch(e){}
  }

  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')checkpoint()});
  window.addEventListener('pagehide',checkpoint);
  setInterval(checkpoint,15000);
  setTimeout(checkpoint,1200);
})();
