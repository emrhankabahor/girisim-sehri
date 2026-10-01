/* Empire of Trade • Açılış animasyonu + render perdesi */
(function(){
  'use strict';
  if(window.__eotStartupSplashLoaded)return;
  window.__eotStartupSplashLoaded=true;
  const nativeMode=new URLSearchParams(location.search).get('native')==='1';
  window.__EOT_NATIVE_WRAPPER__=nativeMode;
  if(nativeMode){
    window.EOTStartupSplash={progress(){},ready(){},failOpen(){}};
    return;
  }

  let sectorLabels=[];
  const started=performance.now();
  let visibleStarted=0;
  let target=8, shown=0, ready=false, removed=false, finishing=false, timer=null;

  const style=document.createElement('style');
  style.id='eot-startup-splash-style';
  style.textContent=`
    html.eot-booting,html.eot-booting body{overflow:hidden!important;overscroll-behavior:none!important}
    html.eot-booting #app-root{visibility:hidden!important}
    #eotStartupSplash{position:fixed;inset:0;width:100%;height:100vh;height:100lvh;z-index:2147483646;isolation:isolate;overflow:hidden;background:#06152f;color:#eef7ff;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;opacity:1;transition:opacity .42s ease}
    #eotStartupSplash *{box-sizing:border-box}
    #eotStartupSplash.eot-splash-out{opacity:0;pointer-events:none}
    .eot-world-glow{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 40%,#164f7d80,transparent 55%),radial-gradient(ellipse at 90% 100%,#bd872a16,transparent 50%);pointer-events:none}
    .eot-world-grid{position:absolute;width:150%;height:60%;left:-25%;bottom:-30%;background-image:linear-gradient(#6ca9cb17 1px,transparent 1px),linear-gradient(90deg,#6ca9cb17 1px,transparent 1px);background-size:44px 44px;transform:perspective(400px) rotateX(55deg);mask-image:linear-gradient(transparent,#000);pointer-events:none}
    .eot-opening-meta{position:absolute;inset:calc(env(safe-area-inset-top,0px) + 24px) 7% auto;display:flex;justify-content:space-between;align-items:center;gap:12px;font-size:9px;font-weight:700;letter-spacing:.15em;color:#a8bccc}
    .eot-opening-meta span{color:#e9ce90;font-size:8px;letter-spacing:.1em;border:1px solid #d2ad5933;padding:7px 10px;border-radius:30px}
    .eot-network-layout{position:absolute;inset:calc(env(safe-area-inset-top,0px) + 66px) 20px calc(env(safe-area-inset-bottom,0px) + 32px);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:24px}
    .eot-trade-map{position:relative;width:min(100%,470px,58vh);aspect-ratio:1;flex:none}
    .eot-orbits{position:absolute;inset:0;width:100%;height:100%;overflow:visible}
    .eot-orbit-base{fill:none;stroke:#75b7dd19;stroke-width:1}
    .eot-orbit-progress{fill:none;stroke:url(#eotOrbitGold);stroke-width:2.5;stroke-linecap:round;stroke-dasharray:100;stroke-dashoffset:var(--remaining,100);transform:rotate(-90deg);transform-origin:250px 250px;filter:drop-shadow(0 0 4px #edc87955)}
    .eot-route{fill:none;stroke:#62b6d94a;stroke-width:1;stroke-dasharray:3 7}
    .eot-trade-signal{fill:#8fe5ff;filter:drop-shadow(0 0 5px #72d4ff);animation:eotSignal 3s ease-in-out infinite}
    .eot-trade-signal:nth-of-type(2){animation-delay:1s}
    .eot-trade-signal:nth-of-type(3){animation-delay:2s}
    .eot-network-logo{position:absolute;inset:27%;margin:0;display:grid;place-items:center;z-index:2}
    .eot-network-logo::before{content:'';position:absolute;inset:-15%;border-radius:50%;background:radial-gradient(#2a95c737,transparent 70%);animation:eotLogoGlow 4s ease-in-out infinite}
    .eot-network-logo img{position:relative;width:100%;height:auto;border-radius:22%;filter:drop-shadow(0 15px 22px #0007)}
    .eot-sector{position:absolute;width:24%;height:19%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:7px;border:1px solid #477b9b66;border-radius:16px;background:linear-gradient(145deg,#153858f0,#0a203a);box-shadow:0 8px 20px #0003;color:#86a5bd;transition:border-color .4s,color .4s,box-shadow .4s}
    .eot-sector svg{width:34px;height:34px;fill:none;stroke:currentColor;stroke-width:1.5;stroke-linejoin:round;stroke-linecap:round}
    .eot-sector span{font-size:8px;font-weight:750;letter-spacing:.08em}
    .eot-sector.active{color:#f1d188;border-color:#b38e47;box-shadow:0 0 22px #e2b54b12,0 10px 22px #0003}
    .eot-sector:nth-of-type(1){top:0;left:38%}.eot-sector:nth-of-type(2){right:0;top:40.5%}.eot-sector:nth-of-type(3){bottom:0;left:38%}.eot-sector:nth-of-type(4){left:0;top:40.5%}
    .eot-opening-title{text-align:center;margin:0;color:#f7efdc;font-size:clamp(20px,5.6vw,30px);font-weight:850;letter-spacing:.1em;line-height:1.2}
    .eot-opening-subtitle{margin:9px 0 0;text-align:center;font-size:8px;letter-spacing:.36em;color:#c7a66b}
    .eot-opening-status{width:min(76vw,320px);display:flex;justify-content:space-between;align-items:center;gap:20px;padding-top:16px;border-top:1px solid #8cb7d02b;font-size:11px;color:#aac0d1}
    #eotSplashPercent{font-variant-numeric:tabular-nums;font-size:22px;letter-spacing:-.04em;color:#f3d89b}
    @keyframes eotSignal{0%,100%{opacity:.15}50%{opacity:1}}
    @keyframes eotLogoGlow{0%,100%{opacity:.5;transform:scale(.96)}50%{opacity:1;transform:scale(1.04)}}
    @media(max-height:650px){.eot-network-layout{gap:14px;inset:60px 16px 20px}.eot-trade-map{width:min(82vw,52vh)}.eot-opening-title{font-size:20px}.eot-sector svg{width:25px;height:25px}.eot-sector{gap:4px;border-radius:12px}.eot-sector span{font-size:7px}.eot-opening-status{padding-top:10px}}
    @media(orientation:landscape) and (max-height:600px){.eot-network-layout{display:grid;grid-template-columns:min(58vh,340px) minmax(180px,300px);grid-template-rows:1fr 1fr;gap:14px 40px;align-content:center}.eot-trade-map{grid-row:1/3;width:100%}.eot-wordmark{align-self:end}.eot-opening-status{align-self:start;width:100%}.eot-opening-title{font-size:22px}}
    @media(prefers-reduced-motion:reduce){#eotStartupSplash *{animation:none!important;transition:none!important}#eotStartupSplash{transition:none}}
  `;
  document.head.appendChild(style);
  document.documentElement.classList.add('eot-booting');
  const firstPaintGuard=document.getElementById('eot-first-paint-guard');

  function mount(){
    if(document.getElementById('eotStartupSplash'))return;
    visibleStarted=performance.now();
    const el=document.createElement('div');
    el.id='eotStartupSplash';
    // iOS standalone initially reports a shorter viewport during its launch animation.
    // Use the full screen height from the first frame so the centered content stays put.
    const standalone=(typeof navigator!=='undefined'&&navigator.standalone===true)||
      (typeof window.matchMedia==='function'&&window.matchMedia('(display-mode: standalone)').matches);
    if(standalone&&typeof screen!=='undefined'&&Number.isFinite(screen.height)&&screen.height>0){
      el.style.height=screen.height+'px';
    }
    const icons=[
      '<path d="M5 29 20 21 35 29 20 37Z M5 21 20 13 35 21 20 29Z M20 4v10 M16 7l4-3 4 3"/>',
      '<path d="M5 33V14l15-8 15 8v19 M10 31v-7h20v7 M12 24l3-6h10l3 6 M13 28h2 M25 28h2 M9 33h22"/>',
      '<path d="M7 34V17h26v17 M5 17l4-10h22l4 10 M15 34V24h10v10 M5 17q4 6 8 0 4 6 8 0 4 6 8 0 4 6 6 0"/>',
      '<path d="M7 34V24h5v10 M18 34V18h5v16 M29 34V10h5v24 M6 17 17 10 23 13 34 4 M28 4h6v6"/>'
    ];
    el.innerHTML=`
      <div class="eot-world-glow" aria-hidden="true"></div><div class="eot-world-grid" aria-hidden="true"></div>
      <header class="eot-opening-meta"><b>EMPIRE OF TRADE</b><span>GELİŞTİRME SÜRÜMÜ</span></header>
      <div class="eot-network-layout">
        <div class="eot-trade-map">
          <svg class="eot-orbits" viewBox="0 0 500 500" aria-hidden="true"><defs><linearGradient id="eotOrbitGold"><stop stop-color="#66d7ef"/><stop offset=".6" stop-color="#ffe29b"/><stop offset="1" stop-color="#cc9440"/></linearGradient></defs>
            <circle class="eot-orbit-base" cx="250" cy="250" r="184"/><circle class="eot-orbit-base" cx="250" cy="250" r="155"/>
            <path class="eot-route" d="M250 100V155 M345 250h55 M250 345v55 M100 250h55"/>
            <circle class="eot-orbit-progress" id="eotOrbitProgress" cx="250" cy="250" r="184" pathLength="100"/>
            <g><circle class="eot-trade-signal" cx="250" cy="126" r="3"/><circle class="eot-trade-signal" cx="375" cy="250" r="3"/><circle class="eot-trade-signal" cx="250" cy="375" r="3"/><circle class="eot-trade-signal" cx="126" cy="250" r="3"/></g>
          </svg>
          <h1 class="eot-network-logo"><img src="./assets/logo-v221-512.png" alt="Empire of Trade" width="512" height="512" fetchpriority="high"></h1>
          ${['ARSA','GALERİ','İŞLETMELER','FİNANS'].map((name,i)=>'<div class="eot-sector" aria-hidden="true"><svg viewBox="0 0 40 40">'+icons[i]+'</svg><span>'+name+'</span></div>').join('')}
        </div>
        <div class="eot-wordmark"><p class="eot-opening-title">EMPIRE OF TRADE</p><p class="eot-opening-subtitle">BUSINESS EMPIRE</p></div>
        <div class="eot-opening-status" role="status" aria-label="Oyun yükleniyor"><span id="eotSplashPhase">Yükleniyor…</span><strong id="eotSplashPercent">%0</strong></div>
      </div>`;
    document.body.appendChild(el);
    sectorLabels=Array.from(el.querySelectorAll('.eot-sector'));
    requestAnimationFrame(()=>{ if(firstPaintGuard) firstPaintGuard.remove(); const preview=document.getElementById('eotFirstPaint');if(preview)preview.remove(); });
  }

  function removeSnapshotCover(){
    const el=document.getElementById('eotStartupSnapshotCover');
    if(el)el.remove();
  }

  function paint(v){
    const display=Math.max(0,Math.min(100,Number(v)||0));
    shown=Math.max(shown,display);
    const visible=Math.max(0,Math.min(100,Math.round(shown)));
    const phase=document.getElementById('eotSplashPhase');
    if(phase)phase.textContent=visible>=100?'Yüklendi':'Yükleniyor…';
    sectorLabels.forEach((item,i)=>item.classList.toggle('active',shown>i*25));
    const orbit=document.getElementById('eotOrbitProgress');
    if(orbit)orbit.style.setProperty('--remaining',String(100-shown));
    const pct=document.getElementById('eotSplashPercent');

    if(pct)pct.textContent='%'+visible;
  }

  function finish(){
    if(removed||finishing)return;
    finishing=true;
    const elapsed=performance.now()-(visibleStarted||started);
    const wait=Math.max(0,2600-elapsed);
    setTimeout(()=>{
      paint(100);
      setTimeout(()=>{
        const el=document.getElementById('eotStartupSplash');
        // Restore page layout while the cover is still opaque; fade only after paint.
        document.documentElement.classList.remove('eot-booting');
        requestAnimationFrame(()=>requestAnimationFrame(()=>{
          if(el){el.style.pointerEvents='none';el.setAttribute('aria-hidden','true');el.classList.add('eot-splash-out');}
          setTimeout(()=>{el&&el.remove();style.remove();removed=true},460);
        }));
      },230);
    },wait);
  }

  function tick(){
    if(removed)return;
    if(!ready){
      target=Math.min(94,target+(.35+Math.random()*.75));
    }else{
      target=100;
    }
    shown+=(target-shown)*.16;
    paint(shown);
    if(ready&&shown>=97){finish();return}
    timer=requestAnimationFrame(tick);
  }

  window.EOTStartupSplash={
    progress(v){target=Math.max(target,Math.min(96,Math.round(Number(v)||0)))},
    ready(){if(ready)return;ready=true;target=100},
    failOpen(){ready=true;target=100;finish()}
  };

  if(document.body) mount();
  else document.addEventListener('DOMContentLoaded',mount,{once:true});
  requestAnimationFrame(tick);

  // Returning to the game must not create or retain a second branded loader.
  // Clean up any legacy cover restored with a page snapshot, including bfcache.
  window.addEventListener('pageshow',removeSnapshotCover);
  document.addEventListener('visibilitychange',()=>{
    if(document.visibilityState==='visible')removeSnapshotCover();
  });

  // Herhangi bir beklenmeyen hata oyunu sonsuza kadar kapatmasın.
  setTimeout(()=>{if(!ready)window.EOTStartupSplash.ready()},9000);
})();