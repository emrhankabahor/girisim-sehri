/* Girişim Şehri V1.69 • Oynanabilirlik ve yönlendirme */
(function(){
 const KEY='gs_v169_progress';
 function money(n){try{return '₺'+Math.round(Number(n||0)).toLocaleString('tr-TR')}catch(e){return '₺0'}}
 function state(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){return {}}}
 function saveState(s){try{localStorage.setItem(KEY,JSON.stringify(s))}catch(e){}}
 function companies(){try{return Array.isArray(sim?.companies)?sim.companies:[]}catch(e){return []}}
 function assets(){try{return Array.isArray(ownedAssets)?ownedAssets:[]}catch(e){return []}}
 function activeLoans(){try{return Array.isArray(loans)?loans.filter(x=>!x.closed&&Number(x.remaining||0)>0):[]}catch(e){return []}}
 function goals(){
   const cs=companies(),as=assets(),ls=activeLoans(),c=Number(window.cash||0);
   return [
    {id:'company',title:'İlk şirketini kur',done:cs.length>0,detail:cs.length?'Şirket portföyün aktif.':'Bir sektör seçip ilk şirketini kur.'},
    {id:'asset',title:'İlk varlığını edin',done:as.length>0,detail:as.length?'Varlık portföyün oluştu.':'Pazar bölümünden arsa, ev veya araç edin.'},
    {id:'reserve',title:'Nakit rezervi oluştur',done:c>=500000,detail:'Hedef: '+money(500000)+' • Mevcut: '+money(c)},
    {id:'credit',title:'Finansal güvenini geliştir',done:Number(window.creditScore||0)>=60,detail:'Kredi puanı hedefi: 60 • Mevcut: '+Math.round(Number(window.creditScore||0))},
    {id:'debt',title:'Borcu kontrol altında tut',done:ls.length<=2,detail:'Aktif kredi: '+ls.length+' / 2'}
   ];
 }
 function ensureStyle(){if(document.getElementById('v169Style'))return;let s=document.createElement('style');s.id='v169Style';s.textContent=`
 .v169-panel{margin:14px 0;padding:16px;border:1px solid rgba(96,165,250,.22);border-radius:20px;background:linear-gradient(145deg,rgba(15,36,58,.96),rgba(8,24,40,.96));box-shadow:0 12px 28px rgba(0,0,0,.14)}
 .v169-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px}.v169-head b{font-size:15px}.v169-badge{font-size:10px;padding:5px 8px;border-radius:999px;background:rgba(45,212,191,.12);color:#79e6d1;border:1px solid rgba(45,212,191,.2)}
 .v169-goal{padding:11px 0;border-top:1px solid rgba(148,163,184,.12)}.v169-goal:first-of-type{border-top:0}.v169-title{font-size:12px;font-weight:850;display:flex;gap:8px;align-items:center}.v169-detail{font-size:10px;color:#91a4bb;margin:5px 0 0 24px;line-height:1.45}.v169-done{color:#72dfc5}.v169-tip{margin-top:12px;padding:11px;border-radius:14px;background:rgba(59,130,246,.09);font-size:10px;line-height:1.55;color:#b8c9dc}
 `;document.head.appendChild(s)}
 function mount(){
   ensureStyle();
   const home=document.querySelector('#homeView,.home-view,[data-view="home"],main');if(!home)return;
   let box=document.getElementById('v169Goals');if(!box){box=document.createElement('section');box.id='v169Goals';box.className='v169-panel';let anchor=home.querySelector('.home-status-row,.home-main-card,.quick-access');if(anchor&&anchor.parentNode)anchor.parentNode.insertBefore(box,anchor.nextSibling);else home.appendChild(box)}
   const gs=goals(),done=gs.filter(g=>g.done).length;
   box.innerHTML='<div class="v169-head"><b>🎯 Kariyer Hedefleri</b><span class="v169-badge">'+done+'/'+gs.length+' tamamlandı</span></div>'+gs.map(g=>'<div class="v169-goal"><div class="v169-title '+(g.done?'v169-done':'')+'"><span>'+(g.done?'✓':'○')+'</span>'+g.title+'</div><div class="v169-detail">'+g.detail+'</div></div>').join('')+'<div class="v169-tip">💡 Öneri: Bütün paranı tek yatırıma bağlama. Nakit rezervi bırak, şirket ve varlık gelirlerini çeşitlendir, kredi taksitlerini gerçek vade tarihine göre takip et.</div>';
 }
 function dueReminder(){
   try{
    let now=Date.now(),s=state(),changed=false;
    activeLoans().forEach(l=>{let due=Number(l.nextDue||0);if(!due)return;let diff=due-now;if(diff>0&&diff<=86400000){let k='loan_'+(l.id||l.t||due)+'_'+due;if(!s[k]){s[k]=1;changed=true;if(typeof toast==='function')toast('Yaklaşan kredi taksiti • '+(l.name||'Banka')+' • Son ödeme 24 saat içinde')}}});
    if(changed)saveState(s)
   }catch(e){}
 }
 function refresh(){try{mount();dueReminder()}catch(e){}}
 const oldRender=window.render;if(typeof oldRender==='function')window.render=function(){let r=oldRender.apply(this,arguments);setTimeout(refresh,30);return r};
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)setTimeout(refresh,100)});
 window.addEventListener('hashchange',()=>setTimeout(refresh,80));
 setInterval(refresh,5000);setTimeout(refresh,500);
})();
