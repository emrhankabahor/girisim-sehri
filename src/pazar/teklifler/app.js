/* EOT_PART app.js-generateNpcOffers */
function generateNpcOffers(){
 let rep=Math.round(reputation),disc=Math.min(12,3+Math.floor(rep/20)),base=[
  {name:'Fırsat Dairesi',type:'Gayrimenkul',price:7200000},
  {name:'İkinci El SUV',type:'Araç',price:2050000},
  {name:'Gelişim Bölgesi Arsası',type:'Arsa',price:12500000}
 ];
 sim.npcOffers=base.map((o,i)=>({...o,id:'npc_'+Date.now()+'_'+i,discount:Math.max(2,disc-Math.floor(Math.random()*3)),expires:Date.now()+180000}));
 sim.npcRefresh=Date.now()+180000;simSave()
}
/* EOT_END */
/* EOT_PART app.js-refreshNpcOffers */
function refreshNpcOffers(force=false){if(force&&Date.now()<sim.npcRefresh){toast('Teklifler henüz yenilenmedi');return}generateNpcOffers();renderNpcOffers()}
/* EOT_END */
/* EOT_PART app.js-renderNpcOffers */
function renderNpcOffers(){
 if(!sim.npcOffers.length||Date.now()>sim.npcRefresh)generateNpcOffers();
 let e=document.getElementById('npcOfferList');if(!e)return;
 e.innerHTML=sim.npcOffers.map((o,i)=>{let final=Math.round(o.price*(1-o.discount/100)/1000)*1000;return '<div class="offer-card"><b>'+o.name+'</b><span>'+o.type+' • İtibar indirimi %'+o.discount+'</span><div class="offer-price"><del>'+money(o.price)+'</del><strong>'+money(final)+'</strong></div><button onclick="acceptNpcOffer('+i+')">Teklifi Kabul Et</button></div>'}).join('')
}
/* EOT_END */
/* EOT_PART app.js-acceptNpcOffer */
function acceptNpcOffer(i){
 let o=sim.npcOffers[i];if(!o)return;let price=Math.round(o.price*(1-o.discount/100)/1000)*1000;
 if(cash<price){toast('Yetersiz nakit');return}
 cash-=price;ownedAssets.push({id:o.id,name:o.name,type:o.type,price,t:Date.now(),rent:o.type==='Gayrimenkul'?45000:0,rentReady:o.type==='Gayrimenkul'?Date.now()+30000:0});sim.npcOffers.splice(i,1);reputation=clamp(reputation+1,0,100);tx.unshift({t:Date.now(),kind:'asset',type:'asset_buy',sym:o.name,total:price});saveOwned();save();render();renderGameExtras();pushNotification('Özel teklif alındı',o.name+' '+money(price)+' karşılığında portföye eklendi.');toast('Teklif kabul edildi')
}
/* EOT_END */
