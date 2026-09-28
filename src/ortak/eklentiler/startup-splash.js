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
    #eotStartupSplash{position:fixed;inset:0;width:100%;height:100vh;height:100lvh;box-sizing:border-box;isolation:isolate;overflow:hidden;z-index:2147483646;background:#06152f;color:#fff8e8;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;opacity:1;transition:opacity .42s ease}
    .eot-animated-city{position:absolute;inset:0;width:100%;height:100%;background:radial-gradient(ellipse at 50% 55%,#123d78,#06152f 65%)}
    #eotStartupSplash *{box-sizing:border-box}
    #eotStartupSplash.eot-splash-out{opacity:0;pointer-events:none}
    .eot-cinema-top{position:absolute;top:calc(env(safe-area-inset-top,0px) + 22px);left:25px;right:25px;display:flex;justify-content:space-between;align-items:center;font-size:8px;letter-spacing:.2em;color:#d3dce0}
    .eot-cinema-top b{font-weight:600;color:#ffd34f;letter-spacing:.22em}
    .eot-cinema-top span{border:1px solid #bac5cc33;border-radius:20px;padding:6px 9px;background:#06142344}
    .eot-cinema-brand{position:absolute;top:calc(env(safe-area-inset-top,0px) + 84px);left:50%;transform:translateX(-50%);width:min(90%,550px);text-align:center;text-shadow:0 3px 24px #0009}
    .eot-cinema-eyebrow{display:flex;align-items:center;justify-content:center;gap:13px;color:#ffd34f;font-size:8px;font-weight:600;letter-spacing:.25em;margin:0 0 16px}
    .eot-cinema-eyebrow::before,.eot-cinema-eyebrow::after{content:'';height:1px;width:28px;background:#d0b57c88}
    .eot-cinema-title{margin:0;font-family:Georgia,"Times New Roman",serif;font-size:clamp(45px,13.5vw,76px);line-height:.92;font-weight:700;letter-spacing:.035em;color:#fff4d7}
    .eot-cinema-title span{display:flex;align-items:center;justify-content:center;gap:12px;font-size:.65em;line-height:1;margin-top:9px;letter-spacing:.13em;padding-left:.13em}
    .eot-cinema-title em{font-style:normal;font-size:.3em;font-weight:400;letter-spacing:.05em;color:#c8b48d}
    .eot-cinema-tagline{margin:17px 0 0;color:#c9d6de;font-size:11px;letter-spacing:.08em;line-height:1.5}
    .eot-cinema-load{position:absolute;bottom:calc(env(safe-area-inset-bottom,0px) + 50px);left:50%;transform:translateX(-50%);width:min(82%,430px)}
    .eot-cinema-status{display:flex;align-items:center;justify-content:space-between;gap:18px;margin-bottom:15px}
    .eot-cinema-status small{display:block;color:#c3ad82;font-size:8px;letter-spacing:.22em;margin-bottom:7px}
    .eot-cinema-phase{color:#e5ebed;font-size:13px;font-weight:500;line-height:1.4}
    .eot-cinema-percent{font-size:24px;font-weight:300;font-variant-numeric:tabular-nums;color:#ffd34f;letter-spacing:-.03em}
    .eot-cinema-track{height:3px;border-radius:5px;overflow:hidden;background:#cfdbdd26}
    .eot-cinema-fill{height:100%;width:100%;transform:scaleX(0);transform-origin:left;background:linear-gradient(90deg,#32caff,#ffd34f);box-shadow:0 0 12px #efc98688;transition:transform .18s linear}
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
    /* Observatory composition: fixed typography, living city, architectural progress. */
    .eot-animated-city{background:radial-gradient(ellipse at 50% 57%,#153f72 0%,#091c3a 42%,#06152f 75%)}
    #eotStartupSplash::before{content:'';position:absolute;inset:0;pointer-events:none;background:linear-gradient(115deg,transparent 35%,#57caff08 50%,transparent 65%);z-index:1}
    .eot-cinema-top{top:calc(env(safe-area-inset-top,0px) + 20px);font-size:8px;align-items:center}
    .eot-cinema-top b{letter-spacing:.14em;color:#bed8ef}
    .eot-cinema-top span{color:#ffe5a0;background:#ffcf5010;border-color:#ffcf5033;letter-spacing:.12em}
    .eot-cinema-brand{top:calc(env(safe-area-inset-top,0px) + 68px);z-index:2}
    .eot-opening-logo{width:clamp(132px,23vh,195px);border-radius:22px;filter:drop-shadow(0 12px 32px #0005)}
    .eot-cinema-eyebrow{font-size:8px;letter-spacing:.22em;color:#99bddb}
    .eot-cinema-tagline{font-size:12px;font-weight:500;letter-spacing:.025em;color:#deecfa;margin-top:12px}
    .eot-cinema-load{z-index:2;width:min(84%,420px);bottom:calc(env(safe-area-inset-bottom,0px) + 45px)}
    .eot-cinema-status{margin-bottom:16px;align-items:flex-end}
    .eot-cinema-status small{color:#7ca8c7;letter-spacing:.17em}
    .eot-cinema-phase{font-size:15px;font-weight:600}
    .eot-cinema-percent{font-size:30px;font-weight:700;min-width:96px;text-align:right;color:#ffdb77}
    .eot-cinema-track{position:relative;height:38px;border-radius:0;background:none;overflow:visible;border-bottom:1px solid #6bcfff44;display:flex;gap:4px;align-items:flex-end}
    .eot-cinema-track i{position:relative;flex:1;height:var(--height);border:1px solid #5a91ba44;border-bottom:0;border-radius:2px 2px 0 0;background:#193a55;overflow:hidden}
    .eot-cinema-track i::after{content:'';position:absolute;inset:0;background:linear-gradient(0deg,#187db8,#6ee1fa);transform:scaleY(var(--built,0));transform-origin:bottom;transition:transform .25s linear;box-shadow:inset 0 1px #bdf5ff}
    .eot-cinema-track i:nth-child(4n)::after{background:linear-gradient(0deg,#cf9536,#ffe69b)}
    .eot-cinema-fill{display:none}
    .eot-cinema-sectors{display:flex;justify-content:space-between;gap:8px;margin-top:12px;color:#617f9d;font-size:8px;font-weight:700;letter-spacing:.1em}
    .eot-cinema-sectors span{transition:color .3s}
    .eot-cinema-sectors span.active{color:#e7cd8e}
    .eot-cinema-caption{font-size:10px;color:#88a6be;margin-top:16px;letter-spacing:0}
    .eot-cinema-footer{font-size:7px;letter-spacing:.22em;color:#55718f}
    @media(min-width:760px) and (min-height:600px){.eot-cinema-brand{top:20%;left:8%;width:34%;text-align:left}.eot-opening-logo{width:clamp(180px,24vw,290px);margin:0}.eot-cinema-load{left:8%;width:33%;bottom:17%}.eot-cinema-tagline{max-width:300px;font-size:15px}.eot-cinema-top{left:8%;right:8%}.eot-cinema-footer{left:8%}}
    @media(max-height:700px) and (orientation:portrait){.eot-cinema-brand{top:calc(env(safe-area-inset-top,0px) + 54px)}.eot-opening-logo{width:125px}.eot-cinema-tagline{font-size:10px;margin-top:7px}.eot-cinema-caption{display:none}.eot-cinema-load{bottom:calc(env(safe-area-inset-bottom,0px) + 36px)}.eot-cinema-status{margin-bottom:8px}.eot-cinema-status small{display:none}}
    @media(max-height:500px) and (orientation:landscape){.eot-cinema-brand{top:18%;left:6%;width:37%}.eot-opening-logo{width:110px;margin:0}.eot-cinema-tagline{font-size:10px}.eot-cinema-load{left:6%;width:37%;bottom:calc(env(safe-area-inset-bottom,0px) + 30px)}.eot-cinema-track{height:23px}.eot-cinema-sectors{margin-top:6px;font-size:7px}.eot-cinema-phase{font-size:12px}.eot-cinema-percent{font-size:22px}}
    @media(prefers-reduced-motion:reduce){#eotStartupSplash,.eot-cinema-fill,.eot-cinema-track i::after,.eot-cinema-sectors span{transition:none}.eot-cinema-spark{animation:none}}
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
      <header class="eot-cinema-top"><b>EMPIRE OF TRADE</b><span>GELİŞTİRME SÜRÜMÜ</span></header>
      <div class="eot-cinema-brand">
        <p class="eot-cinema-eyebrow">KÜÇÜK BİR ADIM. BÜYÜK BİR İMPARATORLUK.</p>
        <h1 class="eot-logo-heading"><img class="eot-opening-logo" src="./assets/logo-v221-512.png" alt="Empire of Trade" width="512" height="512" fetchpriority="high"></h1>
        <p class="eot-cinema-tagline">Bir şehrin geleceği, senin kararların.</p>
      </div>
      <i class="eot-cinema-spark" style="--x:22%;--y:63%;--delay:0s" aria-hidden="true"></i>
      <i class="eot-cinema-spark" style="--x:72%;--y:48%;--delay:-2s" aria-hidden="true"></i>
      <i class="eot-cinema-spark" style="--x:55%;--y:76%;--delay:-4s" aria-hidden="true"></i>
      <div class="eot-cinema-load" role="status" aria-label="Oyun yükleniyor">
        <div class="eot-cinema-status"><div><small>YENİ BİR HİKÂYE BAŞLIYOR</small><span class="eot-cinema-phase" id="eotSplashPhase">Oyun hazırlanıyor</span></div><span class="eot-cinema-percent" id="eotSplashPercent">%0</span></div>
        <div class="eot-cinema-track" aria-hidden="true">${[32,48,38,67,52,80,63,100,74,88,59,78,46,64,39,53].map(h=>'<i style="--height:'+h+'%"></i>').join('')}<div class="eot-cinema-fill" id="eotCinemaFill"></div></div>
        <div class="eot-cinema-sectors" aria-hidden="true"><span>ARSA</span><span>GALERİ</span><span>İŞLETMELER</span><span>FİNANS</span></div>
        <p class="eot-cinema-caption">Her karar bir fırsat. Her yatırım yeni bir başlangıç.</p>
      </div>
      <footer class="eot-cinema-footer">EKONOMİ · TİCARET · STRATEJİ</footer>`;
    document.body.appendChild(el);
    if(window.EOTCityScene)cityScene=window.EOTCityScene.mount(document.getElementById("eotAnimatedCity"));
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
    if(cityScene)cityScene.progress(shown);
    const fill=document.getElementById('eotCinemaFill');
    if(fill)fill.style.transform='scaleX('+(shown/100)+')';
    const phase=document.getElementById('eotSplashPhase');
    if(phase)phase.textContent=visible>=100?'İmparatorluğun hazır':visible>=70?'Son hazırlıklar yapılıyor':visible>=35?'Ticaret şehri canlanıyor':'Şehrin temelleri atılıyor';
    document.querySelectorAll('.eot-cinema-track i').forEach((bar,i)=>bar.style.setProperty('--built',String(Math.max(0,Math.min(1,(shown-i*5.5)/17.5)))));
    document.querySelectorAll('.eot-cinema-sectors span').forEach((item,i)=>item.classList.toggle('active',shown>i*25));
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