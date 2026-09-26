/* EOT_PART app.js-serviceVehicle */
function serviceVehicle(i){let a=ownedAssets[i];if(!a||a.type!=='Araç')return;let cost=Math.round(a.price*.012);if(cash<cost){toast('Bakım için nakit yetersiz');return}cash-=cost;a.condition=Math.min(100,Number(a.condition||82)+12);a.price=Math.round(a.price*1.015);sim.currentMonth.expense+=cost;saveOwned();simSave();save();render();renderGameExtras();toast('Araç bakımı tamamlandı')}
/* EOT_END */
/* EOT_PART app.js-inspectVehicle */
function inspectVehicle(i){let a=ownedAssets[i];if(!a)return;toast(a.name+' ekspertiz: kondisyon '+Math.round(a.condition||82)+'/100')}
/* EOT_END */
/* EOT_PART app.js-renderVehicleService */
function renderVehicleService(){
 ensureAssetMetadata();let e=document.getElementById('vehicleServiceList');if(!e)return;let cars=ownedAssets.map((a,i)=>({a,i})).filter(x=>x.a.type==='Araç');
 e.innerHTML=cars.length?cars.map(o=>{let v=o.a.vehicle||{},cond=Math.round(o.a.condition||v.condition||82);return '<div class="service-card"><b>'+o.a.name+'</b><span>'+v.year+' • '+Number(v.km||0).toLocaleString('tr-TR')+' km • '+v.engine+' • '+v.fuel+' • '+v.package+'</span><div class="vehicle-facts"><div><span>HASAR</span><b>'+v.damage+'</b></div><div><span>BOYA</span><b>'+v.paint+'</b></div><div><span>KONDİSYON</span><b>'+cond+'/100</b></div><div><span>PİYASA</span><b>'+money(o.a.price)+'</b></div><div><span>BAKIM</span><b>'+(cond>90?'İyi':'Gerekli')+'</b></div><div><span>DEĞER KAYBI</span><b>%'+Math.max(0,Math.round((100-cond)*.35))+'</b></div></div><div class="mini-actions"><button onclick="serviceVehicle('+o.i+')">Bakım Yap</button><button onclick="inspectVehicle('+o.i+')">Ekspertiz</button></div></div>'}).join(''):'<div class="info-card"><p>Araç bulunmuyor.</p></div>'
}
/* EOT_END */
