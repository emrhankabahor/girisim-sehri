/* EOT_PART app.js-dealerListingFor */
function dealerListingFor(id){return sim.dealerListings.find(x=>x.assetId===id)}
/* EOT_END */
/* EOT_PART app.js-listDealerCar */
function listDealerCar(index,markup){
 let a=ownedAssets[index];if(!a||a.type!=='Araç'){toast('Araç bulunamadı');return}
 let existing=dealerListingFor(a.id),price=Math.round(a.price*(1+markup/100)/1000)*1000;
 if(existing){existing.price=price;existing.markup=markup}else sim.dealerListings.push({assetId:a.id,price,markup,t:Date.now()});
 simSave();renderDealer();toast('Araç '+money(price)+' fiyatla ilana kondu')
}
/* EOT_END */
/* EOT_PART app.js-removeDealerListing */
function removeDealerListing(id){sim.dealerListings=sim.dealerListings.filter(x=>x.assetId!==id);simSave();renderDealer()}
/* EOT_END */
/* EOT_PART app.js-checkDealerOffers */
function checkDealerOffers(){
 if(!sim.dealerListings.length){toast('İlanda araç yok');return}
 let sold=0;
 [...sim.dealerListings].forEach(l=>{let a=ownedAssets.find(x=>x.id===l.assetId);if(!a){removeDealerListing(l.assetId);return}let chance=l.markup<=5?.8:l.markup<=10?.55:.3;if(Math.random()<chance){cash+=l.price;ownedAssets=ownedAssets.filter(x=>x.id!==a.id);sim.dealerListings=sim.dealerListings.filter(x=>x.assetId!==a.id);tx.unshift({t:Date.now(),kind:'asset',type:'asset_sell',sym:a.name,total:l.price});sold++;pushNotification('Galeride satış',a.name+' '+money(l.price)+' fiyatla satıldı.')}});saveOwned();save();render();renderGameExtras();toast(sold?sold+' araç satıldı':'Bu tur müşteri çıkmadı')
}
/* EOT_END */
/* EOT_PART app.js-renderDealer */
function renderDealer(){
 let cars=ownedAssets.map((a,i)=>({a,i})).filter(o=>o.a.type==='Araç'),e=document.getElementById('dealerCars'),set=(id,v)=>{let x=document.getElementById(id);if(x)x.textContent=v};
 set('dealerStock',cars.length);set('dealerListed',sim.dealerListings.length);set('dealerValue',money(cars.reduce((s,o)=>s+o.a.price,0)));
 if(!e)return;e.innerHTML=cars.length?cars.map(o=>{let l=dealerListingFor(o.a.id);return '<div class="dealer-card"><b>'+o.a.name+'</b><span>Alış değeri '+money(o.a.price)+(l?' • İlan '+money(l.price):' • İlanda değil')+'</span><div class="dealer-actions"><button onclick="listDealerCar('+o.i+',5)">%5 Kârla İlan</button><button onclick="listDealerCar('+o.i+',10)">%10 Kârla İlan</button>'+(l?'<button onclick="removeDealerListing(\''+o.a.id+'\')">İlanı Kaldır</button>':'')+'</div></div>'}).join(''):'<div class="info-card"><p>Galeride araç stoğu yok.</p></div>'
}
/* EOT_END */
