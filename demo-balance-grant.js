/* Girişim Şehri • Tek seferlik demo bakiye desteği */
(function(){
  const GRANT=200000000;
  const KEY='gs_demo_grant_200m_v2';

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
    try{if(u&&u.id&&u.id!=='guest'&&typeof saveAccountCareer==='function')saveAccountCareer(u.id)}catch(e){}
    try{if(typeof captureCareerState==='function')localStorage.setItem('gs140_state',JSON.stringify(captureCareerState()))}catch(e){}
  }

  function grant(){
    try{
      const u=account();
      const k=accountKey(u);
      if(localStorage.getItem(k)==='1')return true;
      if(typeof cash!=='number')return false;

      cash=Number(cash||0)+GRANT;
      if(typeof tx!=='undefined'&&Array.isArray(tx)){
        tx.unshift({t:Date.now(),kind:'system',type:'demo_grant',sym:'Demo Test Bakiyesi',total:GRANT});
      }
      persist(u);
      localStorage.setItem(k,'1');

      try{render();renderFinanceExtras();renderGameExtras()}catch(e){}
      try{toast('Demo bakiyene +₺200.000.000 eklendi')}catch(e){}
      return true;
    }catch(e){console.warn('Demo bakiye desteği:',e);return false}
  }

  let attempts=0;
  const timer=setInterval(function(){
    attempts++;
    if(grant()||attempts>=20)clearInterval(timer);
  },500);
})();
