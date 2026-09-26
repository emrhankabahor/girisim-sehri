/* EOT_PART app.js-renderCrisis */
function renderCrisis(){
 let nw=totalWealth(),d=debt()+Number(sim.creditCard.used||0),ratio=d/Math.max(1,nw+d),risk=ratio>.75||nw<0?'Kritik':ratio>.5?'Yüksek':ratio>.3?'Orta':'Düşük',set=(id,v)=>{let e=document.getElementById(id);if(e)e.textContent=v};set('crisisRisk',risk);set('crisisCash',money(cash));set('crisisDebt',money(d));set('crisisNet',money(nw));let a=document.getElementById('crisisAdvice');if(a)a.textContent=risk==='Kritik'?'Borcu azalt, yüksek maliyetli varlıkları sat ve yapılandırma kullan.':risk==='Yüksek'?'Yeni kredi kullanmadan önce nakit akışını düzelt.':'Finansal yapı yönetilebilir seviyede.'
}
/* EOT_END */
/* EOT_PART app.js-emergencyAssetSale */
function emergencyAssetSale(){let candidates=ownedAssets.map((a,i)=>({a,i})).filter(x=>!x.a.collateral).sort((x,y)=>y.a.price-x.a.price);if(!candidates.length){toast('Satılabilir varlık yok');return}let o=candidates[0],amount=Math.round(o.a.price*.82);cash+=amount;ownedAssets.splice(o.i,1);tx.unshift({t:Date.now(),kind:'asset',type:'asset_sell',sym:'Acil '+o.a.name,total:amount});saveOwned();save();render();renderGameExtras();toast('Acil satış • +'+money(amount))}
/* EOT_END */
/* EOT_PART app.js-emergencyRestructure */
function emergencyRestructure(){let list=active();if(!list.length){toast('Aktif kredi yok');return}let l=list.sort((a,b)=>b.remaining-a.remaining)[0];l.months=6;l.rate=Number(l.rate||3)+.8;l.total=l.remaining*(1+l.rate/100*6);l.remaining=l.total;l.installment=l.total/6;creditScore=clamp(creditScore-4,0,100);save();render();renderGameExtras();toast('En büyük kredi 6 aya yapılandırıldı')}
/* EOT_END */
