/* Empire of Trade • Yatırım ekranı ilk toplam tutar senkronu */
(function(){
  'use strict';
  if(window.__eotInvestmentInitialTotalFix)return;
  window.__eotInvestmentInitialTotalFix=true;

  function money(n){
    return '₺'+Number(n||0).toLocaleString('tr-TR',{minimumFractionDigits:0,maximumFractionDigits:2});
  }
  function relevant(){
    var h=(location.hash||'').toLowerCase();
    return /stock|crypto|gold|borsa|kripto|altin/.test(h);
  }
  function activeRoot(){
    try{
      var h=location.hash||'';
      if(h&&/^#[A-Za-z0-9_\-]+$/.test(h)){
        var el=document.querySelector(h);
        if(el)return el;
      }
    }catch(e){}
    return null;
  }
  function qty(input){
    var n=Number(String(input&&input.value||'0').trim().replace(',','.'));
    return Number.isFinite(n)&&n>=0?n:0;
  }
  function syncNow(){
    if(!relevant()||document.hidden||typeof ASSETS==='undefined')return;
    var root=activeRoot();
    if(!root)return;
    try{
      root.querySelectorAll('input[id^="tradeqty_"]').forEach(function(input){
        var sym=String(input.id||'').replace('tradeqty_',''),a=ASSETS[sym];
        if(!a)return;
        var box=document.getElementById('eot_trade_total_'+sym);
        if(!box)return;
        var q=qty(input),buy=box.querySelector('[data-eot-buy-total]'),sell=box.querySelector('[data-eot-sell-total]');
        if(buy)buy.textContent=money(q*Number(a.buy||0));
        if(sell)sell.textContent=money(q*Number(a.sell||0));
      });
      root.querySelectorAll('.asset-card input[id^="qty_"]').forEach(function(input){
        var sym=String(input.id||'').replace('qty_',''),a=ASSETS[sym];
        if(!a)return;
        var card=input.closest('.asset-card'),out=card&&card.querySelector('[data-eot-card-total]');
        if(out)out.textContent=money(qty(input)*Number(a.buy||0));
      });
    }catch(e){}
  }

  /* Route görünür olur olmaz yalnızca rakamları senkronla; ağır render yok. */
  window.addEventListener('hashchange',syncNow,{passive:true});
  document.addEventListener('visibilitychange',function(){if(!document.hidden)syncNow()},{passive:true});

  /* investment-fixes kutuları önceden mount ettikten hemen sonra ilk değeri doldur. */
  syncNow();
  setTimeout(syncNow,0);
  setTimeout(syncNow,140);
})();
