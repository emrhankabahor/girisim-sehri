/* EOT_PART app.js-collectRent */
function collectRent(index){
 let a=ownedAssets[index];if(!a||a.type!=='Gayrimenkul')return;
 if(Date.now()<Number(a.rentReady||0)){toast('Kira henüz hazır değil');return}
 let rent=Number(a.rent||42000);cash+=rent;a.rentReady=Date.now()+30000;sim.currentMonth.revenue+=rent;simSave();
 tx.unshift({t:Date.now(),kind:'income',type:'rent_collect',sym:a.name,total:rent});saveOwned();save();render();renderGameExtras();toast('Kira geliri • +'+money(rent))
}
/* EOT_END */
/* EOT_PART app.js-togglePropertyRent */
function togglePropertyRent(index){
 let a=ownedAssets[index];if(!a||a.type!=='Gayrimenkul')return;a.rented=!a.rented;if(a.rented)a.rentReady=Date.now()+30000;else a.rentReady=0;simSave();saveOwned();renderGameExtras();toast(a.rented?'Gayrimenkul kiraya verildi':'Gayrimenkul kiradan çıkarıldı')
}
/* EOT_END */
/* EOT_PART app.js-sellManagedProperty */
function sellManagedProperty(index,markup=0){
 let a=ownedAssets[index];if(!a||a.type!=='Gayrimenkul')return;let price=Math.round(a.price*(.94+markup/100)/1000)*1000;cash+=price;ownedAssets.splice(index,1);sim.currentMonth.revenue+=price;tx.unshift({t:Date.now(),kind:'asset',type:'asset_sell',sym:a.name,total:price});saveOwned();simSave();save();render();renderGameExtras();toast('Gayrimenkul satıldı • +'+money(price))
}
/* EOT_END */
/* EOT_PART app.js-renderPropertyManagement */
function renderPropertyManagement(){
 ensureAssetMetadata();let e=document.getElementById('managedPropertyList'),items=ownedAssets.map((a,i)=>({a,i})).filter(x=>x.a.type==='Gayrimenkul'),set=(id,v)=>{let x=document.getElementById(id);if(x)x.textContent=v};
 set('managedPropertyCount',items.length);set('managedRentedCount',items.filter(x=>x.a.tenantStatus==='occupied').length);set('managedRentIncome',money(items.filter(x=>x.a.tenantStatus==='occupied').reduce((s,x)=>s+Number(x.a.rent||42000),0)));
 if(!e)return;e.innerHTML=items.length?items.map(o=>detailedPropertyCard(o.a,o.i)).join(''):'<div class="info-card"><p>Yönetilecek gayrimenkul bulunmuyor.</p></div>'
}
/* EOT_END */
/* EOT_PART app.js-renovateProperty */
function renovateProperty(i){let a=ownedAssets[i];if(!a||a.type!=='Gayrimenkul')return;let cost=Math.round(a.price*.06);if(cash<cost){toast('Tadilat için nakit yetersiz');return}cash-=cost;a.price=Math.round(a.price*1.10);a.rent=Math.round(Number(a.rent||42000)*1.08);sim.currentMonth.expense+=cost;saveOwned();simSave();save();render();renderGameExtras();toast('Tadilat tamamlandı')}
/* EOT_END */
/* EOT_PART app.js-renderRenovation */
function renderRenovation(){let e=document.getElementById('renovationList');if(!e)return;let items=ownedAssets.map((a,i)=>({a,i})).filter(x=>x.a.type==='Gayrimenkul');e.innerHTML=items.length?items.map(o=>'<div class="renovation-card"><b>'+o.a.name+'</b><span>Değer '+money(o.a.price)+' • Tadilat '+money(o.a.price*.06)+'</span><div class="mini-actions"><button class="primary" onclick="renovateProperty('+o.i+')">Tadilat Yap</button></div></div>').join(''):'<div class="info-card"><p>Gayrimenkul bulunmuyor.</p></div>'}
/* EOT_END */
/* EOT_PART app.js-requestTenant */
function requestTenant(index,ask){
 let a=ownedAssets[index];if(!a||a.type!=='Gayrimenkul')return;if(ask)a.askRent=Number(ask);let base=Number(a.rent||42000),ratio=a.askRent/base,chance=clamp(1.15-ratio*.45,0.15,.92);a.tenantStatus='searching';a.tenantCheck=Date.now()+15000;a.tenantChance=chance;a.rented=false;saveOwned();toast('Kiracı aranmaya başlandı')
}
/* EOT_END */
/* EOT_PART app.js-processTenantSearch */
function processTenantSearch(){
 let changed=false;ownedAssets.forEach(a=>{if(a.type==='Gayrimenkul'&&a.tenantStatus==='searching'&&Date.now()>=Number(a.tenantCheck||0)){if(Math.random()<Number(a.tenantChance||.5)){a.tenantStatus='occupied';a.rented=true;a.rent=Number(a.askRent||a.rent||42000);a.rentReady=Date.now()+30000;pushNotification('Kiracı bulundu',a.name+' '+money(a.rent)+'/ay bedelle kiralandı.')}else{a.tenantCheck=Date.now()+15000;pushNotification('Kiracı bulunamadı',a.name+' için arama devam ediyor.')}changed=true}});if(changed)saveOwned()
}
/* EOT_END */
/* EOT_PART app.js-propertyValuation */
function propertyValuation(a){
 if(!a||a.type!=='Gayrimenkul')return Number(a?.price||0);let d=a.details||{},city=sim.companyProfile.city||'İstanbul',cm=(CITY_ECON[city]?.property||1),score=1+(Number(d.m2||100)-100)*.0015-(Number(d.age||0))*.004+(d.view==='Manzaralı'?.06:0)+(d.parking?.035:0)+(d.site?.04:0)+(Number(d.transport||70)-70)*.0015;return Math.round(a.price*clamp(score*.7+.3,0.75,1.35)*cm*(1+currentNews().housing)/1000)*1000
}
/* EOT_END */
/* EOT_PART app.js-detailedPropertyCard */
function detailedPropertyCard(a,i){
 let d=a.details||{},val=propertyValuation(a);return '<div class="managed-property"><h4>'+a.name+'</h4><p>'+d.neighborhood+' • '+d.m2+' m² • '+d.rooms+' • '+d.age+' yaş • '+d.floor+'. kat • '+d.view+'</p><div class="vehicle-facts"><div><span>OTOPARK</span><b>'+(d.parking?'Var':'Yok')+'</b></div><div><span>SİTE</span><b>'+(d.site?'Evet':'Hayır')+'</b></div><div><span>ULAŞIM</span><b>'+d.transport+'/100</b></div><div><span>DEĞERLEME</span><b>'+money(val)+'</b></div><div><span>KİRA TALEBİ</span><b>'+money(a.askRent||a.rent||42000)+'</b></div><div><span>KİRACI</span><b>'+(a.tenantStatus==='occupied'?'Var':a.tenantStatus==='searching'?'Aranıyor':'Yok')+'</b></div></div><div class="card-action-row"><button onclick="setPropertyRentAsk('+i+')">Kira Belirle</button><button class="primary" onclick="sellManagedProperty('+i+',0)">Sat</button></div></div>'
}
/* EOT_END */
/* EOT_PART app.js-setPropertyRentAsk */
function setPropertyRentAsk(i){let a=ownedAssets[i];if(!a)return;let suggested=Number(a.rent||42000),raw=prompt('Aylık kira bedeli',String(Math.round(a.askRent||suggested)));if(raw==null)return;let q=Number(raw);if(!q||q<1000){toast('Kira geçersiz');return}requestTenant(i,q);renderGameExtras()}
/* EOT_END */
