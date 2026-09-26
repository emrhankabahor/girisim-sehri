/* EOT_PART app.js-generateDetailedUsed */
function generateDetailedUsed(){
 const names=['Şehir Hatchback','Aile Sedanı','Kompakt SUV','Premium Sedan','Hibrit Crossover','Ticari Van','4x4 Pickup','Elektrikli Crossover'];let arr=[];names.forEach((name,i)=>{let year=2017+Math.floor(Math.random()*9),km=Math.round((10000+Math.random()*150000)/1000)*1000,condition=Math.round(62+Math.random()*37),base=[850000,1250000,1950000,3600000,2250000,1100000,2450000,2650000][i],price=Math.round(base*(.82+condition/500)*(1+currentNews().auto)/10000)*10000;arr.push({id:'usedplus_'+Date.now()+'_'+i,name,year,km,engine:['1.0','1.3','1.5','1.6','2.0'][i%5],fuel:['Benzin','Dizel','Hibrit','Benzin','Hibrit','Dizel','Dizel','Elektrik'][i],package:['Comfort','Style','Premium','Executive'][i%4],damage:condition<72?'Hasar kaydı var':'Temiz',paint:condition<80?'1-2 parça boyalı':'Orijinal',condition,price,seller:['Bireysel','Galeri','Yetkili 2. El'][i%3]})});sim.detailedUsed=arr;sim.usedRefresh=Date.now()+180000;simSave()
}
/* EOT_END */
/* EOT_PART app.js-refreshDetailedUsed */
function refreshDetailedUsed(){generateDetailedUsed();renderDetailedUsed()}
/* EOT_END */
/* EOT_PART app.js-renderDetailedUsed */
function renderDetailedUsed(){if(!sim.detailedUsed.length||Date.now()>sim.usedRefresh)generateDetailedUsed();let e=document.getElementById('detailedUsedList');if(!e)return;e.innerHTML=sim.detailedUsed.map((x,i)=>'<div class="used-detail-card"><h4>'+x.name+'</h4><p>'+x.seller+' • '+x.year+' • '+x.km.toLocaleString('tr-TR')+' km</p><div class="vehicle-facts"><div><span>MOTOR</span><b>'+x.engine+'</b></div><div><span>YAKIT</span><b>'+x.fuel+'</b></div><div><span>PAKET</span><b>'+x.package+'</b></div><div><span>HASAR</span><b>'+x.damage+'</b></div><div><span>BOYA</span><b>'+x.paint+'</b></div><div><span>KONDİSYON</span><b>'+x.condition+'/100</b></div></div><div class="dynamic-price">'+money(x.price)+'</div><div class="card-action-row"><button onclick="bargainUsed('+i+')">Pazarlık</button><button class="primary" onclick="buyDetailedUsed('+i+')">Satın Al</button></div></div>').join('')}
/* EOT_END */
/* EOT_PART app.js-bargainUsed */
function bargainUsed(i){let x=sim.detailedUsed[i];if(!x)return;let raw=prompt('Teklifin',String(Math.round(x.price*.94/10000)*10000));if(raw==null)return;let offer=Number(raw),min=x.price*(.91+Math.random()*.04);if(offer>=min){x.price=Math.round(Math.min(offer,x.price)/10000)*10000;toast('Satıcı teklifini kabul etti')}else toast('Satıcı teklifi reddetti');simSave();renderDetailedUsed()}
/* EOT_END */
/* EOT_PART app.js-buyDetailedUsed */
function buyDetailedUsed(i){let x=sim.detailedUsed[i];if(!x)return;if(cash<x.price){toast('Yetersiz nakit');return}cash-=x.price;ownedAssets.push({id:x.id,name:x.name,type:'Araç',price:x.price,t:Date.now(),vehicle:{year:x.year,km:x.km,engine:x.engine,fuel:x.fuel,package:x.package,damage:x.damage,paint:x.paint,condition:x.condition},condition:x.condition});sim.detailedUsed.splice(i,1);saveOwned();save();simSave();render();renderGameExtras();toast('Araç garaja eklendi')}
/* EOT_END */
/* EOT_PART app.js-renderBrandDealers */
function renderBrandDealers(){let e=document.getElementById('brandDealerList');if(!e)return;let brands=[['Marmara Motors','Şehir & SUV','₺1,55–3,90 Mn'],['Anadolu Otomotiv','Sedan & Hibrit','₺1,85–4,20 Mn'],['Atlas Premium','Premium & Elektrikli','₺3,20–8,50 Mn'],['Ege Ticari','Van & Pickup','₺2,10–4,10 Mn']];e.innerHTML=brands.map((b,i)=>'<div class="brand-card"><h4>'+b[0]+'</h4><p>'+b[1]+' • Sıfır araç fiyat bandı '+b[2]+'</p><div class="card-action-row"><button class="primary" onclick="location.hash=\'cars_new\'">Araçları Gör</button></div></div>').join('')}
/* EOT_END */
