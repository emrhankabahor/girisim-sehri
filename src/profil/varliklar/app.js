/* EOT_PART app.js-buyAsset */
function buyAsset(id,name,type,price,rent=0){
 if(ownedAssets.some(a=>a.id===id)){renderGameExtras();toast('Bu varlık zaten sende');setPurchaseResult(id,name,price,true);return true}
 if(cash<price){toast('Yetersiz nakit');if(event&&event.preventDefault)event.preventDefault();return false}
 cash-=price;ownedAssets.push({id,name,type,price,rent:Number(rent||0),rented:false,t:Date.now(),rentReady:0});ensureAssetMetadata();
 tx.unshift({t:Date.now(),kind:'asset',type:'asset_buy',sym:name,total:price});
 reputation=clamp(reputation+1,0,100);saveOwned();save();render();renderGameExtras();setPurchaseResult(id,name,price,false);toast(name+' satın alındı');return true
}
/* EOT_END */
/* EOT_PART app.js-purchaseScreenId */
function purchaseScreenId(id){
 const special={factory_basic:'purchase_factory',construction_basic:'purchase_construction'};
 return special[id]||('purchase_'+id)
}
/* EOT_END */
/* EOT_PART app.js-setPurchaseResult */
function setPurchaseResult(id,name,price,already){
 let p=purchaseScreenId(id);
 let t=document.getElementById(p+'_title'),x=document.getElementById(p+'_text'),d=document.getElementById(p+'_detail');
 if(!t&&!x&&!d)return;
 if(already){
   if(t)t.textContent='ℹ️ Varlık zaten portföyünde';
   if(x)x.textContent=name+' daha önce satın alınmış.';
   if(d)d.innerHTML='Mevcut nakit: <b>'+money(cash)+'</b>';
   return
 }
 if(t)t.textContent='✅ Satın alma tamamlandı';
 if(x)x.textContent=name+' portföyüne eklendi.';
 if(d)d.innerHTML='Ödenen: <b>'+money(price)+'</b> • Kalan nakit: <b>'+money(cash)+'</b>'
}
/* EOT_END */
/* EOT_PART app.js-renderOwned */
function renderOwned(){
 let e=document.getElementById('ownedAssets'),g=document.getElementById('garageAssets');
 if(e)e.innerHTML=ownedAssets.length?ownedAssets.map((a,i)=>{let rent=a.type==='Gayrimenkul';let ready=rent&&Date.now()>=Number(a.rentReady||0);return '<div class="asset-owned"><div><b>'+a.name+'</b><span>'+a.type+' • '+new Date(a.t).toLocaleDateString('tr-TR')+'</span><div class="asset-owned-actions">'+(rent?'<button class="income-btn" '+(ready?'':'disabled')+' onclick="collectRent('+i+')">'+(ready?'Kirayı Al':'Kira Bekleniyor')+'</button>':'')+'<button onclick="sellOwned('+i+')">Sat ('+money(a.price*.9)+')</button></div></div><strong>'+money(a.price)+'</strong></div>'}).join(''):'<div class="info-card" style="text-align:center;color:var(--muted)">Henüz satın alınmış varlık yok.</div>';
 let cars=ownedAssets.map((a,i)=>({a,i})).filter(o=>o.a.type==='Araç');if(g)g.innerHTML=cars.length?cars.map(o=>'<div class="asset-owned"><div><b>'+o.a.name+'</b><span>Araç portföyü</span><div class="asset-owned-actions"><button onclick="sellOwned('+o.i+')">Aracı Sat ('+money(o.a.price*.9)+')</button></div></div><strong>'+money(o.a.price)+'</strong></div>').join(''):'<div class="info-card" style="text-align:center;color:var(--muted)">Garajında henüz araç yok.</div>'
}
/* EOT_END */
/* EOT_PART app.js-ownedValue */
function ownedValue(){return ownedAssets.reduce((s,a)=>s+Number(a.price||0),0)}
/* EOT_END */
/* EOT_PART app.js-sellOwned */
function sellOwned(index){
 let a=ownedAssets[index];if(!a)return;if(a.collateral){toast('Bu varlık aktif kredi için teminatta');return}
 let ageDays=Math.max(0,(Date.now()-Number(a.t||Date.now()))/86400000),dep=a.type==='Araç'?Math.max(.65,.9-ageDays*.002):.9;let amount=Math.round(Number(a.price||0)*dep);
 if((a.id==='factory_basic'&&factoryOp.status==='running')||(a.id==='construction_basic'&&constructionOp.status==='running')){toast('Aktif operasyon varken işletme satılamaz');return}
 ownedAssets.splice(index,1);cash+=amount;
 if(a.id==='factory_basic')factoryOp={status:'idle',finish:0};
 if(a.id==='construction_basic')constructionOp={status:'idle',finish:0};
 tx.unshift({t:Date.now(),kind:'asset',type:'asset_sell',sym:a.name,total:amount});
 saveOwned();save();render();renderGameExtras();toast(a.name+' satıldı • '+money(amount))
}
/* EOT_END */
/* EOT_PART app.js-owns */
function owns(id){return ownedAssets.some(a=>a.id===id)}
/* EOT_END */
