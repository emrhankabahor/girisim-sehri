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

  let cityScene=null;
  const started=performance.now();
  let visibleStarted=0;
  let target=8, shown=0, ready=false, removed=false, finishing=false, timer=null;

  const style=document.createElement('style');
  style.id='eot-startup-splash-style';
  style.textContent=`
    html.eot-booting,html.eot-booting body{overflow:hidden!important;overscroll-behavior:none!important}
    html.eot-booting #app-root{visibility:hidden!important}
    #eotStartupSplash{position:fixed;inset:0;width:100%;height:100vh;height:100lvh;box-sizing:border-box;isolation:isolate;overflow:hidden;z-index:2147483646;background:#061322;color:#fff8e8;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;opacity:1;transition:opacity .42s ease}
    .eot-animated-city{position:absolute;inset:0;width:100%;height:100%;background:radial-gradient(ellipse at 50% 55%,#123346,#061322 65%)}
    #eotStartupSplash *{box-sizing:border-box}
    #eotStartupSplash.eot-splash-out{opacity:0;pointer-events:none}
    .eot-cinema-art{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;object-position:center 55%;background:#061322}
    .eot-cinema-shade{position:absolute;inset:0;background:linear-gradient(180deg,#02101d66 0%,#0412230d 33%,transparent 65%,#030d19b3 82%,#030b16 100%);pointer-events:none}
    .eot-cinema-top{position:absolute;top:calc(env(safe-area-inset-top,0px) + 22px);left:25px;right:25px;display:flex;justify-content:space-between;align-items:center;font-size:8px;letter-spacing:.2em;color:#d3dce0}
    .eot-cinema-top b{font-weight:600;color:#dfc595;letter-spacing:.22em}
    .eot-cinema-top span{border:1px solid #bac5cc33;border-radius:20px;padding:6px 9px;background:#06142344}
    .eot-cinema-brand{position:absolute;top:calc(env(safe-area-inset-top,0px) + 84px);left:50%;transform:translateX(-50%);width:min(90%,550px);text-align:center;text-shadow:0 3px 24px #0009}
    .eot-cinema-eyebrow{display:flex;align-items:center;justify-content:center;gap:13px;color:#e0c38e;font-size:8px;font-weight:600;letter-spacing:.25em;margin:0 0 16px}
    .eot-cinema-eyebrow::before,.eot-cinema-eyebrow::after{content:'';height:1px;width:28px;background:#d0b57c88}
    .eot-cinema-title{margin:0;font-family:Georgia,"Times New Roman",serif;font-size:clamp(45px,13.5vw,76px);line-height:.92;font-weight:700;letter-spacing:.035em;color:#fff4d7}
    .eot-cinema-title span{display:flex;align-items:center;justify-content:center;gap:12px;font-size:.65em;line-height:1;margin-top:9px;letter-spacing:.13em;padding-left:.13em}
    .eot-cinema-title em{font-style:normal;font-size:.3em;font-weight:400;letter-spacing:.05em;color:#c8b48d}
    .eot-cinema-tagline{margin:17px 0 0;color:#c9d6de;font-size:11px;letter-spacing:.08em;line-height:1.5}
    .eot-cinema-load{position:absolute;bottom:calc(env(safe-area-inset-bottom,0px) + 50px);left:50%;transform:translateX(-50%);width:min(82%,430px)}
    .eot-cinema-status{display:flex;align-items:center;justify-content:space-between;gap:18px;margin-bottom:15px}
    .eot-cinema-status small{display:block;color:#c3ad82;font-size:8px;letter-spacing:.22em;margin-bottom:7px}
    .eot-cinema-phase{color:#e5ebed;font-size:13px;font-weight:500;line-height:1.4}
    .eot-cinema-percent{font-size:24px;font-weight:300;font-variant-numeric:tabular-nums;color:#ead9b6;letter-spacing:-.03em}
    .eot-cinema-track{height:3px;border-radius:5px;overflow:hidden;background:#cfdbdd26}
    .eot-cinema-fill{height:100%;width:100%;transform:scaleX(0);transform-origin:left;background:linear-gradient(90deg,#599eac,#f2d6a1);box-shadow:0 0 12px #efc98688;transition:transform .18s linear}
    .eot-cinema-caption{margin:13px 0 0;font-size:9px;line-height:1.5;color:#92a6b5;text-align:center;letter-spacing:.045em}
    .eot-cinema-footer{position:absolute;bottom:calc(env(safe-area-inset-bottom,0px) + 18px);left:20px;right:20px;text-align:center;font-size:7px;letter-spacing:.2em;color:#65808f}
    .eot-cinema-spark{position:absolute;left:var(--x);top:var(--y);width:3px;height:3px;background:#f9d49b;border-radius:50%;box-shadow:0 0 10px #ffe3a8;opacity:0;animation:eotCitySpark 6s ease-in-out infinite;animation-delay:var(--delay);pointer-events:none}
    @keyframes eotCitySpark{0%,100%{opacity:0;transform:translateY(10px)}40%{opacity:.7}80%{opacity:0;transform:translateY(-35px)}}
    @media(min-width:760px) and (min-height:600px){.eot-cinema-art{object-fit:contain;object-position:75% center;width:100%;background:#05111e}.eot-cinema-shade{background:linear-gradient(90deg,#031020 0%,#031020ef 24%,#03102044 60%,#03102000 85%),linear-gradient(0deg,#031020aa,transparent 35%)}.eot-cinema-brand{left:9%;top:26%;width:40%;transform:none;text-align:left}.eot-cinema-eyebrow,.eot-cinema-title span{justify-content:flex-start}.eot-cinema-eyebrow::before{display:none}.eot-cinema-title{font-size:clamp(55px,7vw,92px)}.eot-cinema-load{left:9%;width:34%;transform:none;bottom:15%}.eot-cinema-caption{text-align:left}.eot-cinema-footer{text-align:left;left:9%}}
    @media(max-height:700px) and (orientation:portrait){.eot-cinema-brand{top:calc(env(safe-area-inset-top,0px) + 66px)}.eot-cinema-title{font-size:44px}.eot-cinema-eyebrow{margin-bottom:10px;font-size:7px}.eot-cinema-tagline{margin-top:12px;font-size:10px}.eot-cinema-load{bottom:calc(env(safe-area-inset-bottom,0px) + 40px)}}
    @media(max-height:500px) and (orientation:landscape){.eot-cinema-art{object-position:70% 60%}.eot-cinema-shade{background:linear-gradient(90deg,#031020f2,#03102077 55%,#03102011)}.eot-cinema-brand{left:6%;top:24%;width:42%;transform:none;text-align:left}.eot-cinema-title{font-size:43px}.eot-cinema-title span,.eot-cinema-eyebrow{justify-content:flex-start}.eot-cinema-eyebrow::before{display:none}.eot-cinema-tagline{font-size:9px}.eot-cinema-load{left:6%;bottom:calc(env(safe-area-inset-bottom,0px) + 37px);width:40%;transform:none}.eot-cinema-status{margin-bottom:9px}.eot-cinema-caption,.eot-cinema-status small{display:none}.eot-cinema-footer{text-align:left;left:6%}.eot-cinema-top{top:calc(env(safe-area-inset-top,0px) + 12px)}}
    .eot-logo-heading{margin:0;line-height:0}
    .eot-opening-logo{display:block;width:min(52vw,220px);height:auto;margin:0 auto;border-radius:18px}
    .eot-cinema-brand{top:calc(env(safe-area-inset-top,0px) + 62px)}
    .eot-cinema-eyebrow{margin-bottom:10px}
    .eot-cinema-tagline{margin-top:10px}
    @media(min-width:760px) and (min-height:600px){.eot-cinema-brand{top:20%}.eot-opening-logo{width:min(28vw,320px);margin-left:0}}
    @media(max-height:700px) and (orientation:portrait){.eot-opening-logo{width:140px}.eot-cinema-eyebrow{display:none}}
    @media(max-height:500px) and (orientation:landscape){.eot-cinema-brand{top:19%}.eot-opening-logo{width:140px;margin-left:0}.eot-cinema-eyebrow{display:none}.eot-cinema-tagline{margin-top:5px}}
    @media(prefers-reduced-motion:reduce){#eotStartupSplash,.eot-cinema-fill{transition:none}.eot-cinema-spark{animation:none}}
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
      <canvas id="eotAnimatedCity" class="eot-animated-city" aria-hidden="true"></canvas>
      <header class="eot-cinema-top"><b>E / T</b><span>ERKEN ERİŞİM</span></header>
      <div class="eot-cinema-brand">
        <p class="eot-cinema-eyebrow">BİR ŞEHİR. SONSUZ FIRSAT.</p>
        <h1 class="eot-logo-heading"><img class="eot-opening-logo" src="./assets/logo-v220-512.png" alt="Empire of Trade" width="512" height="512" fetchpriority="high"></h1>
        <p class="eot-cinema-tagline">Şehrin canlanıyor. İmparatorluğun başlıyor.</p>
      </div>
      <i class="eot-cinema-spark" style="--x:22%;--y:63%;--delay:0s" aria-hidden="true"></i>
      <i class="eot-cinema-spark" style="--x:72%;--y:48%;--delay:-2s" aria-hidden="true"></i>
      <i class="eot-cinema-spark" style="--x:55%;--y:76%;--delay:-4s" aria-hidden="true"></i>
      <div class="eot-cinema-load" role="status" aria-label="Oyun yükleniyor">
        <div class="eot-cinema-status"><div><small>YENİ BİR HİKÂYE BAŞLIYOR</small><span class="eot-cinema-phase" id="eotSplashPhase">Oyun hazırlanıyor</span></div><span class="eot-cinema-percent" id="eotSplashPercent">%0</span></div>
        <div class="eot-cinema-track" aria-hidden="true"><div class="eot-cinema-fill" id="eotCinemaFill"></div></div>
        <p class="eot-cinema-caption">Her karar bir fırsat. Her yatırım yeni bir başlangıç.</p>
      </div>
      <footer class="eot-cinema-footer">EKONOMİ · TİCARET · STRATEJİ</footer>`;
    document.body.appendChild(el);
    if(window.EOTCityScene)cityScene=window.EOTCityScene.mount(document.getElementById("eotAnimatedCity"));
    requestAnimationFrame(()=>{ if(firstPaintGuard) firstPaintGuard.remove(); });
  }

  function removeSnapshotCover(){
    const el=document.getElementById('eotStartupSnapshotCover');
    if(el)el.remove();
  }

  function paint(v){
    const display=Math.max(0,Math.min(100,Number(v)||0));
    shown=Math.max(shown,display);
    const visible=Math.max(0,Math.min(100,Math.round(shown)));
    if(cityScene)cityScene.progress(shown);
    const fill=document.getElementById('eotCinemaFill');
    if(fill)fill.style.transform='scaleX('+(shown/100)+')';
    const phase=document.getElementById('eotSplashPhase');
    if(phase)phase.textContent=visible>=100?'Başlamaya hazır':'Oyun hazırlanıyor';
    const pct=document.getElementById('eotSplashPercent');

    if(pct)pct.textContent=visible>=100?'Hazır · %100':'%'+visible;
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
          if(el)el.classList.add('eot-splash-out');
          setTimeout(()=>{if(cityScene)cityScene.destroy();el&&el.remove();style.remove();removed=true},460);
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