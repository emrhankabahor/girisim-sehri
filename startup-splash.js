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
    .eot-metropolis{position:absolute;inset:27% 0 0;pointer-events:none;overflow:hidden}
    .eot-metropolis svg{width:100%;height:100%;display:block;overflow:visible}
    .eot-metropolis::after{content:'';position:absolute;inset:0;background:linear-gradient(#06152f 0%,transparent 24%,transparent 63%,#06152fdd 100%)}
    .eot-building-lights{opacity:.15;animation:eotCityWake 1.8s ease-out var(--delay,0s) both}
    .eot-traffic{fill:none;stroke:#ffe3a1;stroke-width:2;stroke-dasharray:8 450;stroke-linecap:round;animation:eotTraffic 6s linear infinite}
    .eot-traffic.blue{stroke:#80dafa;stroke-width:1.4;animation-duration:8s;animation-direction:reverse}
    .eot-harbor-reflection{opacity:.3;animation:eotHarbor 5s ease-in-out infinite alternate}
    .eot-sky-rays{position:absolute;inset:0;pointer-events:none;background:conic-gradient(from 155deg at 50% 43%,transparent 0deg,#489ac616 13deg,transparent 30deg,#b9994810 48deg,transparent 65deg);opacity:.8}
    @keyframes eotCityWake{from{opacity:.08}to{opacity:.9}}
    @keyframes eotTraffic{to{stroke-dashoffset:-916}}
    @keyframes eotHarbor{from{opacity:.18}to{opacity:.38}}
    .eot-cinema-layout{position:absolute;inset:calc(env(safe-area-inset-top,0px) + 55px) 24px calc(env(safe-area-inset-bottom,0px) + 42px);display:flex;flex-direction:column;align-items:center;justify-content:flex-start;padding-top:clamp(22px,6vh,76px);gap:22px}
    .eot-cinema-emblem{position:relative;width:min(72vw,330px,36vh);aspect-ratio:1;flex:none;margin:0;isolation:isolate}
    .eot-cinema-emblem::before{content:'';position:absolute;inset:-28%;z-index:-1;background:radial-gradient(ellipse,#3295be33,transparent 67%)}
    .eot-logo-window{position:relative;width:100%;height:100%;overflow:hidden;border-radius:22%;box-shadow:0 28px 65px #0007,0 0 55px #2997c518}
    .eot-logo-window img{display:block;width:100%;height:100%;object-fit:contain;animation:eotLogoReveal 1.25s ease-out both}
    .eot-logo-window::after{content:'';position:absolute;inset:-20% -45%;background:linear-gradient(110deg,transparent 42%,#ffe7ac22 48%,#fff4cf66 50%,#8ed9ee15 54%,transparent 60%);transform:translateX(-75%);animation:eotLogoSweep 1.4s ease-out .15s 1 both;pointer-events:none}
    .eot-cinema-wordmark{text-align:center;position:relative}
    .eot-cinema-title{margin:0;font-size:clamp(20px,5.6vw,32px);font-weight:850;line-height:1.2;letter-spacing:.09em;background:linear-gradient(#fffdf8,#ddbd79);-webkit-background-clip:text;background-clip:text;color:#f5e6bd;-webkit-text-fill-color:transparent}
    .eot-cinema-subtitle{margin:12px 0 0;font-size:8px;font-weight:600;letter-spacing:.35em;color:#b79d70}
    .eot-cinema-loading{position:absolute;bottom:24px;width:min(78vw,390px);padding:20px 24px;background:linear-gradient(110deg,#07192ce8,#0b2239e8);border:1px solid #8dc5e125;border-radius:16px;box-shadow:0 12px 35px #0003}
    .eot-loading-line{height:3px;background:#c9ad701c;position:relative;border-radius:4px;overflow:hidden}
    .eot-loading-line i{display:block;width:100%;height:100%;transform:scaleX(var(--progress,0));transform-origin:left;background:linear-gradient(90deg,#987033,#e3bf70,#fff1c1);box-shadow:0 0 12px #eec47780}
    .eot-loading-caption{display:flex;justify-content:space-between;gap:20px;margin-top:15px;font-size:10px;letter-spacing:.04em;color:#91a9bb}
    #eotSplashPercent{font-size:12px;font-weight:600;font-variant-numeric:tabular-nums;color:#dcc28b;min-width:36px;text-align:right}
    .eot-cinema-wordmark{text-shadow:0 3px 20px #06152f}
    .eot-cinema-footer{position:absolute;bottom:calc(env(safe-area-inset-bottom,0px) + 22px);left:20px;right:20px;text-align:center;font-size:7px;letter-spacing:.22em;color:#8196aa80}
    @keyframes eotLogoReveal{from{opacity:.55;filter:brightness(.7)}to{opacity:1;filter:brightness(1)}}
    @keyframes eotLogoSweep{from{transform:translateX(-75%);opacity:0}20%{opacity:1}to{transform:translateX(75%);opacity:0}}
    @media(max-height:650px){.eot-cinema-layout{gap:14px;inset:20px 20px 35px;padding-top:16px}.eot-cinema-emblem{width:min(54vw,32vh)}.eot-cinema-title{font-size:20px}.eot-cinema-loading{bottom:12px;padding:14px 20px}}
    @media(orientation:landscape) and (max-height:600px){.eot-cinema-layout{display:grid;grid-template-columns:min(40vh,220px) minmax(180px,320px);grid-template-rows:1fr 1fr;align-content:center;gap:22px 50px}.eot-cinema-emblem{grid-row:1/3;width:100%}.eot-cinema-wordmark{align-self:end}.eot-cinema-loading{position:relative;bottom:auto;align-self:start;width:100%;margin-top:0}.eot-cinema-title{font-size:22px}}
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
    // Lightweight vector city: each tower has a facade, side plane and lit windows.
    const towers=[[20,290,70,165],[108,245,60,210],[190,310,85,145],[300,175,72,280],[395,265,64,190],[490,220,60,235],[581,115,82,340],[701,195,70,260],[806,280,78,175],[920,155,68,300],[1020,235,72,220],[1120,290,85,165],[1245,195,65,260],[1340,275,74,180]];
    const city=towers.map(([x,y,w,h],i)=>{
      let windows='';
      for(let row=0;row<Math.floor((h-25)/16);row++)for(let col=0;col<Math.floor((w-18)/12);col++){
        if((row*7+col*3+i)%5!==0)windows+='<rect x="'+(x+10+col*12)+'" y="'+(y+16+row*16)+'" width="4" height="6" fill="'+((i+col)%3?'#75b9d5':'#e9c47e')+'"/>';
      }
      return '<g><path d="M'+x+' '+y+'l'+w+' -18v'+h+'l-'+w+' 18Z" fill="url(#eotTowerFace)" stroke="#488bac55"/><path d="M'+(x+w)+' '+(y-18)+'l18 12v'+h+'l-18 -12Z" fill="#0a243b" stroke="#326c8c44"/><path d="M'+x+' '+y+'l'+w+' -18 18 12-'+w+' 18Z" fill="#305c76"/><g class="eot-building-lights" style="--delay:'+((i%5)*.18)+'s">'+windows+'</g></g>';
    }).join('');
    el.innerHTML=`
      <div class="eot-atmosphere" aria-hidden="true"></div><div class="eot-sky-rays" aria-hidden="true"></div>
      <div class="eot-metropolis" aria-hidden="true"><svg viewBox="0 0 1440 720" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="eotTowerFace" x2="1" y2="1"><stop stop-color="#245c80"/><stop offset="1" stop-color="#102e48"/></linearGradient>
          <linearGradient id="eotWater" x2="0" y2="1"><stop stop-color="#21729a" stop-opacity=".6"/><stop offset="1" stop-color="#06152f"/></linearGradient>
          <radialGradient id="eotCityGlow"><stop stop-color="#3b98b4" stop-opacity=".35"/><stop offset="1" stop-color="#06152f" stop-opacity="0"/></radialGradient>
        </defs>
        <ellipse cx="720" cy="300" rx="750" ry="270" fill="url(#eotCityGlow)"/>
        <path d="M0 400V270h100v-80h70v210h45V240h100v160h90V135h90v265h55V250h125v150h55V180h100v220h100V230h120v170h60V140h80v260h120V250h120v150h110V220h110v180Z" fill="#17415e" opacity=".45"/>
        ${city}
        <path d="M0 465Q450 400 720 470T1440 465V720H0Z" fill="url(#eotWater)"/>
        <g class="eot-harbor-reflection" stroke="#64b6ce" stroke-width="2"><path d="M540 510h260m-310 15h180m70 0h140m-370 15h300m-260 17h350m-290 20h200m-260 22h300m-210 22h130"/></g>
        <path d="M-40 530Q350 390 750 500T1480 520" fill="none" stroke="#06162b" stroke-width="42"/>
        <path d="M-40 530Q350 390 750 500T1480 520" fill="none" stroke="#8dabb842" stroke-width="44"/>
        <path d="M-40 530Q350 390 750 500T1480 520" fill="none" stroke="#0b2339" stroke-width="38"/>
        <path d="M-40 530Q350 390 750 500T1480 520" fill="none" stroke="#e0c28b66" stroke-dasharray="10 16"/>
        <path class="eot-traffic" d="M-40 523Q350 383 750 493T1480 513"/><path class="eot-traffic blue" d="M-40 538Q350 398 750 508T1480 528"/>
        <g stroke="#8bbbd077" fill="none"><path d="M190 490V290m-5 0h10M1070 530V310m-5 0h10" stroke-width="5"/><path d="M-50 505Q80 465 190 292Q600 575 1070 312Q1230 490 1490 520" stroke-width="2"/><path d="M270 340V470M360 382V457M455 419V460M550 443V466M650 455V481M760 450V500M865 422V517M965 376V531"/></g>
        <path d="M0 645 220 580 400 605 620 550 860 615 1090 575 1440 640V720H0Z" fill="#07182b"/>
        <path d="M0 646 220 581 400 606 620 551 860 616 1090 576 1440 641" fill="none" stroke="#8eb2bd22"/>
      </svg></div>
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