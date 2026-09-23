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
    #eotStartupSplash{position:fixed;top:0;left:0;width:100%;height:100vh;height:100lvh;box-sizing:border-box;isolation:isolate;overflow:hidden;z-index:2147483646;background:#02070d;color:#edf5fa;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;opacity:1;transition:opacity .42s ease}
    #eotStartupSplash *{box-sizing:border-box}
    #eotStartupSplash.eot-splash-out{opacity:0;pointer-events:none}
    .eot-splash-glow{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 35%,rgba(25,108,133,.22),transparent 53%),linear-gradient(180deg,#06121d00 65%,#02070d);pointer-events:none}
    .eot-splash-grid{position:absolute;inset:0;opacity:.15;background-image:linear-gradient(rgba(88,173,189,.15) 1px,transparent 1px),linear-gradient(90deg,rgba(88,173,189,.15) 1px,transparent 1px);background-size:56px 56px;mask-image:linear-gradient(transparent,black 35%,transparent 80%);pointer-events:none}
    .eot-splash-top{position:absolute;top:calc(env(safe-area-inset-top,0px) + 26px);left:28px;right:28px;display:flex;align-items:center;justify-content:space-between;color:#8598a8;font-size:9px;letter-spacing:.2em;font-weight:600}
    .eot-splash-edition{display:flex;align-items:center;gap:7px;color:#b4c4ce;letter-spacing:.12em}
    .eot-splash-edition::before{content:'';width:5px;height:5px;border-radius:50%;background:#d4b77b;box-shadow:0 0 12px #d4b77b55}
    .eot-splash-inner{position:absolute;top:44%;left:50%;transform:translate(-50%,-50%);width:min(86%,430px);text-align:center}
    .eot-splash-stage{position:relative;width:190px;height:170px;margin:0 auto 22px;display:grid;place-items:center}
    .eot-splash-orbit{position:absolute;width:166px;height:166px;border:1px solid rgba(112,181,195,.13);border-radius:50%}
    .eot-splash-orbit::before,.eot-splash-orbit::after{content:'';position:absolute;left:50%;top:-3px;width:5px;height:5px;background:#d4b77b;border-radius:50%;box-shadow:0 0 12px #d4b77b77}
    .eot-splash-orbit::after{top:auto;bottom:-3px;background:#55bbc8;box-shadow:0 0 12px #55bbc877}
    .eot-splash-logo{position:relative;width:106px;height:106px;border-radius:27px;background:url('./apple-touch-icon.png?v=190') center/cover no-repeat;box-shadow:0 20px 50px #0009,0 0 54px #2594b51c;outline:1px solid #97d4df20;outline-offset:7px}
    .eot-splash-eyebrow{margin:0 0 15px;color:#d4b77b;font-size:9px;letter-spacing:.32em;font-weight:600}
    .eot-splash-brand{margin:0;color:#f3f7fa;font-size:clamp(32px,9vw,46px);line-height:1.06;font-weight:800;letter-spacing:.015em}
    .eot-splash-brand span{display:block;font-size:.51em;letter-spacing:.28em;font-weight:400;color:#a6bfcc;margin:10px 0 0;padding-left:.28em}
    .eot-splash-tagline{margin:24px 0 0;font-size:13px;line-height:1.65;font-weight:400;color:#8ea6b6}
    .eot-splash-sectors{display:flex;justify-content:center;gap:13px;align-items:center;margin-top:24px;font-size:8px;letter-spacing:.16em;color:#5e7d90}
    .eot-splash-sectors i{height:3px;width:3px;background:#997f4c;border-radius:50%}
    .eot-splash-city{position:absolute;width:100%;height:23%;bottom:16%;left:0;opacity:.38;pointer-events:none}
    .eot-splash-progress-wrap{position:absolute;bottom:calc(env(safe-area-inset-bottom,0px) + 65px);left:50%;transform:translateX(-50%);width:min(82%,390px)}
    .eot-splash-progress-head{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:13px;font-size:10px;color:#c5d4dc}
    .eot-splash-progress-head>span:first-child{letter-spacing:.07em}
    .eot-splash-percent{font-variant-numeric:tabular-nums;color:#d4b77b;font-size:10px;white-space:nowrap}
    .eot-splash-track{height:3px;background:#16303c;border-radius:4px;overflow:hidden}
    .eot-splash-fill{height:100%;width:0%;border-radius:inherit;background:linear-gradient(90deg,#3a9faa,#78d6cd,#d4b77b);transition:width .16s linear}
    .eot-splash-caption{margin-top:12px;text-align:left;color:#607f91;font-size:9px;line-height:1.6}
    .eot-splash-footer{position:absolute;bottom:calc(env(safe-area-inset-bottom,0px) + 24px);left:0;right:0;text-align:center;color:#446070;font-size:8px;letter-spacing:.2em}
    @media(min-width:760px){.eot-splash-top{left:48px;right:48px}.eot-splash-city{width:70%;left:15%;height:30%}.eot-splash-brand{font-size:52px}}
    @media(max-height:660px){.eot-splash-inner{top:41%}.eot-splash-stage{height:115px;margin-bottom:14px}.eot-splash-logo{width:76px;height:76px;border-radius:20px}.eot-splash-orbit{width:112px;height:112px}.eot-splash-brand{font-size:30px}.eot-splash-tagline{margin-top:14px}.eot-splash-sectors{margin-top:14px}.eot-splash-progress-wrap{bottom:calc(env(safe-area-inset-bottom,0px) + 52px)}}
    @media(max-height:480px) and (orientation:landscape){.eot-splash-inner{left:30%;top:50%;width:48%}.eot-splash-stage{height:90px;margin-bottom:10px}.eot-splash-orbit{width:90px;height:90px}.eot-splash-logo{width:64px;height:64px;border-radius:17px}.eot-splash-eyebrow,.eot-splash-sectors,.eot-splash-tagline{display:none}.eot-splash-brand{font-size:28px}.eot-splash-progress-wrap{left:76%;width:34%;bottom:40%}.eot-splash-city{opacity:.18}}
    @media(prefers-reduced-motion:reduce){#eotStartupSplash,.eot-splash-fill{transition:none}}
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
      <div class="eot-splash-glow" aria-hidden="true"></div><div class="eot-splash-grid" aria-hidden="true"></div>
      <div class="eot-splash-top"><span>EMPIRE OF TRADE</span><span class="eot-splash-edition">ERKEN ERİŞİM</span></div>
      <svg class="eot-splash-city" viewBox="0 0 600 180" preserveAspectRatio="xMidYMax meet" fill="none" aria-hidden="true">
        <path d="M0 179H600M15 179V130H50V179M57 179V105H93V179M101 179V139H130V179M139 179V76H171V179M177 179V92H212V179M223 179V49H266V179M235 49V33H254V49M276 179V20H312V179M288 20V0M320 179V65H360V179M367 179V109H402V179M410 179V83H449V179M459 179V128H495V179M502 179V101H536V179M543 179V142H581V179" fill="#0b2430" stroke="#2d5b6b" stroke-width="1"/>
        <path d="M148 88H162M148 99H162M148 110H162M232 63H257M232 77H257M232 91H257M285 36H303M285 49H303M285 62H303M285 75H303M329 79H351M329 92H351M329 105H351M419 98H440M419 111H440M66 119H84M66 132H84M512 116H526" stroke="#58918b" stroke-width="2" opacity=".5"/>
      </svg>
      <div class="eot-splash-inner">
        <div class="eot-splash-stage" aria-hidden="true"><span class="eot-splash-orbit"></span><div class="eot-splash-logo"></div></div>
        <p class="eot-splash-eyebrow">BÜYÜK HİKÂYELER KÜÇÜK BAŞLAR</p>
        <h1 class="eot-splash-brand">EMPIRE<span>OF TRADE</span></h1>
        <p class="eot-splash-tagline">İlk yatırımından kendi imparatorluğuna.</p>
        <div class="eot-splash-sectors"><span>ARSA</span><i></i><span>GALERİ</span><i></i><span>İŞLETME</span></div>
      </div>
      <div class="eot-splash-progress-wrap" role="status" aria-label="Oyun yükleniyor">
        <div class="eot-splash-progress-head"><span>Yeni bir hikâye başlıyor</span><span class="eot-splash-percent" id="eotSplashPercent">%0</span></div>
        <div class="eot-splash-track"><div class="eot-splash-fill" id="eotSplashFill"></div></div>
        <div class="eot-splash-caption">Kariyer ve piyasa verileri hazırlanıyor.</div>
      </div>
      <div class="eot-splash-footer">EKONOMİ · TİCARET · STRATEJİ &nbsp; / &nbsp; 209</div>`;
    document.body.appendChild(el);
    requestAnimationFrame(()=>{ if(firstPaintGuard) firstPaintGuard.remove(); });
  }

  function removeSnapshotCover(){
    const el=document.getElementById('eotStartupSnapshotCover');
    if(el)el.remove();
  }

  function paint(v){
    const display=Math.max(0,Math.min(100,Math.round(Number(v)||0)));
    shown=Math.max(Math.round(shown),display);
    const visible=Math.max(0,Math.min(100,Math.round(shown)));
    const fill=document.getElementById('eotSplashFill');
    const pct=document.getElementById('eotSplashPercent');
    if(fill)fill.style.width=visible+'%';
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