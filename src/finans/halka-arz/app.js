/* EOT_PART app.js-ensureIpos */
function ensureIpos(){if(sim.ipos.length)return;sim.ipos=[{id:'ipo1',name:'Anadolu Enerji',price:42,available:5000,dividend:.8},{id:'ipo2',name:'Yeni Nesil Lojistik',price:68,available:3500,dividend:1.25},{id:'ipo3',name:'Dijital Perakende',price:31,available:7000,dividend:.45}];simSave()}
/* EOT_END */
/* EOT_PART app.js-buyIpo */
function buyIpo(i){
 let x=sim.ipos[i];if(!x||x.available<=0)return;let requested=100,demand=.45+Math.random()*.75,allocated=Math.max(10,Math.min(requested,x.available,Math.round(requested/demand/10)*10)),total=allocated*x.price;
 if(cash<total){toast('Yetersiz nakit');return}cash-=total;x.available-=allocated;let h=sim.ipoHoldings.find(h=>h.id===x.id);if(h)h.qty+=allocated;else sim.ipoHoldings.push({id:x.id,name:x.name,qty:allocated,price:x.price,dividend:x.dividend});sim.currentMonth.expense+=total;simSave();save();render();renderGameExtras();toast('Talep sonucu '+allocated+' lot dağıtıldı')
}
/* EOT_END */
/* EOT_PART app.js-collectDividends */
function collectDividends(){let due=sim.ipoHoldings.reduce((s,h)=>s+h.qty*h.dividend,0);if(due<=0){toast('Temettü oluşmadı');return}cash+=due;sim.currentMonth.revenue+=due;simSave();save();render();renderGameExtras();toast('Temettü geliri • +'+money(due))}
/* EOT_END */
/* EOT_PART app.js-renderIpos */
function renderIpos(){ensureIpos();let e=document.getElementById('ipoList');if(e)e.innerHTML=sim.ipos.map((x,i)=>'<div class="ipo-card"><b>'+x.name+'</b><span>Fiyat '+money(x.price)+' • Kalan '+x.available+' lot • Temettü/lot '+money(x.dividend)+'</span><div class="mini-actions"><button onclick="buyIpo('+i+')">100 Lot Al</button></div></div>').join('');let set=(id,v)=>{let q=document.getElementById(id);if(q)q.textContent=v};set('ipoCount',sim.ipos.length);set('ipoValue',money(sim.ipoHoldings.reduce((s,h)=>s+h.qty*h.price,0)));set('dividendDue',money(sim.ipoHoldings.reduce((s,h)=>s+h.qty*h.dividend,0)))}
/* EOT_END */
