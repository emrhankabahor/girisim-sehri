/* Empire of Trade - tek seferlik TAM sifirlama */
(function(){
  'use strict';
  const marker='eot_full_reset_20260901_v1';
  try{
    if(localStorage.getItem(marker)==='1') return;
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem(marker,'1');
  }catch(e){}
})();
