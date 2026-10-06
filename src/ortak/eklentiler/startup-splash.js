/* Empire of Trade • Küresel ticaret açılışı + render perdesi */
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

  let target=8, shown=0, ready=false, removed=false, finishing=false;

  const style=document.createElement('style');
  style.id='eot-startup-splash-style';
  style.textContent=`
    html.eot-booting,html.eot-booting body{overflow:hidden!important;overscroll-behavior:none!important}
    html.eot-booting,html.eot-booting body,html.eot-booting body.eot-design-v1{background:#040c1b!important}
    html.eot-booting #app-root{visibility:hidden!important}
    #eotStartupSplash{position:fixed;inset:0;min-height:100vh;min-height:100lvh;z-index:2147483646;overflow:hidden;isolation:isolate;background:#050e1c;color:#ecdfc1;font-family:system-ui,sans-serif;opacity:1;transition:opacity .35s ease}
    #eotStartupSplash *{box-sizing:border-box}
    #eotStartupSplash.eot-splash-out{opacity:0;pointer-events:none}
    .eot-atlas-glow{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 5%,#0868c9a8,transparent 55%),radial-gradient(ellipse at 50% 52%,#064ca3,transparent 68%),linear-gradient(#031632,#04112b);pointer-events:none}
    .eot-atlas-grid{position:absolute;inset:0;background:repeating-linear-gradient(45deg,transparent 0 150px,#3b8cf012 151px,transparent 152px 300px),repeating-linear-gradient(-45deg,transparent 0 150px,#3b8cf012 151px,transparent 152px 300px)}
    .eot-atlas-border{position:absolute;left:50%;bottom:9%;width:min(75vw,440px);aspect-ratio:1;transform:translateX(-50%) rotate(45deg);border-right:1px solid #d7ae5366;border-bottom:1px solid #d7ae5366;pointer-events:none}
    .eot-atlas-globe{position:absolute;left:50%;top:14%;transform:translateX(-50%);width:min(92vw,530px,64vh);aspect-ratio:1;border:1px solid #f4ce77aa;border-radius:50%;box-shadow:0 -3px 25px #199dff55,inset 0 15px 36px #047bfd44;overflow:hidden;mask-image:linear-gradient(#000 60%,transparent)}
    .eot-atlas-globe svg{width:100%;height:100%}
    .eot-atlas-globe::after{content:'';position:absolute;inset:0;border-radius:50%;background:linear-gradient(115deg,transparent 30%,#44caff22 48%,transparent 65%);animation:eotGlobeLight 6s ease-in-out infinite alternate}
    .eot-atlas-logo{position:absolute;top:47%;left:50%;transform:translate(-50%,-50%);width:min(92vw,490px,53vh);margin:0;z-index:2}
    .eot-atlas-logo img{position:relative;display:block;width:100%;height:auto;mask-image:radial-gradient(ellipse,#000 57%,#000c 67%,transparent 76%)}
    .eot-atlas-logo::after{content:'';position:absolute;left:20%;right:20%;bottom:9%;height:2px;background:linear-gradient(90deg,transparent,#ffe5a0,transparent);box-shadow:0 0 15px #ffe6a0;animation:eotGlobeLight 3s ease-in-out infinite alternate;pointer-events:none}
    .eot-atlas-loading{position:absolute;left:50%;top:75%;transform:translateX(-50%);width:min(78vw,410px);z-index:3}
    .eot-startup-caption{text-align:center;margin-bottom:24px;color:#fff1bf;font-size:clamp(23px,5vw,32px);font-weight:850;text-shadow:0 2px 0 #9f6518,0 4px 8px #000}
    #eotSplashPercent{display:block;margin-top:8px;font-size:12px;letter-spacing:.12em;font-weight:600;color:#aacbdf;text-shadow:none;font-variant-numeric:tabular-nums}
    .eot-startup-track{height:30px;padding:5px;background:linear-gradient(#ffe8a4,#a96514 40%,#fff0ae 55%,#b77924 90%,#ffeab0);border-radius:30px;box-shadow:0 0 20px #efa91f55,0 7px 18px #0008;position:relative}
    .eot-startup-track::before{content:'';position:absolute;inset:4px;border-radius:24px;background:#00102c;box-shadow:inset 0 2px 5px #000}
    #eotLoadingFill{position:relative;display:block;height:100%;width:calc(var(--progress,0)*100%);border-radius:20px;background:repeating-linear-gradient(125deg,#ffffff00 0 12px,#b9faff40 13px 22px),linear-gradient(#91f5ff,#08b8fa 35%,#0063e9 70%,#1fd7ff);box-shadow:0 0 12px #05caff,inset 0 1px 1px #fff;max-width:100%;min-width:0}
    #eotLoadingFill::after{content:'';position:absolute;right:0;top:15%;height:70%;width:2px;background:#fff8bb;box-shadow:0 0 10px 3px #6aeaff}
    @keyframes eotGlobeLight{from{opacity:.4}to{opacity:1}}
    @media(orientation:landscape) and (max-height:600px){.eot-atlas-logo{left:30%;top:50%;width:65vh}.eot-atlas-globe{left:30%;top:8%;width:80vh}.eot-atlas-loading{left:74%;top:43%;width:38vw}.eot-atlas-border{display:none}}
    @media(prefers-reduced-motion:reduce){#eotStartupSplash,#eotStartupSplash *,#eotStartupSplash *::before{animation:none!important;transition:none!important}}
  `;
  document.head.appendChild(style);
  document.documentElement.classList.add('eot-booting');

  function mount(){
    if(document.getElementById('eotStartupSplash'))return;
    const el=document.createElement('div');
    el.id='eotStartupSplash';
    // Let CSS cover the complete viewport, including the iOS home-indicator area.
    // screen.height can differ from the CSS viewport under display zoom or rotation.
    const globeLines=[-60,-30,0,30,60].map(n=>'<ellipse cx="250" cy="250" rx="'+(240-Math.abs(n)*2)+'" ry="240" fill="none" stroke="#32baff" stroke-opacity=".23"/>').join('');
    const city=[75,120,158,195,240,287,326,365,405].map((x,i)=>{const h=[55,95,70,140,205,125,85,65,45][i];return '<rect x="'+x+'" y="'+(350-h)+'" width="29" height="'+h+'" fill="url(#eotTowerBlue)" stroke="#40b8ff" stroke-opacity=".4"/>';}).join('');
    el.innerHTML=`<div class="eot-atlas-glow" aria-hidden="true"></div><div class="eot-atlas-grid" aria-hidden="true"></div><div class="eot-atlas-border" aria-hidden="true"></div>
      <div class="eot-atlas-globe" aria-hidden="true"><svg viewBox="0 0 500 500"><defs><radialGradient id="eotEarthBlue"><stop stop-color="#084d9b"/><stop offset="1" stop-color="#03214b"/></radialGradient><linearGradient id="eotTowerBlue" x2="1" y2="0"><stop stop-color="#05255c"/><stop offset="1" stop-color="#22a9f3"/></linearGradient></defs><circle cx="250" cy="250" r="240" fill="url(#eotEarthBlue)" stroke="#36c7ff"/>${globeLines}<g fill="none" stroke="#38bcff" stroke-opacity=".25"><ellipse cx="250" cy="250" rx="240" ry="70"/><ellipse cx="250" cy="250" rx="240" ry="150"/><path d="M10 250H490M250 10V490"/></g><path d="M60 310Q320 280 426 85L426 131 453 62 383 92 416 90Q300 260 60 310" fill="#1687d3" stroke="#64c9ff" stroke-opacity=".4"/>${city}</svg></div>
      <h1 class="eot-atlas-logo"><img src="./assets/logo-v221-512.png" alt="Empire of Trade" width="512" height="512" fetchpriority="high"></h1>
      <div class="eot-atlas-loading" role="status" aria-label="Oyun yükleniyor"><div class="eot-startup-caption"><span id="eotSplashPhase">Yükleniyor…</span><span id="eotSplashPercent">%0</span></div><div class="eot-startup-track" aria-hidden="true"><i id="eotLoadingFill"></i></div></div>`;
    document.body.appendChild(el);
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
  }

  function tick(){
    if(removed||finishing)return;
    if(!ready){
      target=Math.min(94,target+(.35+Math.random()*.75));
    }else{
      target=100;
    }
    shown+=(target-shown)*.16;
    paint(shown);
    if(ready&&shown>=97){finish();return}
    requestAnimationFrame(tick);
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