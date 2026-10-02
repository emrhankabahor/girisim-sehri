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
    #eotStartupSplash{position:fixed;inset:0;width:100%;height:100vh;height:100lvh;z-index:2147483646;isolation:isolate;overflow:hidden;background:#06152f;color:#f7f1e4;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;opacity:1;transition:opacity .42s ease}
    #eotStartupSplash *{box-sizing:border-box}
    #eotStartupSplash.eot-splash-out{opacity:0;pointer-events:none}
    .eot-atmosphere{position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse at 50% 41%,#19497077,transparent 60%),linear-gradient(155deg,#06152f,#071830 70%,#0a2238)}
    .eot-atmosphere::after{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 50% 50%,#77c5e331,transparent 65%);opacity:0;transition:opacity .23s ease}
    .eot-arriving .eot-atmosphere::after{opacity:1}
    .eot-horizon{position:absolute;left:50%;bottom:8%;width:max(100%,900px);height:42%;transform:translateX(-50%);opacity:.32;pointer-events:none;mask-image:linear-gradient(transparent,#000 45%,#000 80%,transparent)}
    .eot-horizon svg{width:100%;height:100%;display:block}
    .eot-gold-trace{position:absolute;left:-10%;right:-10%;bottom:19%;height:1px;background:linear-gradient(90deg,transparent,#edc26900 20%,#edc26966 50%,#edc26900 80%,transparent);transform:rotate(-8deg);opacity:.3;pointer-events:none}
    .eot-gold-trace::after{content:'';position:absolute;inset:-1px 0;background:linear-gradient(90deg,transparent 40%,#ffe6a580 50%,transparent 60%);animation:eotTrace 5s ease-out 1 both}
    .eot-cinema-layout{position:absolute;inset:calc(env(safe-area-inset-top,0px) + 55px) 24px calc(env(safe-area-inset-bottom,0px) + 42px);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:32px}
    .eot-cinema-emblem{position:relative;width:min(66vw,290px,38vh);aspect-ratio:1;flex:none;margin:0;isolation:isolate}
    .eot-cinema-emblem::before{content:'';position:absolute;inset:-28%;z-index:-1;background:radial-gradient(ellipse,#3295be33,transparent 67%)}
    .eot-logo-window{position:relative;width:100%;height:100%;overflow:hidden;border-radius:22%;box-shadow:0 25px 45px #0005}
    .eot-logo-window img{display:block;width:100%;height:100%;object-fit:contain;animation:eotLogoReveal 1.25s ease-out both}
    .eot-logo-window::after{content:'';position:absolute;inset:-20% -45%;background:linear-gradient(110deg,transparent 42%,#ffe7ac22 48%,#fff4cf66 50%,#8ed9ee15 54%,transparent 60%);transform:translateX(-75%);animation:eotLogoSweep 1.4s ease-out .15s 1 both;pointer-events:none}
    .eot-cinema-wordmark{text-align:center;position:relative}
    .eot-cinema-title{margin:0;font-size:clamp(20px,5.6vw,32px);font-weight:850;line-height:1.2;letter-spacing:.09em;background:linear-gradient(#fffdf8,#ddbd79);-webkit-background-clip:text;background-clip:text;color:#f5e6bd;-webkit-text-fill-color:transparent}
    .eot-cinema-subtitle{margin:12px 0 0;font-size:8px;font-weight:600;letter-spacing:.35em;color:#b79d70}
    .eot-cinema-loading{width:min(76vw,330px);margin-top:15px}
    .eot-loading-line{height:2px;background:#c9ad701c;position:relative;border-radius:4px;overflow:hidden}
    .eot-loading-line i{display:block;width:100%;height:100%;transform:scaleX(var(--progress,0));transform-origin:left;background:linear-gradient(90deg,#987033,#e3bf70,#fff1c1);box-shadow:0 0 12px #eec47780}
    .eot-loading-caption{display:flex;justify-content:space-between;gap:20px;margin-top:15px;font-size:10px;letter-spacing:.04em;color:#91a9bb}
    #eotSplashPercent{font-size:12px;font-weight:600;font-variant-numeric:tabular-nums;color:#dcc28b;min-width:36px;text-align:right}
    .eot-cinema-footer{position:absolute;bottom:calc(env(safe-area-inset-bottom,0px) + 22px);left:20px;right:20px;text-align:center;font-size:7px;letter-spacing:.22em;color:#8196aa80}
    @keyframes eotLogoReveal{from{opacity:.55;filter:brightness(.7)}to{opacity:1;filter:brightness(1)}}
    @keyframes eotLogoSweep{from{transform:translateX(-75%);opacity:0}20%{opacity:1}to{transform:translateX(75%);opacity:0}}
    @keyframes eotTrace{from{transform:translateX(-40%);opacity:0}35%{opacity:.8}to{transform:translateX(40%);opacity:0}}
    @media(max-height:650px){.eot-cinema-layout{gap:20px;inset:40px 20px 45px}.eot-cinema-emblem{width:min(54vw,32vh)}.eot-cinema-title{font-size:20px}.eot-cinema-loading{margin-top:6px}}
    @media(orientation:landscape) and (max-height:600px){.eot-cinema-layout{display:grid;grid-template-columns:min(40vh,220px) minmax(180px,320px);grid-template-rows:1fr 1fr;align-content:center;gap:22px 50px}.eot-cinema-emblem{grid-row:1/3;width:100%}.eot-cinema-wordmark{align-self:end}.eot-cinema-loading{align-self:start;width:100%;margin-top:0}.eot-cinema-title{font-size:22px}}
    @media(prefers-reduced-motion:reduce){#eotStartupSplash *,#eotStartupSplash *::before,#eotStartupSplash *::after{animation:none!important;transition:none!important}.eot-logo-window::after{display:none}#eotStartupSplash{transition:none}}
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
      <div class="eot-atmosphere" aria-hidden="true"></div>
      <div class="eot-horizon" aria-hidden="true"><svg viewBox="0 0 1440 400" preserveAspectRatio="xMidYMax meet">
        <defs><linearGradient id="eotCityInk" x2="0" y2="1"><stop stop-color="#397399"/><stop offset="1" stop-color="#0a2137"/></linearGradient><pattern id="eotCityWindows" width="18" height="22" patternUnits="userSpaceOnUse"><rect x="6" y="5" width="3" height="5" fill="#a9cfe7" opacity=".35"/></pattern></defs>
        <path fill="url(#eotCityInk)" d="M0 350V250h55v-60h42v160h22V150h65v200h25V225h72v125h28V110h56V80h12v30h30v240h27V175h66v175h24V215h65v135h28V95h38V55h10v40h42v255h30V160h64v190h35V195h70v155h28V120h55V85h12v35h28v230h35V210h65v140h28V140h65v210h30V230h77v120h25V190h80v160h70v50H0Z"/>
        <path fill="url(#eotCityWindows)" d="M119 165h65v185h-65z M309 125h56v225h-56z M434 190h66v160h-66z M617 110h90v240h-90z M737 175h64v175h-64z M929 135h55v215h-55z M1185 245h77v105h-77z"/>
        <path d="M0 355H1440 M35 345Q260 210 465 345 M35 345V290 M250 345V210 M465 345V290" fill="none" stroke="#6da7c8" stroke-width="1.5" opacity=".5"/>
      </svg></div><div class="eot-gold-trace" aria-hidden="true"></div>
      <div class="eot-cinema-layout">
        <h1 class="eot-cinema-emblem"><div class="eot-logo-window"><img src="./assets/logo-v221-512.png" alt="Empire of Trade" width="512" height="512" fetchpriority="high"></div></h1>
        <div class="eot-cinema-wordmark"><p class="eot-cinema-title">EMPIRE OF TRADE</p><p class="eot-cinema-subtitle">BUSINESS EMPIRE</p></div>
        <div class="eot-cinema-loading" role="status" aria-label="Oyun yükleniyor"><div class="eot-loading-line" aria-hidden="true"><i id="eotLoadingFill"></i></div><div class="eot-loading-caption"><span id="eotSplashPhase">Yükleniyor…</span><strong id="eotSplashPercent">%0</strong></div></div>
      </div><div class="eot-cinema-footer">GELİŞTİRME SÜRÜMÜ</div>`;
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
      document.getElementById('eotStartupSplash')?.classList.add('eot-arriving');
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