/* EOT_PART app.js-renderStockResearch */
function renderStockResearch(){let e=document.getElementById('stockResearchList');if(!e)return;e.innerHTML=Object.keys(STOCK_INFO).map(sym=>{let x=STOCK_INFO[sym],p=pf[sym]||{qty:0};return '<div class="stock-research-card"><b>'+ASSETS[sym].name+' • '+sym+'</b><div class="research-grid"><div><span>SEKTÖR</span><b>'+x.sector+'</b></div><div><span>PİYASA DEĞERİ</span><b>'+money(x.marketCap)+'</b></div><div><span>KÂRLILIK</span><b>'+x.profitability+'/100</b></div><div><span>RİSK</span><b>'+x.risk+'</b></div><div><span>TEMETTÜ/LOT</span><b>'+money(x.dividend)+'</b></div><div><span>PORTFÖY</span><b>'+Math.round(p.qty||0)+' lot</b></div></div></div>'}).join('')}
/* EOT_END */
/* EOT_PART app.js-collectStockDividends */
function collectStockDividends(){let due=Object.keys(STOCK_INFO).reduce((s,sym)=>s+Number((pf[sym]||{}).qty||0)*STOCK_INFO[sym].dividend,0);if(due<=0){toast('Temettü alacak hissen yok');return}cash+=due;sim.currentMonth.revenue+=due;save();simSave();render();renderGameExtras();toast('Hisse temettüsü • +'+money(due))}
/* EOT_END */
