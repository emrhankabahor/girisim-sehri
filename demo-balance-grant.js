/* Empire of Trade • Tek seferlik demo test bakiyesi */
(function(){
  const TARGET=200000000;
  const KEY='gs_demo_balance_200m_v4';

  function account(){
    try{return typeof currentAccount==='function'?currentAccount():null}catch(e){return null}
  }
  function accountKey(u){return KEY+'_'+(u&&u.id?u.id:'guest')}

  function persist(u){
    try{localStorage.setItem('gs124_cash',String(cash))}catch(e){}
    try{if(typeof save==='function')save()}catch(e){}
    try{if(typeof simSave==='function')simSave()}catch(e){}
    try{if(typeof saveOwned==='function')saveOwned()}catch(e){}
    try{if(typeof saveUnifiedState==='function')saveUnifiedState()}catch(e){}
    try{
      if(typeof captureCareerState==='function'){
        const state=captureCareerState();
        state.cash=Number(cash||0);
        state.savedAt=Date.now();
        localStorage.setItem('gs140_state',JSON.stringify(state));
        if(u&&u.id&&u.id!=='guest')localStorage.setItem('gs_account_career_'+u.id,JSON.stringify(state));
      }else if(u&&u.id&&u.id!=='guest'&&typeof saveAccountCareer==='function'){
        saveAccountCareer(u.id);
      }
    }catch(e){}
  }

  function applyOnce(){
    try{
      const u=account();
      if(!u||!u.id||u.id==='guest')return false;
      if(typeof cash!=='number')return false;
      const k=accountKey(u);

      // Demo desteği sadece bir kez uygulanır. Sonraki açılışlarda mevcut bakiye korunur.
      if(localStorage.getItem(k)==='1')return true;

      cash=Number(cash||0)+TARGET;
      if(typeof tx!=='undefined'&&Array.isArray(tx) && !tx.some(x=>x&&x.type==='demo_balance_v4')){
        tx.unshift({t:Date.now(),kind:'system',type:'demo_balance_v4',sym:'Demo Test Bakiyesi',total:TARGET});
      }
      persist(u);
      localStorage.setItem(k,'1');
      try{render();renderFinanceExtras();renderGameExtras()}catch(e){}
      try{toast('Demo bakiyene tek seferlik +₺200.000.000 eklendi')}catch(e){}
      return true;
    }catch(e){console.warn('Demo bakiye desteği:',e);return false}
  }

  let attempts=0;
  const timer=setInterval(function(){
    attempts++;
    if(applyOnce()||attempts>=60)clearInterval(timer);
  },500);
})();
