/* Empire of Trade • Zero Save ilk çalıştırma temizliği */
(function(){
  'use strict';
  const FLAG='eot_zero_save_initialized_v1';
  try{
    if(localStorage.getItem(FLAG)==='1') return;
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem(FLAG,'1');
  }catch(e){}
})();
