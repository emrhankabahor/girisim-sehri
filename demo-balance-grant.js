/* Empire of Trade • Tek seferlik ₺500.000.000 demo test bakiyesi */
(function(){
  try{
    const u=(typeof currentAccount==='function')?currentAccount():null;
    const id=u&&u.id?String(u.id):'guest';
    const key='gs_demo_balance_500m_v1_'+id;
    if(localStorage.getItem(key)==='1')return;
    if(typeof cash==='undefined')return;

    cash=500000000;
    localStorage.setItem(key,'1');
    localStorage.setItem('gs124_cash',String(cash));

    if(typeof tx!=='undefined'&&Array.isArray(tx)){
      tx.unshift({t:Date.now(),kind:'demo_grant',type:'demo_balance',sym:'Demo test bakiyesi',total:500000000});
      tx=tx.slice(0,100);
    }
    if(typeof save==='function')save();
    if(u&&u.id&&u.id!=='guest'&&typeof saveAccountCareer==='function')saveAccountCareer(u.id);
    if(typeof render==='function')render();
    if(typeof renderFinanceExtras==='function')renderFinanceExtras();
    if(typeof renderGameExtras==='function')renderGameExtras();
    if(typeof toast==='function')toast('Demo test bakiyesi • ₺500.000.000');
  }catch(e){
    console.warn('Demo bakiye yüklenemedi:',e);
  }
})();
