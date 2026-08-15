/* Girişim Şehri • Kalıcı demo test bakiyesi */
(function(){
  const TARGET=200000000;
  const KEY='gs_demo_balance_200m_v3';

  function account(){
    try{return typeof currentAccount==='function'?currentAccount():null}catch(e){return null}
  }
  function accountKey(u){return KEY+'_'+(u&&u.id?u.id:'guest')}

  function writeCareer(u){
    try{localStorage.setItem('gs124_cash',String(cash))}catch(e){}
    try{if(typeof save==='function')save()}catch(e){}
    try{if(typeof simSave==='function')simSave()}catch(e){}
    try{if(typeof saveOwned==='function')saveOwned()}catch(e){}
    try{if(typeof saveUnifiedState==='function')saveUnifiedState()}catch(e){}
    try{
      if(typeof captureCareerState==='function'){
        const state=captureCareerState();
        state.cash=TARGET;
        state.savedAt=Date.now();
        localStorage.setItem('gs140_state',JSON.stringify(state));
        if(u&&u.id&&u.id!=='guest')localStorage.setItem('gs_account_career_'+u.id,JSON.stringify(state));
      }else if(u&&u.id&&u.id!=='guest'&&typeof saveAccountCareer==='function'){
        saveAccountCareer(u.id);
      }
    }catch(e){}
  }

  function apply(){
    try{
      const u=account();
      if(!u||!u.id||u.id==='guest')return false;
      const k=accountKey(u);
      if(typeof cash!=='number')return false;

      // Kariyer yüklendikten sonra demo hesabının nakdini doğrudan hedef değere getir.
      // Böylece eski ₺0 kayıt tekrar yüklenip desteği ezemez.
      if(localStorage.getItem(k)!=='1' || Number(cash)!==TARGET){
        cash=TARGET;
        if(typeof tx!=='undefined'&&Array.isArray(tx) && !tx.some(x=>x&&x.type==='demo_balance_v3')){
          tx.unshift({t:Date.now(),kind:'system',type:'demo_balance_v3',sym:'Demo Test Bakiyesi',total:TARGET});
        }
        writeCareer(u);
        localStorage.setItem(k,'1');
        try{render();renderFinanceExtras();renderGameExtras()}catch(e){}
        try{toast('Demo test bakiyesi ₺200.000.000 olarak ayarlandı')}catch(e){}
      }
      return true;
    }catch(e){console.warn('Demo bakiye ayarı:',e);return false}
  }

  // Hesap/kariyer yükleme akışının tamamlanmasını bekle.
  let attempts=0;
  const timer=setInterval(function(){
    attempts++;
    if(apply()||attempts>=60)clearInterval(timer);
  },500);

  // Sekmeye geri dönüldüğünde eski kayıt bakiyeyi ezdiyse tekrar düzelt.
  document.addEventListener('visibilitychange',function(){if(!document.hidden)setTimeout(apply,250)});
  window.addEventListener('pageshow',function(){setTimeout(apply,250)});
})();
