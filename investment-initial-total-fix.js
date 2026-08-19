/* Empire of Trade • Yatırım ekranı ilk toplam tutar senkronu */
(function(){
  'use strict';
  if(window.__eotInvestmentInitialTotalFix)return;
  window.__eotInvestmentInitialTotalFix=true;

  function money(n){
    return '₺'+Number(n||0).toLocaleString('tr-TR',{minimumFractionDigits:0,maximumFractionDigits:2});
  }
  function qty(input){
    var n=Number(String(input&&input.value||'0').trim().replace(',','.'));
    return Number.isFinite(n)&&n>=0?n:0;
  }
  function syncAll(){
    if(typeof ASSETS==='undefined')return 0;
    var count=0;
    try{
      document.querySelectorAll('.screen input[id^="tradeqty_"]').forEach(function(input){
        var sym=String(input.id||'').replace('tradeqty_',''),a=ASSETS[sym];
        if(!a)return;
        var box=document.getElementById('eot_trade_total_'+sym);
        if(!box)return;
        var q=qty(input),buy=box.querySelector('[data-eot-buy-total]'),sell=box.querySelector('[data-eot-sell-total]');
        if(buy)buy.textContent=money(q*Number(a.buy||0));
        if(sell)sell.textContent=money(q*Number(a.sell||0));
        count++;
      });
      document.querySelectorAll('.screen .asset-card input[id^="qty_"]').forEach(function(input){
        var sym=String(input.id||'').replace('qty_',''),a=ASSETS[sym];
        if(!a)return;
        var card=input.closest('.asset-card'),out=card&&card.querySelector('[data-eot-card-total]');
        if(!out)return;
        out.textContent=money(qty(input)*Number(a.buy||0));
        count++;
      });
    }catch(e){}
    return count;
  }

  /* Ana yatırım modülü kutuları gizli ekranlarda oluşturur. Hazır olur olmaz değerleri bir kez doldur ve dur. */
  var tries=0;
  var warmup=setInterval(function(){
    tries++;
    var ready=syncAll();
    if(ready>0||tries>=30){
      clearInterval(warmup);
      warmup=0;
      /* Kripto varsayılan miktarı gibi son anda normalize edilen inputlar için tek son senkron. */
      setTimeout(syncAll,80);
    }
  },25);

  /* Sonraki route girişlerinde yalnızca rakamları senkronla; ağır render yok. */
  window.addEventListener('hashchange',syncAll,{passive:true});
  document.addEventListener('visibilitychange',function(){if(!document.hidden)syncAll()},{passive:true});
})();
