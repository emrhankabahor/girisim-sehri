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
    #eotStartupSplash{background:radial-gradient(ellipse at 50% 0%,#06418a 0%,#032455 36%,#02132f 70%,#010b22 100%)}
    .eot-reference-stage{position:absolute;inset:0;overflow:hidden}
    /* Mask the actual image bounds, not the letterboxed viewport-sized img box. */
    .eot-reference-art{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);display:block;width:min(100%,56.2799vh);height:auto;aspect-ratio:941/1672;mask-image:linear-gradient(transparent 0%,#000 14%,#000 82%,transparent 100%);pointer-events:none}
    .eot-loading-ui{position:absolute;left:50%;top:79%;transform:translateX(-50%);width:min(76vw,420px);text-align:center}
    #eotSplashPhase{display:block;color:#fff1bb;font-size:clamp(23px,5.2vw,32px);font-weight:850;text-shadow:0 2px 1px #a16410,0 4px 6px #00102d;margin-bottom:22px}
    .eot-track-frame{padding:5px;border-radius:999px;background:linear-gradient(#fff1bb,#bd7619 35%,#fff0b2 58%,#a76a16 86%,#ffdd77);box-shadow:0 0 15px #edb43466,0 3px 12px #00102d}
    .eot-startup-track{height:24px;border-radius:999px;overflow:hidden;background:linear-gradient(#020d25,#031c4e 75%,#005280);box-shadow:inset 0 1px 2px #80dfff;isolation:isolate}
    @media(orientation:landscape){.eot-loading-ui{top:auto;bottom:6%;width:min(45vw,350px)}#eotSplashPhase{font-size:20px;margin-bottom:12px}}
    #eotLoadingFill{display:block;height:100%;width:calc(var(--progress,0)*100%);border-radius:999px;background:repeating-linear-gradient(130deg,transparent 0 13px,#b8ffff44 14px 25px),linear-gradient(#91ffff,#00c2ff 25%,#0877f9 65%,#15d6ff);box-shadow:0 0 10px #16e2ff,inset 0 1px 2px #fff;position:relative}
    #eotLoadingFill::after{content:'';position:absolute;right:0;top:5%;height:90%;width:3px;background:#ffffcc;box-shadow:0 0 8px 2px #e5fcff}
    .eot-sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
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
    el.innerHTML=`<div class="eot-reference-stage"><img class="eot-reference-art" src="./assets/splash-brand-v250.jpg" alt="Empire of Trade" width="941" height="1672" fetchpriority="high"><div class="eot-loading-ui" role="status"><span id="eotSplashPhase">Yükleniyor…</span><div class="eot-track-frame"><div class="eot-startup-track" aria-hidden="true"><i id="eotLoadingFill"></i></div></div><span class="eot-sr-only" id="eotSplashPercent">%0</span></div></div>`;
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