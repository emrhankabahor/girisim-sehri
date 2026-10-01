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
    .eot-world-glow::before,.eot-world-glow::after{content:'';position:absolute;width:32%;height:110%;top:-30%;left:10%;background:linear-gradient(180deg,#74c9ec0c,transparent 80%);transform:rotate(28deg);pointer-events:none}
    .eot-world-glow::after{left:auto;right:3%;width:16%;background:linear-gradient(180deg,#e9bd6410,transparent 75%);transform:rotate(28deg)}
    .eot-trade-map::after{content:'';position:absolute;left:18%;right:18%;bottom:1%;height:1px;background:linear-gradient(90deg,transparent,#dcb86977,transparent);box-shadow:0 0 20px #dcb86922}
    .eot-wordmark{position:relative}
    .eot-opening-title{background:linear-gradient(#fffdf5,#ebd49e);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
    .eot-world-grid{position:absolute;width:150%;height:60%;left:-25%;bottom:-30%;background-image:linear-gradient(#6ca9cb17 1px,transparent 1px),linear-gradient(90deg,#6ca9cb17 1px,transparent 1px);background-size:44px 44px;transform:perspective(400px) rotateX(55deg);mask-image:linear-gradient(transparent,#000);pointer-events:none}
    .eot-opening-meta{position:absolute;inset:calc(env(safe-area-inset-top,0px) + 24px) 7% auto;display:flex;justify-content:space-between;align-items:center;gap:12px;font-size:9px;font-weight:700;letter-spacing:.15em;color:#a8bccc}
    .eot-opening-meta span{color:#e9ce90;font-size:8px;letter-spacing:.1em;border:1px solid #d2ad5933;padding:7px 10px;border-radius:30px}
    .eot-network-layout{position:absolute;inset:calc(env(safe-area-inset-top,0px) + 66px) 20px calc(env(safe-area-inset-bottom,0px) + 32px);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:30px}
    .eot-trade-map{position:relative;width:min(90%,440px,52vh);aspect-ratio:1;flex:none}
    .eot-orbits{position:absolute;inset:0;width:100%;height:100%;overflow:visible}
    .eot-orbit-base{fill:none;stroke:#a0c7df20;stroke-width:1}
    .eot-orbit-progress{fill:none;stroke:url(#eotOrbitGold);stroke-width:2.5;stroke-linecap:round;stroke-dasharray:100;stroke-dashoffset:var(--remaining,100);transform:rotate(-90deg);transform-origin:250px 250px;filter:drop-shadow(0 0 4px #edc87955)}
    .eot-network-logo{position:absolute;inset:22%;margin:0;display:grid;place-items:center;z-index:2}
    .eot-network-logo::before{content:'';position:absolute;inset:-15%;border-radius:50%;background:radial-gradient(#2a95c737,transparent 70%);animation:eotLogoGlow 4s ease-in-out infinite}
    .eot-network-logo img{position:relative;width:100%;height:auto;border-radius:22%;filter:drop-shadow(0 15px 22px #0007)}
    .eot-opening-title{text-align:center;margin:0;color:#f7efdc;font-size:clamp(20px,5.6vw,30px);font-weight:850;letter-spacing:.08em;line-height:1.2}
    .eot-opening-subtitle{margin:9px 0 0;text-align:center;font-size:8px;letter-spacing:.36em;color:#c7a66b}
    .eot-opening-status{width:min(76vw,320px);display:flex;justify-content:space-between;align-items:center;gap:20px;padding-top:16px;border-top:1px solid #8cb7d02b;font-size:11px;color:#aac0d1}
    #eotSplashPercent{font-variant-numeric:tabular-nums;font-size:22px;letter-spacing:-.04em;color:#f3d89b}

    @keyframes eotLogoGlow{0%,100%{opacity:.5;transform:scale(.96)}50%{opacity:1;transform:scale(1.04)}}
    @media(max-height:650px){.eot-network-layout{gap:14px;inset:60px 16px 20px}.eot-trade-map{width:min(82vw,52vh)}.eot-opening-title{font-size:20px}.eot-opening-status{padding-top:10px}}
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
    el.innerHTML=`
      <div class="eot-world-glow" aria-hidden="true"></div><div class="eot-world-grid" aria-hidden="true"></div>
      <header class="eot-opening-meta"><b>EMPIRE OF TRADE</b><span>GELİŞTİRME SÜRÜMÜ</span></header>
      <div class="eot-network-layout">
        <div class="eot-trade-map">
          <svg class="eot-orbits" viewBox="0 0 500 500" aria-hidden="true"><defs><linearGradient id="eotOrbitGold"><stop stop-color="#66d7ef"/><stop offset=".6" stop-color="#ffe29b"/><stop offset="1" stop-color="#cc9440"/></linearGradient></defs>
            <circle class="eot-orbit-base" cx="250" cy="250" r="184"/><circle class="eot-orbit-base" cx="250" cy="250" r="215" stroke-dasharray="1 12"/>
            <circle class="eot-orbit-progress" id="eotOrbitProgress" cx="250" cy="250" r="184" pathLength="100"/>
          </svg>
          <h1 class="eot-network-logo"><img src="./assets/logo-v221-512.png" alt="Empire of Trade" width="512" height="512" fetchpriority="high"></h1>
        </div>
        <div class="eot-wordmark"><p class="eot-opening-title">EMPIRE OF TRADE</p><p class="eot-opening-subtitle">BUSINESS EMPIRE</p></div>
        <div class="eot-opening-status" role="status" aria-label="Oyun yükleniyor"><span id="eotSplashPhase">Yükleniyor…</span><strong id="eotSplashPercent">%0</strong></div>
      </div>`;
    document.body.appendChild(el);
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