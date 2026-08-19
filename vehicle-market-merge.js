/* Empire of Trade • 2. El Araçlar birleşik ilan pazarı */
(function(){
  'use strict';
  if(window.__eotVehicleMarketMerged)return;
  window.__eotVehicleMarketMerged=true;

  function removeLegacyRoutes(){
    document.querySelectorAll('a[href="#brand_dealers"],a[href="#used_market_plus"]').forEach(function(a){a.remove()});
    var dealer=document.getElementById('brand_dealers');
    if(dealer)dealer.remove();
  }

  function buildUsedMarket(){
    var used=document.getElementById('cars_used');
    if(!used)return false;

    var head=used.querySelector('.panel-head');
    if(head){
      var back=head.querySelector('.backbtn');if(back)back.setAttribute('href','#cars');
      var title=head.querySelector('.panel-title h2');if(title)title.textContent='2. El Araçlar';
      var sub=head.querySelector('.panel-title p');if(sub)sub.textContent='Detaylı ikinci el araç ilanları';
    }

    var list=document.getElementById('detailedUsedList');
    if(!list){list=document.createElement('div');list.id='detailedUsedList'}

    Array.from(used.children).forEach(function(el){if(el!==head)el.remove()});

    var intro=document.createElement('div');
    intro.className='used-market-merged-head';
    intro.innerHTML='<div><span>2. EL PAZARI</span><h3>Güncel Araç İlanları</h3><p>Yıl, kilometre, motor, yakıt, paket, hasar, boya ve kondisyon bilgilerini inceleyerek araç seç.</p></div><button type="button" onclick="refreshDetailedUsed()">İlanları Yenile</button>';
    used.appendChild(intro);
    used.appendChild(list);

    var plus=document.getElementById('used_market_plus');
    if(plus)plus.remove();
    removeLegacyRoutes();

    if(!document.getElementById('eot-used-market-merge-style')){
      var st=document.createElement('style');st.id='eot-used-market-merge-style';
      st.textContent='.used-market-merged-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin:14px 0;padding:15px;border:1px solid rgba(103,177,224,.18);border-radius:18px;background:linear-gradient(145deg,rgba(16,43,68,.96),rgba(9,28,47,.96))}.used-market-merged-head span{display:block;color:#72d8ee;font-size:7px;font-weight:900;letter-spacing:.13em}.used-market-merged-head h3{margin:4px 0 4px;font-size:15px}.used-market-merged-head p{margin:0;max-width:320px;color:#8fa5ba;font-size:8px;line-height:1.45}.used-market-merged-head button{flex:0 0 auto;border:1px solid rgba(96,165,250,.2);border-radius:11px;background:#153754;color:#d9f3ff;padding:9px 10px;font-size:7.5px;font-weight:900}@media(max-width:430px){.used-market-merged-head{flex-direction:column}.used-market-merged-head button{width:100%}}';
      document.head.appendChild(st);
    }

    try{if(typeof renderDetailedUsed==='function')renderDetailedUsed();else if(typeof generateDetailedUsed==='function'){generateDetailedUsed();if(typeof renderDetailedUsed==='function')renderDetailedUsed()}}catch(e){console.warn('2. el ilanları hazırlanamadı:',e)}
    return true;
  }

  function install(){
    removeLegacyRoutes();
    if(buildUsedMarket())return;
    var tries=0;
    var timer=setInterval(function(){tries++;if(buildUsedMarket()||tries>=30)clearInterval(timer)},100);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
})();
