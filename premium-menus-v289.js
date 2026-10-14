/* Empire of Trade v289 • Five premium game menus.
   Render-only view layer: no new wallet, prices, localStorage, or gameplay clocks. */
(function(){
'use strict';
if(window.__eotShowcaseV289)return;window.__eotShowcaseV289=true;
const routes=['home','market','business','finance','profile'];
const category=[
 ['🏪','Mağazalar','Perakende','#business','store'],
 ['🏭','Fabrikalar','Üretim','#business','factory'],
 ['🏗️','İnşaat','Projeler','#project_portfolio','construction'],
 ['🚗','Galeri','Otomotiv','#cars','car'],
 ['🏢','Gayrimenkul','Mülkler','#estate','estate'],
 ['📍','Arsa','Türkiye','#city','land']
];
let mounted=false,previousRoute='',lastActivities='',lastBusiness='';
const by=id=>document.getElementById(id);
const format=n=>'₺'+Number(n||0).toLocaleString('tr-TR',{maximumFractionDigits:0});
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const val=(f,fallback=0)=>{try{return f()}catch(e){return fallback}};
const num=(f)=>Number(val(f,0))||0;
const txt=(id,value)=>{const n=by(id);if(n&&n.textContent!==String(value))n.textContent=String(value)};
const getRoute=()=>location.hash.slice(1)||'home';
const assetList=()=>val(()=>ownedAssets,[]);
const coList=()=>val(()=>Array.isArray(sim.companies)?sim.companies:[],[]);
const data=()=>({
 cash:num(()=>cash),worth:num(()=>totalWealth()),credit:num(()=>creditScore),rep:num(()=>reputation),
 debt:num(()=>debt()),stock:num(()=>stats('stock').value),crypto:num(()=>stats('crypto').value),
 gold:num(()=>stats('gold').value),flow:num(()=>operatingSummary().net),
 level:num(()=>gameLevel()),xp:val(()=>by('xpText')?.textContent,'0 / 100 XP'),
 companies:coList(),assets:assetList(),transactions:val(()=>tx,[]),account:val(()=>currentAccount(),null),
 company:val(()=>sim.companyProfile,null),notifications:val(()=>sim.notifications,[])
});
const icon=(emoji,cls='')=>'<span class="eot-v289-ico '+cls+'" aria-hidden="true">'+emoji+'</span>';
const card=(emoji,label,sub,href,extra='')=>'<a class="eot-v289-tile '+extra+'" href="'+href+'">'+icon(emoji)+'<span class="eot-v289-tile-text"><b>'+esc(label)+'</b><small>'+esc(sub)+'</small></span><span class="eot-v289-chevron">›</span></a>';
const title=(label,action='',href='')=>'<div class="eot-v289-panel-head"><b>'+label+'</b>'+(href?'<a href="'+href+'">'+action+' ›</a>':'')+'</div>';
const panel=(inside,extra='')=>'<section class="eot-v289-panel '+extra+'">'+inside+'</section>';
function mountHero(app){
 const hero=document.createElement('div');hero.className='eot-v289-hero';hero.id='eot-v289-hero';
 hero.innerHTML='<div class="eot-v289-hero-top"><a class="eot-v289-hero-action" href="#profile" aria-label="Profil ve ayarlar">⚙️</a>'+
 '<a class="eot-v289-hero-action" href="#transactions" aria-label="İşlemler ve mesajlar">✉️</a>'+
 '<a class="eot-v289-hero-action" href="#missions" aria-label="Bildirim ve görevler">🔔<span id="eot-v289-badge" hidden></span></a></div>'+
 '<img class="eot-v289-hero-logo" src="./assets/logo-v221-512.png" alt="Empire of Trade resmi oyun logosu" width="230" height="160">'+
 '<div class="eot-v289-hero-shade"></div>';
 app.insertBefore(hero,app.firstElementChild);
 const strip=document.createElement('div');strip.id='eot-v289-strip';strip.className='eot-v289-strip';
 strip.innerHTML='<div><span class="eot-v289-strip-icon">🪙</span><span><small>BAKİYE</small><b id="eot-v289-cash">—</b></span></div>'+
 '<div><span class="eot-v289-strip-icon">👑</span><span><small>KREDİ NOTU</small><b id="eot-v289-credit">—</b><i class="eot-v289-mini-meter"><em id="eot-v289-credit-bar"></em></i></span></div>'+
 '<div><span class="eot-v289-strip-icon">🕒</span><span><small>SAAT</small><b id="eot-v289-clock">--:--</b></span></div>';
 hero.insertAdjacentElement('afterend',strip);
}
function makeHome(){
 return '<div class="eot-v289-page-title">ANA SAYFA</div>'+
 panel(title('📊 Genel Bakış','Tüm Detaylar','#finance')+
 '<div class="eot-v289-triple"><div>'+icon('💵')+'<span>Net Değer</span><strong id="eot-v289-worth">—</strong></div>'+
 '<div>'+icon('💰')+'<span>Aylık Nakit Akışı</span><strong id="eot-v289-flow">—</strong></div>'+
 '<div>'+icon('🏙️')+'<span>Şirket Sayısı</span><strong id="eot-v289-company-count">—</strong></div></div>')+
 panel(title('⚡ Hızlı Erişim')+
 '<div class="eot-v289-picture-grid">'+category.map(([e,n,s,h])=>card(e,n,s,h,'eot-v289-category')).join('')+'</div>')+
 panel(title('🧾 Son İşlemler','Tümünü Gör','#transactions')+
 '<div class="eot-v289-activity" id="eot-v289-activities"><p>Henüz işlem yok.</p></div>')+
 '<a class="eot-v289-secondary-cta" href="#company_center">Şirket Merkezine Git <span>›</span></a>';
}
function makeMarket(){
 const types=[
 ['📍','Arsa Pazarı','Türkiye haritası ve ilanlar','#city','land'],
 ['🚗','Araç Pazarı','Sıfır ve ikinci el','#cars','car'],
 ['🏪','İşletme Pazarı','Şirket ve ticaret','#business','store'],
 ['🏭','Fabrika Pazarı','Üretim ve tesisler','#business','factory'],
 ['₿','Kripto Piyasası','Dijital varlıklar','#crypto','crypto'],
 ['🪙','Altın Piyasası','Altın alım ve satım','#gold','gold'],
 ['🏠','Gayrimenkul','Konut ve ticari mülk','#estate','estate'],
 ['📈','Borsa','Hisse senetleri','#stocks','stock']
 ];
 return '<div class="eot-v289-page-title">PAZAR</div>'+
 '<div class="eot-v289-searchbar"><label><span aria-hidden="true">⌕</span><input id="eot-v289-market-search" type="search" inputmode="search" autocomplete="off" placeholder="Varlık veya piyasa ara..."></label><button id="eot-v289-filter" type="button" aria-expanded="false">⚑ Filtrele</button></div>'+
 '<div id="eot-v289-market-filters" class="eot-v289-filters" hidden><button type="button" data-filter="all" class="active">Tümü</button><button type="button" data-filter="property">Gayrimenkul</button><button type="button" data-filter="financial">Yatırımlar</button><button type="button" data-filter="business">İşletmeler</button></div>'+
 panel(title('📊 Oyun Piyasaları','Yatırımlara Git','#finance')+
 '<div class="eot-v289-trends">'+[['GSTEK','📈','HİSSE'],['BTC','₿','BITCOIN'],['GRAM','🪙','GRAM ALTIN']].map(([key,e,label])=>
 '<a href="'+(key==='GSTEK'?'#stocks':key==='BTC'?'#crypto':'#gold')+'"><span>'+e+' '+label+'</span><b id="eot-v289-price-'+key+'">—</b><small>Oyun piyasa fiyatı</small></a>').join('')+'</div>')+
 panel(title('🏬 Pazar Kategorileri')+
 '<div class="eot-v289-market-grid" id="eot-v289-market-grid">'+types.map(([e,n,sub,href,key])=>
 '<a href="'+href+'" data-market-name="'+esc(n+' '+sub)+'" data-market-group="'+(key==='land'||key==='estate'?'property':key==='crypto'||key==='gold'||key==='stock'?'financial':'business')+'">'+
 '<span class="eot-v289-market-visual v289-'+key+'">'+icon(e)+'</span><b>'+n+'</b><small>'+sub+'</small><strong>›</strong></a>').join('')+'</div><p id="eot-v289-market-empty" hidden>Aradığın kategori bulunamadı.</p>')+
 panel(title('⭐ Fırsatlar','Tümünü Gör','#dynamic_market')+
 '<a class="eot-v289-opportunity" href="#dynamic_market">'+icon('🎯')+'<span><b>Dinamik Fırsat Pazarı</b><small>Oyun tarafından sunulan güncel fırsatları incele</small></span><strong>›</strong></a>');
}
function makeBusiness(){
 return '<div class="eot-v289-page-title">İŞLETMELER</div>'+
 panel(title('📊 Genel Durum','Tüm Detaylar','#company_center')+
 '<div class="eot-v289-triple"><div>'+icon('🏢')+'<span>Toplam Şirket</span><strong id="eot-v289-business-count">—</strong></div>'+
 '<div>'+icon('💰')+'<span>Şirket Değeri</span><strong id="eot-v289-business-value">—</strong></div>'+
 '<div>'+icon('👥')+'<span>Çalışan</span><strong id="eot-v289-employees">—</strong></div></div>')+
 panel(title('🏢 İşletmelerim','Şirket Merkezi','#company_center')+
 '<div class="eot-v289-business-grid">'+category.slice(0,5).map(([e,n,s,h,code])=>'<a class="eot-v289-business-card" href="'+h+'">'+icon(e,'v289-'+code)+
 '<b>'+n+'</b><small id="eot-v289-count-'+code+'">—</small><span>Yönet ›</span></a>').join('')+'</div>')+
 panel(title('🏛️ Şirket Yönetimi')+
 '<div class="eot-v289-management-grid">'+card('🏢','Şirket Merkezi','Portföy, gelir ve faaliyetler','#company_center')+
 card('👥','Personel','Çalışan ve maaş yönetimi','#employees')+
 card('🏗️','Projeler','İnşaat ve yatırımlar','#project_portfolio')+
 card('📋','Görevler','Kariyer ilerlemesi','#missions')+'</div>')+
 '<a class="eot-v289-gold-btn" href="#company_setup">+ Yeni Şirket Kur</a>';
}
function makeFinance(){
 return '<div class="eot-v289-page-title">FİNANS</div>'+
 panel(title('📊 Finansal Genel Bakış','Tüm Detaylar','#budget')+
 '<div class="eot-v289-triple"><div>'+icon('💵')+'<span>Nakit</span><strong id="eot-v289-fin-cash">—</strong></div>'+
 '<div>'+icon('💰')+'<span>Net Değer</span><strong id="eot-v289-fin-worth">—</strong></div>'+
 '<div>'+icon('📈')+'<span>Yatırımlar</span><strong id="eot-v289-fin-invested">—</strong></div></div>')+
 '<div class="eot-v289-finance-grid">'+
 '<a href="#bank" class="eot-v289-finance-card"><b>🏛️ Banka Kredileri <i>›</i></b><p>Toplam Borç</p><strong id="eot-v289-fin-debt">—</strong><span class="eot-v289-finance-visual">◉ <em id="eot-v289-fin-credit">—</em> kredi puanı</span><small>KREDİ İŞLEMLERİ ›</small></a>'+
 '<a href="#stocks" class="eot-v289-finance-card"><b>📊 Borsa <i>›</i></b><p>Portföy Değeri</p><strong id="eot-v289-fin-stock">—</strong><span class="eot-v289-finance-visual">▂▃▅▄▆▇</span><small>YATIRIM YAP ›</small></a>'+
 '<a href="#crypto" class="eot-v289-finance-card"><b>₿ Kripto <i>›</i></b><p>Portföy Değeri</p><strong id="eot-v289-fin-crypto">—</strong><span class="eot-v289-finance-visual">▁▃▂▅▃▇</span><small>KRİPTO AL / SAT ›</small></a>'+
 '<a href="#gold" class="eot-v289-finance-card"><b>🪙 Altın <i>›</i></b><p>Portföy Değeri</p><strong id="eot-v289-fin-gold">—</strong><span class="eot-v289-finance-visual">▂▂▄▅▆█</span><small>ALTIN AL / SAT ›</small></a></div>'+
 panel(title('🧾 Finansal Yönetim','Tümünü Gör','#transactions')+
 '<div class="eot-v289-management-grid">'+card('📋','Gelir / Gider','Bütçe ve nakit akışı','#budget')+
 card('💳','Kredi Kartı','Harcama ve limitler','#credit_card')+
 card('🔐','Teminatlı Kredi','Varlıklara bağlı kredi','#secured_loans')+
 card('🔄','Yapılandırma','Ödeme planları','#loan_restructure')+'</div>');
}
function makeProfile(){
 return '<div class="eot-v289-page-title">PROFİL</div>'+
 panel('<div class="eot-v289-profile-main"><div class="eot-v289-avatar">👤</div><div><h2 id="eot-v289-player">Oyuncu</h2>'+
 '<small id="eot-v289-ceo">Empire of Trade</small><div class="eot-v289-level">⭐ <b id="eot-v289-level">1</b> · <span id="eot-v289-xp">0 / 100 XP</span></div></div>'+
 '<div class="eot-v289-reputation">🏆<small>İTİBAR</small><b id="eot-v289-rep">—</b></div></div><div class="eot-v289-progress"><i id="eot-v289-xpbar"></i></div>','eot-v289-profile-panel')+
 '<div class="eot-v289-profile-grid">'+
 card('💰','Toplam Net Değer','₺ —','#wealth_history')+card('🏢','Toplam Şirket','0','#business')+
 card('🏆','Kariyer Seviyesi','1','#character')+card('📊','Yatırım Portföyü','₺ —','#myassets')+'</div>'+
 panel(title('🏅 Kariyer ve Başarılar','Tümünü Gör','#missions')+
 '<div class="eot-v289-medals"><a href="#character">⭐<small>Karakter</small></a><a href="#myassets">🏙️<small>Varlıklar</small></a><a href="#missions">🤝<small>Görevler</small></a><a href="#wealth_history">📈<small>Servet</small></a></div>')+
 panel(title('⚙️ Hesap / Ayarlar')+
 '<div class="eot-v289-management-grid">'+card('👤','Hesap Bilgileri','Profil ve karakter','#character')+
 card('🗂️','Portföyüm','Sahip oldukların','#myassets')+
 card('🧾','Hareketler','İşlem kayıtları','#transactions')+
 card('📊','Servet Geçmişi','Kariyer gelişimi','#wealth_history')+'</div>');
}
const markup={home:makeHome,market:makeMarket,business:makeBusiness,finance:makeFinance,profile:makeProfile};
function mount(){
 if(mounted)return true;
 const app=document.querySelector('#app-root .app');
 if(!app||!routes.every(r=>by(r))||!document.querySelector('.bottom-nav'))return false;
 mountHero(app);
 routes.forEach(r=>{
   const section=by(r),node=document.createElement('div');
   node.className='eot-v289-view';node.dataset.route=r;node.innerHTML=markup[r]();
   section.appendChild(node);section.classList.add('eot-v289-mounted');
 });
 const input=by('eot-v289-market-search');
 const filters=by('eot-v289-market-filters');const toggle=by('eot-v289-filter');
 let currentFilter='all';
 const search=()=>{
   const q=input.value.toLocaleLowerCase('tr-TR').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
   let shown=0;
   by('eot-v289-market-grid').querySelectorAll('a').forEach(a=>{
    const label=(a.dataset.marketName||'').toLocaleLowerCase('tr-TR').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
    const on=label.includes(q)&&(currentFilter==='all'||a.dataset.marketGroup===currentFilter);
    a.hidden=!on;if(on)shown++;
   });
   by('eot-v289-market-empty').hidden=shown>0;
 };
 input.addEventListener('input',search);
 toggle.addEventListener('click',()=>{filters.hidden=!filters.hidden;toggle.setAttribute('aria-expanded',String(!filters.hidden))});
 filters.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{
  currentFilter=b.dataset.filter;
  filters.querySelectorAll('button').forEach(x=>x.classList.toggle('active',x===b));search();
 }));
 window.addEventListener('hashchange',updateRoute);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh()});
 mounted=true;updateRoute();refresh();
 setInterval(refresh,2000);
 return true;
}
function updateRoute(){
 const route=getRoute();
 const valid=routes.includes(route);
 document.body.classList.toggle('eot-v289-main',valid);
 document.body.dataset.v289Route=valid?route:'other';
 if(route!==previousRoute){previousRoute=route;refresh()}
}
function classify(item,word){
 const text=[item?.type,item?.sector,item?.name,item?.category,item?.kind].filter(Boolean).join(' ').toLocaleLowerCase('tr-TR');
 return word.some(x=>text.includes(x));
}
function counts(d){
 const all=[...d.assets,...d.companies];return {
 store:all.filter(a=>classify(a,['mağaza','dükkan','dükkan','perakende','market'])).length,
 factory:all.filter(a=>classify(a,['fabrika','üretim'])).length,
 construction:all.filter(a=>classify(a,['inşaat','proje'])).length,
 car:all.filter(a=>classify(a,['galeri','otomotiv','araç'])).length,
 estate:all.filter(a=>classify(a,['gayrimenkul','ev','villa','konut','daire'])).length,
 land:all.filter(a=>classify(a,['arsa'])).length
 };
}
const transactionNames={asset_buy:'Varlık satın alma',asset_sell:'Varlık satışı',buy:'Yatırım alımı',sell:'Yatırım satışı',loan_in:'Kredi kullanımı',installment:'Kredi ödemesi',factory_collect:'Fabrika geliri',construction_collect:'İnşaat geliri',deposit_open:'Vadeli hesap',company_foundation:'Şirket kuruluşu'};
function updateActivities(d){
 const list=(d.transactions||[]).slice(0,3);
 const sig=JSON.stringify(list);
 if(sig===lastActivities)return;lastActivities=sig;
 const wrap=by('eot-v289-activities');if(!wrap)return;
 wrap.replaceChildren();
 if(!list.length){const p=document.createElement('p');p.textContent='Henüz işlem yapılmadı. İlk yatırımınla ticaret yolculuğunu başlat.';wrap.append(p);return}
 for(const t of list){
 const row=document.createElement('div');row.className='eot-v289-activity-row';
 const amount=Number(t.amount??t.total??t.price??0);
 const type=t.type||'';
 row.innerHTML='<span>🧾</span><div><b>'+esc(transactionNames[type]||String(type||'İşlem'))+'</b><small>'+esc(t.sym||t.name||'Oyun işlemi')+'</small></div><strong>'+format(amount)+'</strong>';
 wrap.append(row);
 }
}
function refresh(){
 if(!mounted)return;
 const route=getRoute();if(!routes.includes(route)||document.body.classList.contains('eot-setting-up'))return;
 const d=data(),c=counts(d),companyTotal=d.companies.reduce((sum,x)=>sum+Number(x.capital||0)+Number(x.companyCash||0)+Number(x.brand||0),0);
 const investment=d.stock+d.crypto+d.gold;
 const companyName=d.company?.name||d.account?.name||'Oyuncu';
 const playerName=d.account?.name||d.company?.ceoName||'Oyuncu';
 const as=(id,n)=>txt(id,format(n));
 as('eot-v289-cash',d.cash);txt('eot-v289-credit',Math.round(d.credit));
 const bar=by('eot-v289-credit-bar');if(bar)bar.style.width=Math.min(100,Math.max(0,d.credit))+'%';
 const clock=new Date().toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit'});txt('eot-v289-clock',clock);
 const notices=Array.isArray(d.notifications)?d.notifications.filter(x=>x&&!x.read).length:0;const badge=by('eot-v289-badge');
 if(badge){badge.hidden=!notices;if(notices)badge.textContent=String(notices>99?'99+':notices)}
 if(route==='home'){
 as('eot-v289-worth',d.worth);as('eot-v289-flow',d.flow);txt('eot-v289-company-count',d.companies.length);
 updateActivities(d);
 }
 if(route==='market'){
  [['GSTEK','GSTEK'],['BTC','BTC'],['GRAM','GRAM']].forEach(([id,key])=>{
    const price=val(()=>ASSETS[key]?.sell,null);
    txt('eot-v289-price-'+id,Number.isFinite(Number(price))&&price!=null?format(price):'—');
  });
 }
 if(route==='business'){
 txt('eot-v289-business-count',d.companies.length);
 as('eot-v289-business-value',companyTotal);
 txt('eot-v289-employees',val(()=>sim.employees.length,0));
 Object.entries(c).forEach(([key,n])=>txt('eot-v289-count-'+key,n+' varlık'));
 }
 if(route==='finance'){
 for(const [id,n] of [['fin-cash',d.cash],['fin-worth',d.worth],['fin-invested',investment],
 ['fin-debt',d.debt],['fin-stock',d.stock],['fin-crypto',d.crypto],['fin-gold',d.gold]])as('eot-v289-'+id,n);
 txt('eot-v289-fin-credit',Math.round(d.credit));
 }
 if(route==='profile'){
 txt('eot-v289-player',playerName);
 txt('eot-v289-ceo',companyName);
 txt('eot-v289-level',d.level);
 txt('eot-v289-xp',d.xp);
 txt('eot-v289-rep',Math.round(d.rep)+'/100');
 const percent=Math.max(0,Math.min(100,Number((String(d.xp).match(/^\d+/)||['0'])[0])));
 const meter=by('eot-v289-xpbar');if(meter)meter.style.width=percent+'%';
 const links=document.querySelectorAll('#profile .eot-v289-profile-grid .eot-v289-tile small');
 [format(d.worth),d.companies.length+' şirket','Seviye '+d.level,format(investment)].forEach((str,i)=>{if(links[i])links[i].textContent=str});
 }
}
let tries=0;const t=setInterval(()=>{if(mount()||++tries>120)clearInterval(t)},250);
window.EOTShowcaseV289={refresh,updateRoute};
})();