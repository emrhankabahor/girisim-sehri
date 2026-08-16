/* Empire of Trade - güvenli yatırım toplam tutar göstergesi. */
(function(){
  'use strict';

  function money(n){
    return '₺'+Number(n||0).toLocaleString('tr-TR',{minimumFractionDigits:0,maximumFractionDigits:2});
  }

  function readPrice(sym,type){
    var el=document.getElementById(type+'_'+sym);
    if(!el)return 0;
    var s=String(el.textContent||'').trim().replace(/₺/g,'').replace(/\s/g,'');
    if(!s)return 0;
    if(s.indexOf(',')>-1){
      s=s.replace(/\./g,'').replace(',','.');
    }else{
      var parts=s.split('.');
      if(parts.length>2 || (parts.length===2 && parts[1].length===3)) s=parts.join('');
    }
    var n=Number(s.replace(/[^0-9.-]/g,''));
    return Number.isFinite(n)?n:0;
  }

  function updateTotal(input){
    if(!input || !input.id)return;
    var sym=input.id.replace('tradeqty_','');
    var q=Number(input.value||0);
    if(!Number.isFinite(q) || q<0)q=0;
    var box=document.getElementById('eot_trade_total_'+sym);
    if(!box)return;
    var buy=readPrice(sym,'buy');
    var sell=readPrice(sym,'sell');
    var buyOut=box.querySelector('[data-eot-buy-total]');
    var sellOut=box.querySelector('[data-eot-sell-total]');
    if(buyOut)buyOut.textContent=money(q*buy);
    if(sellOut)sellOut.textContent=money(q*sell);
  }

  function attachToInput(input){
    if(!input || input.dataset.eotTotalReady==='1')return;
    var sym=input.id.replace('tradeqty_','');
    var box=document.createElement('div');
    box.id='eot_trade_total_'+sym;
    box.className='eot-trade-total-safe';
    box.innerHTML='<div><span>ALIM TOPLAMI</span><b data-eot-buy-total>₺0</b></div><div><span>SATIŞ TOPLAMI</span><b data-eot-sell-total>₺0</b></div>';
    input.insertAdjacentElement('afterend',box);
    input.dataset.eotTotalReady='1';
    input.addEventListener('input',function(){updateTotal(input)});
    input.addEventListener('change',function(){updateTotal(input)});
    updateTotal(input);
  }

  function install(){
    try{
      document.querySelectorAll('input[id^="tradeqty_"]').forEach(attachToInput);
      document.querySelectorAll('input[id^="tradeqty_"][data-eot-total-ready="1"]').forEach(updateTotal);
    }catch(e){
      console.warn('Yatırım toplam göstergesi yüklenemedi:',e);
    }
  }

  function addStyle(){
    if(document.getElementById('eot-trade-total-safe-style'))return;
    var st=document.createElement('style');
    st.id='eot-trade-total-safe-style';
    st.textContent='.eot-trade-total-safe{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:9px 0 3px}.eot-trade-total-safe>div{min-width:0;padding:10px 11px;border:1px solid rgba(148,190,224,.14);border-radius:12px;background:rgba(12,34,54,.72)}.eot-trade-total-safe span{display:block;margin-bottom:4px;color:#8fa6bb;font-size:7px;font-weight:800;letter-spacing:.08em}.eot-trade-total-safe b{display:block;color:#f7fbff;font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.eot-trade-total-safe>div:first-child b{color:#74e6b6}.eot-trade-total-safe>div:last-child b{color:#8fdcff}';
    document.head.appendChild(st);
  }

  addStyle();
  window.addEventListener('hashchange',function(){setTimeout(install,80)});
  window.addEventListener('load',function(){setTimeout(install,250)});

  /* İçerik bootstrap.js ile sonradan geldiği için kısa ve sınırlı bir ilk kurulum kontrolü. */
  var tries=0;
  var bootTimer=setInterval(function(){
    tries++;
    install();
    if(tries>=20)clearInterval(bootTimer);
  },500);

  /* Fiyatlar hareket ettiğinde toplamın da güncel kalması için sadece mevcut alanları okur. */
  setInterval(function(){
    document.querySelectorAll('input[id^="tradeqty_"][data-eot-total-ready="1"]').forEach(updateTotal);
  },3000);
})();
