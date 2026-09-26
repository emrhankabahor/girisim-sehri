/* EOT_PART app.js-stats */
function stats(g){let value=0,cost=0;Object.keys(ASSETS).forEach(s=>{let a=ASSETS[s],p=pf[s];if(a.group===g&&p&&p.qty>0){value+=p.qty*a.sell;cost+=p.qty*p.avg}});return{value,pnl:value-cost}}
/* EOT_END */
/* EOT_PART app.js-trade */
function trade(sym,type){
 let a=ASSETS[sym],inp=document.getElementById('qty_'+sym),q=Number(inp&&inp.value);
 if(!q||q<=0){toast('Geçerli miktar gir');return false}
 let wholeOnly=a.group==='stock'||sym==='GRAM'||sym==='CEYREK'||sym==='TAM'||sym==='YARIM'||sym==='CUMHUR'||sym==='KULCE';
 if(wholeOnly&&!Number.isInteger(q)){toast(assetUnit(sym)+' miktarı tam sayı olmalı');return false}
 let p=type==='buy'?a.buy:a.sell,total=p*q,pos=pf[sym]||{qty:0,avg:0};
 if(type==='buy'){
   if(cash<total){toast('Yetersiz nakit');return false}
   let nq=pos.qty+q;pos.avg=((pos.avg*pos.qty)+(p*q))/nq;pos.qty=nq;cash-=total
 }else{
   if(pos.qty<q){toast('Portföyde yeterli varlık yok');return false}
   realized+=(p-pos.avg)*q;pos.qty-=q;cash+=total;if(pos.qty<1e-8){pos.qty=0;pos.avg=0}
 }
 pf[sym]=pos;tx.unshift({t:Date.now(),sym,type,qty:q,price:p,total,kind:'trade'});tx=tx.slice(0,100);
 save();render();
 setTradeResult(sym,type,q,total,pos.qty);
 toast(a.name+' '+(type==='buy'?'alındı':'satıldı'));
 return true
}
/* EOT_END */
/* EOT_PART app.js-setTradeResult */
function setTradeResult(sym,type,q,total,remaining){
 let a=ASSETS[sym],title=document.getElementById('resultTitle_'+sym+'_'+type),
 text=document.getElementById('resultText_'+sym+'_'+type),detail=document.getElementById('resultDetail_'+sym+'_'+type);
 if(title)title.textContent='✅ '+(type==='buy'?'Alım tamamlandı':'Satış tamamlandı');
 if(text)text.textContent=qtyWithUnit(q,sym)+' '+a.name+' '+(type==='buy'?'alındı.':'satıldı.');
 if(detail)detail.innerHTML=(type==='buy'?'Nakitten düşen: <b>'+money(total)+'</b>':'Nakde eklenen: <b>'+money(total)+'</b>')+' • Portföyde kalan: <b>'+qtyWithUnit(remaining,sym)+'</b>';
}
/* EOT_END */
/* EOT_PART app.js-syncTradeQty */
function syncTradeQty(sym){
 let source=document.getElementById('qty_'+sym),target=document.getElementById('tradeqty_'+sym);
 if(!source||!target)return true;
 let q=source.value;
 if(q!==''&&Number(q)>0)target.value=q;
 return true
}
/* EOT_END */
/* EOT_PART app.js-tradeFromScreenAndGo */
function tradeFromScreenAndGo(sym,type,target){
 let s=document.getElementById('tradeqty_'+sym),t=document.getElementById('qty_'+sym);
 if(t&&s)t.value=s.value;
 let ok=trade(sym,type);
 if(!ok){if(event&&event.preventDefault)event.preventDefault();return false}
 location.hash=target;
 return false
}
/* EOT_END */
/* EOT_PART app.js-tradeFromScreen */
function tradeFromScreen(sym,type){
 let s=document.getElementById('tradeqty_'+sym),t=document.getElementById('qty_'+sym);
 if(t&&s)t.value=s.value;
 let ok=trade(sym,type);
 if(!ok){event&&event.preventDefault&&event.preventDefault();return false}
 return true
}
/* EOT_END */
/* EOT_PART app.js-renderAssets */
function renderAssets(){document.querySelectorAll('.asset-card').forEach(card=>{let inp=card.querySelector('input[id^="qty_"]');if(!inp)return;let sym=inp.id.replace('qty_',''),a=ASSETS[sym],p=pf[sym]||{qty:0},boxes=card.querySelectorAll('.asset-mini div'),price=card.querySelector('.asset-price b');if(price)price.textContent=money(a.buy);if(boxes[0])boxes[0].innerHTML='<span>ALIŞ</span><b>'+money(a.buy)+'</b>';if(boxes[1])boxes[1].innerHTML='<span>SATIŞ</span><b>'+money(a.sell)+'</b>';if(boxes[2])boxes[2].innerHTML='<span>ELİNDE</span><b>'+qtyText(p.qty)+'</b>'});Object.keys(ASSETS).forEach(sym=>{let b=document.getElementById('buy_'+sym),s=document.getElementById('sell_'+sym),h=document.getElementById('held_'+sym);if(b)b.textContent=money(ASSETS[sym].buy);if(s)s.textContent=money(ASSETS[sym].sell);if(h)h.textContent=qtyWithUnit((pf[sym]||{qty:0}).qty,sym)})}
/* EOT_END */
/* EOT_PART app.js-portfolio */
function portfolio(g,id){let e=document.getElementById(id);if(!e)return;let rows=[];Object.keys(ASSETS).filter(s=>ASSETS[s].group===g).forEach(sym=>{let p=pf[sym],a=ASSETS[sym];if(p&&p.qty>0){let v=p.qty*a.sell,pnl=v-p.qty*p.avg;rows.push('<div class="portfolio-row"><div><b>'+a.name+'</b><br><span>'+qtyWithUnit(p.qty,sym)+' • Ort. '+money(p.avg)+'</span></div><div style="text-align:right"><b>'+money(v)+'</b><br><span class="'+(pnl>=0?'profit':'loss2')+'">'+money(pnl)+'</span></div></div>')}});e.innerHTML=rows.length?rows.join(''):'<div class="portfolio-row"><span>Henüz varlık yok.</span><b>—</b></div>'}
/* EOT_END */
/* EOT_PART app.js-movePrices */
function movePrices(){
 let news=currentNews(),macro=sim.macro||{cycle:'Dengeli'},cycle=macro.cycle;
 Object.keys(ASSETS).forEach(sym=>{
  let a=ASSETS[sym],b=BASE[sym],vol=a.group==='crypto'?.025:a.group==='stock'?.009:.004;
  let newsBias=a.group==='crypto'?news.crypto:a.group==='stock'?news.stock:news.gold;
  let macroBias=a.group==='stock'?(cycle==='Büyüme'?.003:cycle==='Durgunluk'?-0.004:0):a.group==='crypto'?(cycle==='Büyüme'?.004:cycle==='Durgunluk'?-0.006:0):cycle==='Sıkılaşma'?.002:0;
  let m=(Math.random()*2-1)*vol+newsBias*.08+macroBias,n=clamp(a.buy*(1+m),b.buy*.55,b.buy*1.65),spread=(b.sell/b.buy)*(1+(Math.random()-.5)*.002);
  a.buy=n;a.sell=n*spread
 });render()
}
/* EOT_END */
