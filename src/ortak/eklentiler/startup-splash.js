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
    #eotStartupSplash{position:fixed;inset:0;width:100%;height:100vh;height:100lvh;z-index:2147483646;isolation:isolate;overflow:hidden;background:radial-gradient(ellipse at 50% 42%,#102c50 0%,#07182e 37%,#040c1b 78%);color:#f5dfaa;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;opacity:1;transition:opacity .42s ease}
    #eotStartupSplash *{box-sizing:border-box}
    #eotStartupSplash.eot-splash-out{opacity:0;pointer-events:none}
    .eot-logo-stage{position:absolute;left:50%;top:45%;transform:translate(-50%,-50%);width:min(78vw,380px,48vh);aspect-ratio:1;isolation:isolate}
    .eot-logo-aura{position:absolute;inset:-30%;background:radial-gradient(ellipse at 32% 64%,#149cbb26,transparent 52%),radial-gradient(ellipse at 70% 30%,#d9a7481f,transparent 48%);pointer-events:none}
    .eot-trade-trails{position:absolute;inset:-15%;width:130%;height:130%;overflow:visible;pointer-events:none}
    .eot-trade-trails .rail{fill:none;stroke:#64b9d5;stroke-width:1;opacity:.18}
    .eot-trade-trails .gold{stroke:#e4bc6c}
    .eot-trade-trails .signal{fill:none;stroke:#91e6f5;stroke-width:2;stroke-linecap:round;stroke-dasharray:12 88;animation:eotTradeFlow 5s linear infinite;filter:drop-shadow(0 0 4px #58c4dc)}
    .eot-trade-trails .signal.gold{stroke:#ffda8c;animation-duration:6.5s;animation-delay:-3s;filter:drop-shadow(0 0 4px #e4bc6c)}
    .eot-trade-trails .facet{fill:#1a54721a;stroke:#73c5dc26;stroke-width:1}
    .eot-logo-emblem{position:absolute;inset:5%;margin:0;z-index:2;border-radius:22%;filter:drop-shadow(0 24px 32px #0008)}
    .eot-logo-crop{position:relative;width:100%;height:100%;overflow:hidden;border-radius:22%}
    .eot-logo-crop img{display:block;width:100%;height:100%;object-fit:contain;animation:eotLogoAppear 1s ease-out both}
    .eot-logo-crop::after{content:'';position:absolute;inset:-20% -60%;background:linear-gradient(110deg,transparent 43%,#fce3a42b 49%,#fff0bd88 50%,#fff0bd16 53%,transparent 57%);animation:eotGoldSweep 2s cubic-bezier(.2,.6,.3,1) .15s both;pointer-events:none}
    .eot-logo-glint{position:absolute;z-index:3;left:68%;top:71%;width:4px;height:4px;background:#fff1c5;border-radius:50%;box-shadow:0 0 12px #ffcd61;animation:eotGlint 3.8s ease-in-out 1.2s infinite;pointer-events:none}
    .eot-logo-glint::before,.eot-logo-glint::after{content:'';position:absolute;left:50%;top:50%;background:linear-gradient(transparent,#fff4c9,transparent);width:1px;height:28px;transform:translate(-50%,-50%)}
    .eot-logo-glint::after{transform:translate(-50%,-50%) rotate(90deg)}
    .eot-logo-loading{position:absolute;top:calc(45% + min(39vw,190px,24vh) + 46px);left:50%;transform:translateX(-50%);width:min(52vw,240px)}
    .eot-loading-caption{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:12px;font-size:11px;color:#acbdd1;letter-spacing:.03em}
    #eotSplashPercent{font-variant-numeric:tabular-nums;font-size:14px;color:#e8c875}
    .eot-loading-line{height:2px;background:#8acbd822;border-radius:10px;overflow:hidden}
    .eot-loading-line i{display:block;width:100%;height:100%;transform:scaleX(var(--progress,0));transform-origin:left;background:linear-gradient(90deg,#258da8,#8ed4dd,#e6c480)}
    @keyframes eotTradeFlow{from{stroke-dashoffset:100}to{stroke-dashoffset:0}}
    @keyframes eotLogoAppear{from{opacity:.6;filter:brightness(.8)}to{opacity:1;filter:brightness(1)}}
    @keyframes eotGoldSweep{from{transform:translateX(-65%);opacity:0}25%{opacity:.8}to{transform:translateX(65%);opacity:0}}
    @keyframes eotGlint{0%,25%,60%,100%{opacity:0;transform:scale(.5)}40%{opacity:.85;transform:scale(1)}}
    @media(orientation:landscape) and (max-height:600px){.eot-logo-stage{width:min(46vh,260px);top:40%}.eot-logo-loading{top:auto;bottom:8%;width:min(42vw,240px)}}
    @media(prefers-reduced-motion:reduce){#eotStartupSplash *,#eotStartupSplash *::before,#eotStartupSplash *::after{animation:none!important;transition:none!important}.eot-logo-crop::after,.eot-logo-glint{display:none}#eotStartupSplash{transition:none}}
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
      <div class="eot-logo-stage">
        <div class="eot-logo-aura" aria-hidden="true"></div>
        <svg class="eot-trade-trails" viewBox="0 0 500 500" aria-hidden="true" focusable="false">
          <path class="facet" d="M30 322 122 269 214 322 122 375Z"/>
          <path class="facet" d="M326 104 385 70 444 104 385 138Z"/>
          <path class="rail" d="M16 352 82 314V225L136 194V118L214 73"/>
          <path class="signal" pathLength="100" d="M16 352 82 314V225L136 194V118L214 73"/>
          <path class="rail gold" d="M284 425 352 386V316L424 274V179L477 148"/>
          <path class="signal gold" pathLength="100" d="M284 425 352 386V316L424 274V179L477 148"/>
          <path class="rail" d="M52 396 120 435 178 402M339 75 386 48 447 83"/>
        </svg>
        <h1 class="eot-logo-emblem"><div class="eot-logo-crop"><img src="./assets/logo-v221-512.png" alt="Empire of Trade" width="512" height="512" fetchpriority="high"></div></h1>
        <i class="eot-logo-glint" aria-hidden="true"></i>
      </div>
      <div class="eot-logo-loading" role="status" aria-label="Oyun yükleniyor"><div class="eot-loading-caption"><span id="eotSplashPhase">Yükleniyor…</span><strong id="eotSplashPercent">%0</strong></div><div class="eot-loading-line" aria-hidden="true"><i id="eotLoadingFill"></i></div></div>`;
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
    const fill=document.getElementById('eotLoadingFill');
    if(fill)fill.style.setProperty('--progress',String(shown/100));
    const pct=document.getElementById('eotSplashPercent');

    if(pct)pct.textContent='%'+visible;
  }

  function finish(){
    if(removed||finishing)return;
    finishing=true;
    const wait=0;
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