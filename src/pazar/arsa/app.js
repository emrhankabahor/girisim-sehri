/* EOT_PART app.js-filterCities */
function filterCities(){
 let q=(document.getElementById('citySearch')?.value||'').toLocaleLowerCase('tr-TR'),r=document.getElementById('regionFilter')?.value||'',count=0;
 document.querySelectorAll('.city-filter-item').forEach(el=>{let ok=(!q||(el.dataset.city||'').includes(q))&&(!r||(el.dataset.region||'')===r);el.hidden=!ok;if(ok)count++});
 let label=document.getElementById('cityCountLabel');if(label)label.textContent=count+' şehir'
}
/* EOT_END */
/* EOT_PART app.js-renderCityOwnership */
function renderCityOwnership(){
 let lands=ownedAssets.filter(a=>a.type==='Arsa'),set=(id,v)=>{let e=document.getElementById(id);if(e)e.textContent=v};
 set('ownedLandCount',lands.length);set('ownedLandValue',money(lands.reduce((s,a)=>s+a.price,0)))
}
/* EOT_END */
/* EOT_PART app.js-renderNeighborhoods */
function renderNeighborhoods(){let e=document.getElementById('neighborhoodList');if(!e)return;let data=[['İstanbul / Kadıköy / Fenerbahçe',1.22,'Konut & premium'],['İstanbul / Sarıyer / Zekeriyaköy',1.35,'Villa & arsa'],['Ankara / Çankaya / Çayyolu',1.12,'Konut & ofis'],['İzmir / Urla / İskele',1.28,'Villa & turizm'],['Bursa / Nilüfer / Özlüce',1.08,'Konut & ticaret'],['Antalya / Konyaaltı / Hurma',1.16,'Konut & turizm'],['Muğla / Bodrum / Yalıkavak',1.42,'Premium & turizm'],['Kocaeli / Başiskele / Sahil',1.10,'Konut & sanayi erişimi']];e.innerHTML=data.map(x=>'<div class="neighborhood-card"><h4>'+x[0]+'</h4><p>Değer katsayısı x'+x[1].toFixed(2)+' • '+x[2]+'</p></div>').join('')}
/* EOT_END */
