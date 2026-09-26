/* EOT_PART app.js-totalWealth */
function totalWealth(){
 return cash+ownedValue()+depositStats().total+stats('stock').value+stats('crypto').value+stats('gold').value+
 sim.ipoHoldings.reduce((s,h)=>s+h.qty*h.price,0)-debt()-Number(sim.creditCard.used||0)
}
/* EOT_END */
/* EOT_PART app.js-recordWealth */
function recordWealth(){let n=totalWealth(),last=sim.wealthHistory[0];if(!last||last.month!==sim.gameMonth){sim.wealthHistory.unshift({month:sim.gameMonth,value:n,t:Date.now()});sim.wealthHistory=sim.wealthHistory.slice(0,20);simSave()}}
/* EOT_END */
/* EOT_PART app.js-renderWealth */
function renderWealth(){recordWealth();let e=document.getElementById('wealthChart'),l=document.getElementById('wealthHistoryList');if(e){let vals=sim.wealthHistory.slice(0,12).reverse(),mx=Math.max(1,...vals.map(x=>x.value));e.innerHTML=vals.map(x=>'<div class="wealth-bar" style="height:'+Math.max(8,Math.round(x.value/mx*100))+'%"><span>Ay '+x.month+'</span></div>').join('')}if(l)l.innerHTML=sim.wealthHistory.slice(0,12).map(x=>'<div class="wealth-row"><span>Ay '+x.month+'</span><b>'+money(x.value)+'</b></div>').join('')}
/* EOT_END */
