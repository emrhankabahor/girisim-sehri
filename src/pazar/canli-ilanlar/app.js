/* EOT_PART app.js-listingTemplate */
function listingTemplate(){
 return [
  {type:'Arsa',names:['Gelişim Bölgesi Arsası','Ticari Köşe Parsel','Villa İmarlı Arsa'],base:[8500000,18000000,12500000],icon:'🗺️'},
  {type:'Gayrimenkul',names:['Hazır Kiracılı Daire','Cadde Dükkânı','Bahçeli Villa'],base:[7200000,14500000,21000000],icon:'🏠'},
  {type:'Araç',names:['Düşük Km Sedan','Hibrit SUV','Ticari Van'],base:[1550000,2850000,1750000],icon:'🚗'}
 ]
}
/* EOT_END */
/* EOT_PART app.js-generateDynamicListings */
function generateDynamicListings(){
 let arr=[],rep=Math.round(reputation),templates=listingTemplate(),places=[
  {city:'İstanbul',district:'Kadıköy',neighborhood:'Fenerbahçe'},
  {city:'İstanbul',district:'Sarıyer',neighborhood:'Zekeriyaköy'},
  {city:'Ankara',district:'Çankaya',neighborhood:'Çayyolu'},
  {city:'İzmir',district:'Urla',neighborhood:'İskele'},
  {city:'Bursa',district:'Nilüfer',neighborhood:'Özlüce'},
  {city:'Antalya',district:'Konyaaltı',neighborhood:'Hurma'},
  {city:'Muğla',district:'Bodrum',neighborhood:'Yalıkavak'},
  {city:'Kocaeli',district:'Başiskele',neighborhood:'Sahil'}
 ],news=currentNews();
 templates.forEach(t=>t.names.forEach((name,i)=>{
   let loc=places[(arr.length+Math.floor(Math.random()*places.length))%places.length],city= CITY_ECON[loc.city]||{property:1,industry:1},typeEffect=t.type==='Gayrimenkul'?news.housing:t.type==='Araç'?news.auto:news.housing*.55,cityMul=t.type==='Arsa'||t.type==='Gayrimenkul'?city.property:1;
   let market=(.88+Math.random()*.25),ask=Math.round(t.base[i]*market*cityMul*(1+typeEffect)/10000)*10000,quality=Math.round(60+Math.random()*38),flex=Math.max(.90,.97-rep*.00035-Math.random()*.025);
   arr.push({id:'dyn_'+Date.now()+'_'+arr.length,type:t.type,name,ask,quality,flex,icon:t.icon,city:loc.city,district:loc.district,neighborhood:loc.neighborhood,seller:['Bireysel Satıcı','Yatırımcı','Kurumsal Portföy'][Math.floor(Math.random()*3)],expires:Date.now()+240000,rent:t.type==='Gayrimenkul'?Math.round(ask*.0055/1000)*1000:0})
 }));
 sim.dynamicListings=arr.sort(()=>Math.random()-.5).slice(0,8);sim.dynamicRefresh=Date.now()+240000;sim.lastMarketEvolve=Date.now();simSave()
}
/* EOT_END */
/* EOT_PART app.js-evolveDynamicListings */
function evolveDynamicListings(){
 if(!sim.lastMarketEvolve)sim.lastMarketEvolve=Date.now();
 if(Date.now()-sim.lastMarketEvolve<30000)return;
 sim.lastMarketEvolve=Date.now();
 if(sim.dynamicListings.length&&Math.random()<.35){let i=Math.floor(Math.random()*sim.dynamicListings.length),x=sim.dynamicListings[i];if(Math.random()<.35){sim.dynamicListings.splice(i,1);pushNotification('İlan kapandı',x.name+' başka bir alıcı tarafından satın alındı.')}else{x.ask=Math.round(x.ask*(.96+Math.random()*.08)/10000)*10000}}
 if(sim.dynamicListings.length<5)generateDynamicListings();simSave()
}
/* EOT_END */
/* EOT_PART app.js-ensureDynamicListings */
function ensureDynamicListings(){if(!sim.dynamicListings.length||Date.now()>sim.dynamicRefresh)generateDynamicListings();else evolveDynamicListings()}
/* EOT_END */
/* EOT_PART app.js-setDynamicFilter */
function setDynamicFilter(f){sim.dynamicFilter=f;simSave();renderDynamicMarket()}
/* EOT_END */
/* EOT_PART app.js-renderDynamicMarket */
function renderDynamicMarket(){
 ensureDynamicListings();let e=document.getElementById('dynamicListingList');if(!e)return;
 let f=sim.dynamicFilter||'all',list=f==='all'?sim.dynamicListings:sim.dynamicListings.filter(x=>x.type===f);
 document.querySelectorAll('[data-dfilter]').forEach(b=>b.classList.toggle('active',b.dataset.dfilter===f));
 let set=(id,v)=>{let x=document.getElementById(id);if(x)x.textContent=v};set('dynamicCount',list.length);set('dynamicRep',Math.round(reputation));
 let sec=Math.max(0,Math.ceil((sim.dynamicRefresh-Date.now())/1000));set('dynamicTimer',Math.floor(sec/60)+':'+String(sec%60).padStart(2,'0'));
 e.innerHTML=list.map(x=>'<div class="dynamic-listing"><div class="dynamic-listing-head"><div><b>'+x.icon+' '+x.name+'</b><small>'+x.type+' • '+x.seller+'</small></div><div class="dynamic-price">'+money(x.ask)+'</div></div><div class="dynamic-tags"><span>Kalite '+x.quality+'/100</span><span>Süreli ilan</span>'+(x.rent?'<span>Kira '+money(x.rent)+'/ay</span>':'')+'</div><div class="dynamic-actions"><a href="#negotiation" onclick="openNegotiation(\''+x.id+'\')">Pazarlık Yap</a><button onclick="buyDynamicNow(\''+x.id+'\')">İlan Fiyatından Al</button></div></div>').join('')
}
/* EOT_END */
/* EOT_PART app.js-findDynamic */
function findDynamic(id){return sim.dynamicListings.find(x=>x.id===id)}
/* EOT_END */
/* EOT_PART app.js-openNegotiation */
function openNegotiation(id){
 let x=findDynamic(id);if(!x)return false;sim.negotiation={id,acceptedPrice:0,lastOffer:0};simSave();
 let set=(id,v)=>{let e=document.getElementById(id);if(e)e.textContent=v};set('negotiationAssetName',x.name);set('negotiationAsk',money(x.ask));set('negotiationSeller',x.seller);set('negotiationMood','Teklif bekliyor');
 let inp=document.getElementById('negotiationInput');if(inp)inp.value=Math.round(x.ask*.93/10000)*10000;
 let r=document.getElementById('negotiationResponse');if(r)r.textContent='Satıcı teklifini bekliyor.';let ba=document.getElementById('negotiationBuyArea');if(ba)ba.innerHTML='';return true
}
/* EOT_END */
/* EOT_PART app.js-submitNegotiation */
function submitNegotiation(){
 let n=sim.negotiation,x=n&&findDynamic(n.id),offer=Number(document.getElementById('negotiationInput')?.value);if(!x||!offer)return;
 let min=x.ask*x.flex,resp=document.getElementById('negotiationResponse'),buy=document.getElementById('negotiationBuyArea');
 n.lastOffer=offer;
 if(offer>=min){let accepted=Math.min(offer,x.ask);n.acceptedPrice=accepted;if(resp)resp.textContent='Satıcı teklifini kabul etti: '+money(accepted);if(buy)buy.innerHTML='<button class="btn wide" onclick="buyNegotiated()">Anlaşmayı Tamamla • '+money(accepted)+'</button>';reputation=clamp(reputation+1,0,100)}
 else if(offer>=min*.96){let counter=Math.round(((offer+min)/2)/10000)*10000;n.acceptedPrice=counter;if(resp)resp.textContent='Karşı teklif: '+money(counter);if(buy)buy.innerHTML='<button class="btn wide" onclick="buyNegotiated()">Karşı Teklifi Kabul Et • '+money(counter)+'</button>'}
 else{if(resp)resp.textContent='Satıcı teklifi düşük buldu. Biraz daha yükseltmelisin.';if(buy)buy.innerHTML='';reputation=clamp(reputation-.3,0,100)}
 simSave();renderRealism()
}
/* EOT_END */
/* EOT_PART app.js-finishDynamicBuy */
function finishDynamicBuy(x,price){
 if(cash<price){toast('Yetersiz nakit');return false}cash-=price;ownedAssets.push({id:x.id,name:x.name,type:x.type,price,rent:Number(x.rent||0),rented:false,t:Date.now(),rentReady:0});sim.dynamicListings=sim.dynamicListings.filter(y=>y.id!==x.id);sim.currentMonth.expense+=price;tx.unshift({t:Date.now(),kind:'asset',type:'asset_buy',sym:x.name,total:price});saveOwned();simSave();save();render();renderGameExtras();pushNotification('Yeni yatırım',x.name+' '+money(price)+' karşılığında satın alındı.');return true
}
/* EOT_END */
/* EOT_PART app.js-buyDynamicNow */
function buyDynamicNow(id){let x=findDynamic(id);if(!x)return;if(finishDynamicBuy(x,x.ask)){toast('Satın alma tamamlandı');renderDynamicMarket()}}
/* EOT_END */
/* EOT_PART app.js-buyNegotiated */
function buyNegotiated(){let n=sim.negotiation,x=n&&findDynamic(n.id);if(!x||!n.acceptedPrice)return;if(finishDynamicBuy(x,n.acceptedPrice)){sim.negotiation=null;simSave();location.hash='myassets';toast('Pazarlıkla satın alma tamamlandı')}}
/* EOT_END */
