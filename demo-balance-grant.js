/* Empire of Trade • Demo test bakiyesi kilidi
   ₺200.000.000 demo desteği daha önce uygulandı.
   Bu dosya artık hiçbir açılışta bakiye eklemez veya bakiyeyi sabitlemez.
   Oyuncunun mevcut nakdi yalnızca normal kayıt sistemi tarafından yönetilir. */
(function(){
  try{
    const u=(typeof currentAccount==='function')?currentAccount():null;
    if(u&&u.id){
      localStorage.setItem('gs_demo_balance_200m_consumed_'+u.id,'1');
    }
    localStorage.setItem('gs_demo_balance_200m_consumed','1');
  }catch(e){
    console.warn('Demo bakiye kilidi:',e);
  }
})();
