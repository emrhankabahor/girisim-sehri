/* Empire of Trade — Türkiye Yatırım Atlası v288.
   All economic operations delegate to the existing game; no parallel wallet,
   portfolio, day clock, or storage keys are introduced. */
(function(){
 'use strict';
 if(window.EOTTurkeyAtlas)return;
 const BASE={x:0,y:0,w:1040,h:470},NS='http://www.w3.org/2000/svg';
 const geoURL='./assets/turkiye-iller.geojson',townURL='./assets/turkiye-ilceler.json',provURL='./assets/turkiye-il-bilgileri.json';
 const state={provinces:[],districts:[],feature:[],province:null,district:null,plot:null,zoom:1,x:0,y:0,pointers:new Map(),gesture:null,suppressClickUntil:0,ready:false};
 const normalize=s=>String(s||'').toLocaleLowerCase('tr-TR').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ı/g,'i').replace(/ş/g,'s').replace(/ğ/g,'g').replace(/ü/g,'u').replace(/ö/g,'o').replace(/ç/g,'c').replace(/[^a-z0-9]/g,'');
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const el=(tag,attrs)=>{const n=document.createElementNS(NS,tag);for(const [k,v] of Object.entries(attrs||{}))n.setAttribute(k,String(v));return n};
 const xOf=lon=>(lon-25.25)*52, yOf=lat=>(42.55-lat)*66;
 const fmt=p=>xOf(p[0]).toFixed(2)+','+yOf(p[1]).toFixed(2);
 const polys=feature=>feature.geometry.type==='Polygon'?[feature.geometry.coordinates]:feature.geometry.coordinates;
 const pathData=feature=>polys(feature).map(poly=>poly.map(ring=>'M'+ring.map(fmt).join('L')+'Z').join('')).join('');
 function inside(point,ring){let yes=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){const a=ring[i],b=ring[j],cross=((a[1]>point[1])!==(b[1]>point[1]))&&(point[0]<(b[0]-a[0])*(point[1]-a[1])/(b[1]-a[1])+a[0]);if(cross)yes=!yes}return yes}
 function labelPosition(f){
   const rings=polys(f).map(x=>x[0]).filter(x=>x&&x.length>=4);
   const area=r=>Math.abs(r.reduce((s,p,i)=>{const n=r[(i+1)%r.length];return s+p[0]*n[1]-n[0]*p[1]},0));
   const ring=rings.sort((a,b)=>area(b)-area(a))[0];if(!ring)return [520,235];
   const pts=ring.map(v=>[xOf(v[0]),yOf(v[1])]);
   const bounds=[Math.min(...pts.map(x=>x[0])),Math.min(...pts.map(x=>x[1])),Math.max(...pts.map(x=>x[0])),Math.max(...pts.map(x=>x[1]))];
   const center=[(bounds[0]+bounds[2])/2,(bounds[1]+bounds[3])/2];
   if(inside(center,pts))return center;
   let best=pts[0],distance=-1;
   for(let yi=1;yi<=10;yi++)for(let xi=1;xi<=10;xi++){
     const p=[bounds[0]+(bounds[2]-bounds[0])*xi/11,bounds[1]+(bounds[3]-bounds[1])*yi/11];
     if(!inside(p,pts))continue;
     const score=Math.min(p[0]-bounds[0],bounds[2]-p[0],p[1]-bounds[1],bounds[3]-p[1]);
     if(score>distance){distance=score;best=p}
   }
   return best;
 }
 function owned(){try{return typeof ownedAssets==='undefined'?[]:ownedAssets}catch(_){return []}}
 function balance(){try{return typeof cash==='undefined'?0:cash}catch(_){return 0}}
 function fmtMoney(n){try{return money(n)}catch(_){return '₺'+Number(n||0).toLocaleString('tr-TR')}}
 function draw(){
  const svg=document.getElementById('eot-atlas-map');if(!svg)return;
  svg.replaceChildren();
  const defs=el('defs');const glow=el('linearGradient',{id:'eot-tr-fill',x1:'0%',x2:'100%',y1:'0%',y2:'100%'});
  glow.append(el('stop',{offset:'0%','stop-color':'#1b4e8b'}),el('stop',{offset:'100%','stop-color':'#0c2a55'}));defs.append(glow);svg.append(defs);
  const all=el('g',{id:'eot-atlas-provinces'});
  for(const f of state.feature){
    const code=Number(f.properties.plaka),grp=el('g',{'data-province-id':code,role:'button',tabindex:'0','aria-label':f.properties.il_adi+' ilini seç'});
    const d=pathData(f);grp.append(el('path',{d,fill:'url(#eot-tr-fill)','fill-rule':'evenodd',stroke:'#5489c4','stroke-width':'0.78','vector-effect':'non-scaling-stroke',class:'eot-tr-province'}));
    const xy=labelPosition(f),label=el('text',{x:xy[0].toFixed(1),y:xy[1].toFixed(1),'text-anchor':'middle','dominant-baseline':'central',class:'eot-tr-label','font-size':code===34?'8.8':'7.1'});
    label.textContent=f.properties.il_adi;grp.append(label);
    const title=el('title');title.textContent=f.properties.il_adi+' • '+String(code).padStart(2,'0');grp.append(title);all.append(grp);
  }
  svg.append(all);updateView();paintSelection();
 }
 function updateView(){
   const svg=document.getElementById('eot-atlas-map');if(!svg)return;
   const w=BASE.w/state.zoom,h=BASE.h/state.zoom;
   state.x=Math.max(0,Math.min(BASE.w-w,state.x));state.y=Math.max(0,Math.min(BASE.h-h,state.y));
   svg.setAttribute('viewBox',[state.x.toFixed(2),state.y.toFixed(2),w.toFixed(2),h.toFixed(2)].join(' '));
   const z=document.getElementById('eot-atlas-zoom');if(z)z.textContent=state.zoom.toFixed(1)+'×';
 }
 function zoomTo(next,fractionX=.5,fractionY=.5){
   const z=Math.max(1,Math.min(8,next)),oldW=BASE.w/state.zoom,oldH=BASE.h/state.zoom;
   const atX=state.x+oldW*fractionX,atY=state.y+oldH*fractionY;state.zoom=z;
   state.x=atX-BASE.w/z*fractionX;state.y=atY-BASE.h/z*fractionY;updateView();
 }
 function fit(){state.zoom=1;state.x=0;state.y=0;updateView()}
 function paintSelection(){
  document.querySelectorAll('#eot-atlas-map [data-province-id]').forEach(g=>g.classList.toggle('selected',Number(g.dataset.provinceId)===state.province));
 }
 function findProvince(id){return state.provinces.find(p=>p.id===Number(id))}
 function districtList(){return state.districts.filter(x=>x.province_id===state.province).sort((a,b)=>a.name.localeCompare(b.name,'tr'))}
 function showInfo(message){const node=document.getElementById('eot-atlas-info');if(node)node.textContent=message}
 function chooseProvince(id){
  const p=findProvince(id);if(!p)return;
  state.province=p.id;state.district=null;state.plot=null;paintSelection();
  const q=document.getElementById('eot-atlas-search');if(q)q.value=p.name;
  const title=document.getElementById('eot-atlas-selected');if(title)title.textContent=p.name+' • '+String(p.id).padStart(2,'0');
  const list=document.getElementById('eot-atlas-districts');if(list){
    list.replaceChildren();
    const prompt=document.createElement('option');prompt.value='';prompt.textContent='İlçe seçiniz ('+districtList().length+')';list.append(prompt);
    districtList().forEach(d=>{const opt=document.createElement('option');opt.value=String(d.id);opt.textContent=d.name;list.append(opt)});
    list.disabled=false;list.value='';
  }
  const cards=document.getElementById('eot-atlas-plots');if(cards)cards.replaceChildren();
  showInfo('İlçe seçerek bu bölgedeki oyun arsalarını inceleyebilirsin.');
 }
 function linkedDistrict(d){
  const slug=normalize(d.name),section=document.getElementById('district_'+slug);
  if(!section)return null;
  const back=section.querySelector('.panel-head .backbtn');
  const actual=back?.getAttribute('href')?.slice(1);
  if(!actual)return null;
  const p=findProvince(d.province_id);
  const expect=p?'province_'+normalize(p.name):'';
  // For legacy city ids use the exact mapped province header name if present.
  const ancestor=document.getElementById(actual);
  const headerName=ancestor?.querySelector('h2')?.textContent||'';
  if(actual!==expect&&normalize(headerName)!==normalize(p?.name))return null;
  return section;
 }
 function listings(d){
  const section=linkedDistrict(d);if(!section)return [];
  const found=[];
  section.querySelectorAll('a.listing-card[href^="#land_"]').forEach(link=>{
   const target=link.getAttribute('href').slice(1),detail=document.getElementById(target);
   if(!detail)return;
   const onclick=detail.querySelector('[onclick*="buyAsset("]')?.getAttribute('onclick')||'';
   const m=onclick.match(/buyAsset\('([^']+)','([^']+)','Arsa',([0-9]+)\)/);
   if(!m)return;
   const meta=detail.querySelector('.detail-hero'),facts=[...detail.querySelectorAll('.metric-grid>div')];
   const area=(meta?.textContent||'').match(/[\d.]+\s*m²/);
   const usage=(meta?.querySelector('span')?.textContent||'Arsa').trim();
   found.push({id:m[1],name:m[2],type:'Arsa',price:Number(m[3]),area:area?.[0]||'—',usage,route:'#'+target});
  });
  return found;
 }
 function listingCard(d,a){
  const isOwned=owned().some(v=>v.id===a.id);
  const n=document.createElement('article');n.className='eot-tr-plot';
  n.innerHTML='<div class="eot-tr-plot-title"><strong>'+esc(a.name)+'</strong><span class="'+(isOwned?'mine':'')+'">'+(isOwned?'Sahibisin':'Satılık')+'</span></div>'+
     '<p>'+esc(a.area)+' • '+esc(a.usage)+'</p><div class="eot-tr-plot-bottom"><b>'+esc(fmtMoney(a.price))+'</b><button type="button" data-plot="'+esc(a.id)+'">İncele</button></div>';
  n.querySelector('button').addEventListener('click',()=>openPlot(d,a));
  return n;
 }
 function chooseDistrict(id){
  const d=state.districts.find(x=>x.id===Number(id)&&x.province_id===state.province);
  if(!d){state.district=null;state.plot=null;document.getElementById('eot-atlas-plots')?.replaceChildren();return}
  state.district=d.id;state.plot=null;
  const items=listings(d),holder=document.getElementById('eot-atlas-plots');holder.replaceChildren();
  const hdr=document.createElement('div');hdr.className='eot-tr-plots-title';hdr.textContent=d.name+' • '+items.length+' oyun arsası';holder.append(hdr);
  if(!items.length){const e=document.createElement('p');e.className='eot-tr-empty';e.textContent='Bu ilçede şu an oyun tarafından yayımlanmış satılık arsa bulunmuyor. Başka bir ilçe seçebilirsin.';holder.append(e)}
  else items.forEach(a=>holder.append(listingCard(d,a)));
  showInfo(state.provinces.find(p=>p.id===d.province_id)?.name+' / '+d.name);
 }
 function closePlot(){
  const modal=document.getElementById('eot-atlas-dialog');if(modal){modal.hidden=true;modal.setAttribute('aria-hidden','true')}
  state.plot=null;
 }
 function syncCareer(){
  try{if(typeof saveAccountCareer==='function'&&typeof currentAccount==='function')saveAccountCareer(currentAccount()?.id)}catch(e){console.warn('Atlas career sync:',e)}
 }
 function updatePlotButtons(){
  const a=state.plot,modal=document.getElementById('eot-atlas-dialog');
  if(!a||!modal)return;
  const index=owned().findIndex(o=>o.id===a.id),own=index>=0;
  modal.querySelector('#eot-atlas-own-status').textContent=own?'Portföyünde • Satılabilir':'Satılık arsa';
  modal.querySelector('#eot-atlas-buy').hidden=own;modal.querySelector('#eot-atlas-sell').hidden=!own;
  modal.querySelector('#eot-atlas-buy').disabled=balance()<a.price;
  modal.querySelector('#eot-atlas-buy').textContent=balance()<a.price?'Yetersiz bakiye':'Satın Al • '+fmtMoney(a.price);
  modal.querySelector('#eot-atlas-sell').textContent=own?'Sat • '+fmtMoney(Math.round(Number(owned()[index].price)*.9)):'Sat';
  modal.querySelector('#eot-atlas-cash').textContent='Nakit: '+fmtMoney(balance());
 }
 function openPlot(d,a){
  state.plot=a;const modal=document.getElementById('eot-atlas-dialog');if(!modal)return;
  modal.querySelector('#eot-atlas-detail-title').textContent=a.name;
  modal.querySelector('#eot-atlas-detail-sub').textContent=(findProvince(d.province_id)?.name||'')+' • '+d.name+' • '+a.area+' • '+a.usage;
  modal.querySelector('#eot-atlas-detail-price').textContent=fmtMoney(a.price);
  modal.querySelector('#eot-atlas-legacy-route').href=a.route;
  modal.hidden=false;modal.setAttribute('aria-hidden','false');updatePlotButtons();
  modal.querySelector('.eot-tr-close').focus({preventScroll:true});
 }
 function purchase(){
  const a=state.plot;if(!a)return;
  if(owned().some(o=>o.id===a.id)){showInfo('Bu arsa zaten portföyünde.');updatePlotButtons();return}
  if(balance()<a.price){showInfo('Yetersiz bakiye.');updatePlotButtons();return}
  if(typeof buyAsset!=='function'){showInfo('Oyun ekonomisi henüz yüklenmedi.');return}
  const ok=buyAsset(a.id,a.name,'Arsa',a.price);
  if(ok){syncCareer();const d=state.district;closePlot();if(d)chooseDistrict(d);showInfo('Satın alma tamamlandı. Arsa portföyüne kaydedildi.')}
 }
 function sale(){
  const a=state.plot;if(!a)return;
  const i=owned().findIndex(o=>o.id===a.id);
  if(i<0){showInfo('Bu arsa artık portföyünde bulunmuyor.');updatePlotButtons();return}
  if(owned()[i].collateral){showInfo('Aktif kredi teminatındaki arsa satılamaz.');return}
  if(typeof sellOwned!=='function'){showInfo('Satış sistemi henüz yüklenmedi.');return}
  sellOwned(i);syncCareer();const d=state.district;closePlot();if(d)chooseDistrict(d);
  showInfo('Satış gerçekleşti. Güncel nakit ve portföy oyuna kaydedildi.');
 }
 function svgHit(point){return document.elementFromPoint(point.x,point.y)?.closest('[data-province-id]')}
 function pointerPoint(e){return {x:e.clientX,y:e.clientY}}
 function mapCoords(point){const b=document.getElementById('eot-atlas-map').getBoundingClientRect();return [(point.x-b.left)/b.width,(point.y-b.top)/b.height]}
 function moveBy(dx,dy){const b=document.getElementById('eot-atlas-map').getBoundingClientRect();state.x-=dx/b.width*BASE.w/state.zoom;state.y-=dy/b.height*BASE.h/state.zoom;updateView()}
 function pointers(){return [...state.pointers.values()]}
 function onPointerDown(e){
  if(e.pointerType==='mouse'&&e.button!==0)return;
  const svg=document.getElementById('eot-atlas-map');svg.setPointerCapture(e.pointerId);
  state.pointers.set(e.pointerId,pointerPoint(e));
  state.gesture={start:pointerPoint(e),last:pointerPoint(e),moved:false,pinch:state.pointers.size>1};
  if(state.pointers.size>1)state.suppressClickUntil=Date.now()+550;
 }
 function onPointerMove(e){
  if(!state.pointers.has(e.pointerId))return;
  const old=state.pointers.get(e.pointerId);state.pointers.set(e.pointerId,pointerPoint(e));
  if(state.pointers.size>=2){
   const arr=pointers(),oldArr=state.gesture?.lastPair||arr;
   const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
   const midpoint={x:(arr[0].x+arr[1].x)/2,y:(arr[0].y+arr[1].y)/2};
   const prev={x:(oldArr[0].x+oldArr[1].x)/2,y:(oldArr[0].y+oldArr[1].y)/2};
   moveBy(midpoint.x-prev.x,midpoint.y-prev.y);
   zoomTo(state.zoom*dist(arr[0],arr[1])/Math.max(1,dist(oldArr[0],oldArr[1])),...mapCoords(midpoint));
   state.gesture.lastPair=arr.map(x=>({...x}));state.gesture.moved=true;state.gesture.pinch=true;
  }else{
   if(state.gesture){
    if(Math.hypot(e.clientX-state.gesture.start.x,e.clientY-state.gesture.start.y)>7)state.gesture.moved=true;
    if(state.gesture.moved){moveBy(e.clientX-old.x,e.clientY-old.y);state.suppressClickUntil=Date.now()+500}
   }
  }
 }
 function onPointerUp(e){
  if(!state.pointers.has(e.pointerId))return;
  const g=state.gesture,at=pointerPoint(e),shouldClick=state.pointers.size===1&&!g?.moved&&!g?.pinch&&Date.now()>state.suppressClickUntil;
  state.pointers.delete(e.pointerId);
  if(state.pointers.size===0){state.gesture=null;state.suppressClickUntil=Date.now()+300}
  else{state.gesture={start:pointers()[0],last:pointers()[0],moved:true,pinch:true}}
  if(shouldClick){const hit=svgHit(at);if(hit)chooseProvince(hit.dataset.provinceId)}
 }
 function bindMap(){
  const svg=document.getElementById('eot-atlas-map');
  svg.addEventListener('pointerdown',onPointerDown);
  svg.addEventListener('pointermove',onPointerMove);
  svg.addEventListener('pointerup',onPointerUp);
  svg.addEventListener('pointercancel',onPointerUp);
  svg.addEventListener('lostpointercapture',e=>{state.pointers.delete(e.pointerId)});
  svg.addEventListener('click',e=>{if(Date.now()<state.suppressClickUntil)return;const target=e.target.closest('[data-province-id]');if(target&&e.detail===0)chooseProvince(target.dataset.provinceId)});
  svg.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.closest('[data-province-id]')){e.preventDefault();chooseProvince(e.target.closest('[data-province-id]').dataset.provinceId)}});
  svg.addEventListener('wheel',e=>{e.preventDefault();zoomTo(state.zoom*(e.deltaY<0?1.2:1/1.2),...mapCoords(pointerPoint(e)))},{passive:false});
  document.getElementById('eot-atlas-zoom-in').addEventListener('click',()=>zoomTo(state.zoom*1.4));
  document.getElementById('eot-atlas-zoom-out').addEventListener('click',()=>zoomTo(state.zoom/1.4));
  document.getElementById('eot-atlas-reset').addEventListener('click',fit);
  document.getElementById('eot-atlas-districts').addEventListener('change',e=>chooseDistrict(e.target.value));
  document.getElementById('eot-atlas-search').addEventListener('input',search);
  document.getElementById('eot-atlas-search').addEventListener('keydown',e=>{if(e.key==='Enter'){const id=document.querySelector('#eot-atlas-suggestions button')?.dataset.id;if(id){chooseProvince(id);clearSuggestions()}}});
  const modal=document.getElementById('eot-atlas-dialog');
  modal.querySelector('.eot-tr-close').addEventListener('click',closePlot);
  modal.addEventListener('click',e=>{if(e.target===modal)closePlot()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!modal.hidden)closePlot()});
  modal.querySelector('#eot-atlas-buy').addEventListener('click',purchase);
  modal.querySelector('#eot-atlas-sell').addEventListener('click',sale);
  modal.querySelector('#eot-atlas-legacy-route').addEventListener('click',closePlot);
 }
 function clearSuggestions(){document.getElementById('eot-atlas-suggestions')?.replaceChildren()}
 function search(){
  const q=normalize(document.getElementById('eot-atlas-search').value),box=document.getElementById('eot-atlas-suggestions');
  box.replaceChildren();if(!q){showInfo('Haritadan il seçebilir veya il adı / plaka arayabilirsin.');return}
  const hits=state.provinces.filter(p=>normalize(p.name).includes(q)||String(p.id).padStart(2,'0').startsWith(q)).slice(0,12);
  if(!hits.length){const span=document.createElement('p');span.textContent='Sonuç bulunamadı. İl adı veya plaka kodu deneyin.';box.append(span);return}
  for(const p of hits){const b=document.createElement('button');b.type='button';b.dataset.id=p.id;b.textContent=String(p.id).padStart(2,'0')+' • '+p.name;b.addEventListener('click',()=>{chooseProvince(p.id);clearSuggestions()});box.append(b)}
 }
 function mount(){
  const city=document.getElementById('city');if(!city||city.querySelector('#eot-atlas-root'))return !!city;
  city.classList.add('eot-atlas-active');
  const root=document.createElement('div');root.id='eot-atlas-root';root.innerHTML=
   '<div class="eot-tr-heading"><span>TÜRKİYE YATIRIM ATLASI</span><b>81 İl • 973 İlçe</b></div>'+
   '<p class="eot-tr-caption">Haritadan ilini, ardından ilçeni seç. Arsalar gerçek oyun ekonomisine bağlıdır.</p>'+
   '<div class="eot-tr-map-card"><div class="eot-tr-map-top"><strong>Türkiye</strong><span>Harita üzerinde sürükle • yakınlaştır</span></div>'+
   '<div class="eot-tr-canvas"><svg id="eot-atlas-map" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1040 470" aria-label="Türkiye 81 il sınırları" role="group"></svg></div>'+
   '<div class="eot-tr-controls"><button id="eot-atlas-zoom-in" type="button" aria-label="Yakınlaştır">+</button><button id="eot-atlas-zoom-out" type="button" aria-label="Uzaklaştır">−</button><span id="eot-atlas-zoom">1.0×</span><button id="eot-atlas-reset" type="button">Türkiye’nin tamamı</button></div></div>'+
   '<label class="eot-tr-search-label" for="eot-atlas-search">İl ara • ad / plaka kodu</label>'+
   '<input id="eot-atlas-search" type="search" autocomplete="off" placeholder="Örn. İstanbul veya 34" aria-controls="eot-atlas-suggestions">'+
   '<div id="eot-atlas-suggestions" class="eot-tr-suggestions" aria-live="polite"></div>'+
   '<div class="eot-tr-location"><strong id="eot-atlas-selected">Önce bir il seç</strong><label for="eot-atlas-districts">İlçe</label>'+
   '<select id="eot-atlas-districts" disabled><option value="">İl seçiniz</option></select></div>'+
   '<div id="eot-atlas-info" class="eot-tr-info" aria-live="polite">Haritadan il seçebilir veya il adı / plaka arayabilirsin.</div>'+
   '<div id="eot-atlas-plots" class="eot-tr-plots"></div>'+
   '<p class="eot-tr-source">İl sınırları: OpenStreetMap katkıcıları (ODbL). İl/ilçe verisi: turkiye-data (MIT).</p>';
  city.append(root);
  const modal=document.createElement('div');modal.id='eot-atlas-dialog';modal.hidden=true;modal.setAttribute('aria-hidden','true');
  modal.innerHTML='<div class="eot-tr-modal-card" role="dialog" aria-modal="true" aria-labelledby="eot-atlas-detail-title">'+
   '<div class="eot-tr-modal-head"><strong id="eot-atlas-detail-title"></strong><button class="eot-tr-close" type="button" aria-label="Kapat">×</button></div>'+
   '<p id="eot-atlas-detail-sub"></p><div class="eot-tr-detail-price" id="eot-atlas-detail-price"></div><p id="eot-atlas-own-status"></p>'+
   '<p id="eot-atlas-cash"></p><button id="eot-atlas-buy" type="button">Satın Al</button><button id="eot-atlas-sell" type="button" hidden>Sat</button>'+
   '<a id="eot-atlas-legacy-route" href="#city">Orijinal arsa detayını aç</a></div>';
  document.body.append(modal);
  bindMap();return true;
 }
 async function init(){
  if(!mount())return;
  try{
   const files=await Promise.all([geoURL,townURL,provURL].map(url=>fetch(url).then(r=>{if(!r.ok)throw Error(url+': '+r.status);return r.json()})));
   state.feature=files[0].features;state.districts=files[1];state.provinces=files[2];
   if(state.feature.length!==81||state.provinces.length!==81||state.districts.length!==973)throw Error('81 il / 973 ilçe doğrulaması başarısız');
   state.ready=true;draw();
  }catch(err){console.error('Atlas verisi:',err);showInfo('Harita verisi yüklenemedi. İnternet bağlantısını kontrol edip yeniden dene.')}
 }
 let started=false;
 const boot=()=>{if(started)return;if(!document.getElementById('city'))return;started=true;init()};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
 else boot();
 const root=document.getElementById('app-root')||document.body;
 const observer=new MutationObserver(()=>{if(!started&&document.getElementById('city')){boot();observer.disconnect()}});
 if(!started)observer.observe(root,{childList:true,subtree:true});
 window.addEventListener('hashchange',()=>{if(location.hash==='#city'&&state.ready){paintSelection();updateView()}});
 window.EOTTurkeyAtlas={state,normalize,chooseProvince,chooseDistrict,zoomTo,fit,listings};
})();
