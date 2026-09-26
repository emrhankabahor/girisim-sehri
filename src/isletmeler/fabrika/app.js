/* EOT_PART app.js-startFactoryBatch */
function startFactoryBatch(){
 if(!owns('factory_basic')){toast('Önce fabrikayı kur');return}
 if(factoryOp.status==='running'){toast('Üretim zaten devam ediyor');return}
 if(factoryOp.status==='ready'){toast('Önce hazır ürünü sat');return}
 let cost=550000*factoryLevel,duration=Math.max(10000,20000-(factoryLevel-1)*4000);
 if((sim.raw||0)<10){toast('Üretim için 10 birim hammadde gerekli');return}
 if(cash<cost){toast('Üretim için '+money(cost)+' gerekli');return}
 sim.raw-=10;cash-=cost;simSave();factoryOp={status:'running',finish:Date.now()+duration,cost,revenue:800000*factoryLevel*(1+employeeStats().bonus/100)};
 tx.unshift({t:Date.now(),kind:'business',type:'factory_start',sym:'Üretim Partisi',total:cost});saveOwned();save();render();renderGameExtras();toast('Üretim başladı')
}
/* EOT_END */
/* EOT_PART app.js-collectFactoryBatch */
function collectFactoryBatch(){
 if(factoryOp.status!=='ready'){toast('Satılabilir ürün henüz hazır değil');return}
 let revenue=Number(factoryOp.revenue||800000*factoryLevel);cash+=revenue;factoryOp={status:'idle',finish:0};sim.currentMonth.revenue+=revenue;simSave();
 tx.unshift({t:Date.now(),kind:'business',type:'factory_collect',sym:'Üretim Satışı',total:revenue});saveOwned();save();render();renderGameExtras();reputation=clamp(reputation+1,0,100);saveOwned();toast('Ürün satıldı • +'+money(revenue))
}
/* EOT_END */
/* EOT_PART app.js-upgradeFactory */
function upgradeFactory(){
 if(!owns('factory_basic')){toast('Önce fabrikayı kur');return}
 if(factoryOp.status!=='idle'){toast('Üretim devam ederken tesis geliştirilemez');return}
 if(factoryLevel>=3){toast('Tesis maksimum seviyede');return}
 let cost=factoryLevel===1?3000000:6000000;if(cash<cost){toast('Geliştirme için '+money(cost)+' gerekli');return}
 cash-=cost;factoryLevel++;let f=ownedAssets.find(a=>a.id==='factory_basic');if(f)f.price+=cost;
 tx.unshift({t:Date.now(),kind:'business',type:'factory_upgrade',sym:'Fabrika Seviye '+factoryLevel,total:cost});saveOwned();save();render();renderGameExtras();toast('Fabrika Seviye '+factoryLevel+' oldu')
}
/* EOT_END */
/* EOT_PART app.js-renderFactoryUpgrade */
function renderFactoryUpgrade(){
 let lvl=document.getElementById('factoryUpgradeLevel'),cost=document.getElementById('factoryUpgradeCost'),lt=document.getElementById('factoryLevelText'),val=document.getElementById('factoryVal'),cap=document.getElementById('factoryCap'),prof=document.getElementById('factoryProfit');
 if(lvl)lvl.textContent=factoryLevel;if(cost)cost.textContent=factoryLevel>=3?'MAX':money(factoryLevel===1?3000000:6000000);
 if(lt)lt.textContent='Seviye '+factoryLevel+' • '+factoryLevel+' üretim hattı';if(cap)cap.textContent=(100*factoryLevel)+' birim';if(prof)prof.textContent=money(250000*factoryLevel);
 let f=ownedAssets.find(a=>a.id==='factory_basic');if(val)val.textContent=money(f?f.price:7500000);
 let bc=document.getElementById('factoryBatchCost'),br=document.getElementById('factoryBatchRevenue'),bd=document.getElementById('factoryBatchDuration');
 if(bc)bc.textContent=money(550000*factoryLevel);if(br)br.textContent=money(800000*factoryLevel);if(bd)bd.textContent=Math.max(10,20-(factoryLevel-1)*4)+' sn'
}
/* EOT_END */
/* EOT_PART app.js-buyRawMaterial */
function buyRawMaterial(){
 let c=selectedCompany();if(!c){toast('Önce bir şirket seç');return}
 if(c.sector!=='Sanayi'){toast('Hammadde alımı Sanayi şirketleri içindir');return}
 let q=Number(document.getElementById('rawQty')?.value);if(!q||q<10){toast('En az 10 birim gir');return}
 let total=q*25000;if(c.companyCash<total){toast('Şirket hesabında yeterli bakiye yok');return}
 c.companyCash-=total;c.raw=normalizeNumber(c.raw,0)+q;sim.raw=c.raw;syncSelectedCompanyToProfile();
 tx.unshift({t:Date.now(),kind:'business',type:'raw_buy',companyId:c.id,sym:c.name+' • Hammadde',total});
 simSave();save();render();renderGameExtras();pushNotification('Hammadde alındı',c.name+' stoğuna '+q+' birim eklendi.');toast('Stok güncellendi')
}
/* EOT_END */
