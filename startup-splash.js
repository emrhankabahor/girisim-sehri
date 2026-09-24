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
    #eotStartupSplash{position:fixed;inset:0;width:100%;height:100vh;height:100lvh;box-sizing:border-box;isolation:isolate;overflow:hidden;z-index:2147483646;background:#050d16;color:#eef3f3;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;opacity:1;transition:opacity .42s ease}
    #eotStartupSplash *{box-sizing:border-box}
    #eotStartupSplash.eot-splash-out{opacity:0;pointer-events:none}
    .eot-opening-atmosphere{position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse at 78% 28%,#18586042,transparent 48%),radial-gradient(ellipse at 0 85%,#142c444d,transparent 50%),linear-gradient(140deg,#081722,#040b13 70%)}
    .eot-opening-atmosphere::after{content:'';position:absolute;width:85vmax;height:85vmax;left:28%;top:-42%;border:1px solid #98c6cc0b;border-radius:50%;box-shadow:0 0 0 70px #98c6cc03,0 0 0 140px #98c6cc03}
    .eot-opening-top{position:absolute;top:calc(env(safe-area-inset-top,0px) + 25px);left:max(26px,env(safe-area-inset-left,0px));right:max(26px,env(safe-area-inset-right,0px));display:flex;align-items:center;justify-content:space-between;font-size:9px;letter-spacing:.17em;color:#8496a2}
    .eot-opening-signature{display:flex;align-items:center;gap:9px;color:#c7d9de;font-size:11px;font-weight:650;letter-spacing:.12em}
    .eot-opening-signature i{display:block;width:5px;height:5px;background:#cfb98a;transform:rotate(45deg)}
    .eot-opening-main{position:absolute;top:48%;left:50%;transform:translate(-50%,-50%);width:min(82%,400px)}
    .eot-opening-emblem{width:190px;height:190px;display:block;margin:0 auto 33px;overflow:visible}
    .eot-opening-ring{transform:rotate(-90deg);transform-origin:120px 120px;stroke-dasharray:100;stroke-dashoffset:100;transition:stroke-dashoffset .18s linear}
    .eot-opening-light{animation:eotOpeningLight 4s ease-in-out infinite}
    @keyframes eotOpeningLight{0%,100%{opacity:.35}50%{opacity:.8}}
    .eot-opening-title{margin:0;font-size:clamp(42px,12vw,64px);line-height:.98;letter-spacing:-.055em;font-weight:760;color:#f0f5f4}
    .eot-opening-title span{display:flex;gap:12px;align-items:center;margin-top:9px;font-size:.79em;font-weight:300;letter-spacing:.03em;color:#c4d4d9}
    .eot-opening-title em{font-style:normal;font-size:.24em;letter-spacing:.04em;color:#d1bb8c;font-weight:500}
    .eot-opening-tagline{margin:21px 0 0;color:#869daa;font-size:12px;line-height:1.65;letter-spacing:.035em}
    .eot-opening-status{margin-top:34px;padding-top:17px;border-top:1px solid #8ba7b222;display:flex;align-items:center;justify-content:space-between;gap:15px}
    .eot-opening-status-label{display:flex;align-items:center;gap:9px;color:#a9c0ca;font-size:11px}
    .eot-opening-status-label::before{content:'';width:5px;height:5px;border-radius:50%;background:#88c9c5;box-shadow:0 0 10px #88c9c544}
    .eot-opening-percent{color:#d4be93;font-size:13px;font-variant-numeric:tabular-nums;letter-spacing:.04em}
    .eot-opening-bottom{position:absolute;bottom:calc(env(safe-area-inset-bottom,0px) + 27px);left:24px;right:24px;text-align:center;color:#536e7e;font-size:8px;letter-spacing:.22em}
    @media(min-width:760px){.eot-opening-main{width:400px}.eot-opening-top{left:42px;right:42px}}
    @media(max-height:700px){.eot-opening-emblem{width:145px;height:145px;margin-bottom:24px}.eot-opening-title{font-size:46px}.eot-opening-status{margin-top:24px}.eot-opening-tagline{margin-top:15px}}
    @media(max-height:540px) and (orientation:portrait){.eot-opening-emblem{width:100px;height:100px;margin-bottom:16px}.eot-opening-title{font-size:36px}.eot-opening-main{width:72%}.eot-opening-tagline{margin-top:12px;font-size:10px}.eot-opening-status{margin-top:15px;padding-top:12px}}
    @media(max-height:500px) and (orientation:landscape){.eot-opening-main{width:min(82%,660px);display:grid;grid-template-columns:180px minmax(0,1fr);column-gap:42px;align-items:center}.eot-opening-emblem{grid-row:1/4;width:170px;height:170px;margin:0}.eot-opening-title{font-size:44px}.eot-opening-tagline{margin-top:12px}.eot-opening-status{margin-top:22px}.eot-opening-top{top:calc(env(safe-area-inset-top,0px) + 16px)}.eot-opening-bottom{bottom:calc(env(safe-area-inset-bottom,0px) + 15px)}}
    @media(prefers-reduced-motion:reduce){#eotStartupSplash,.eot-opening-ring{transition:none}.eot-opening-light{animation:none}}
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
      <div class="eot-opening-atmosphere" aria-hidden="true"></div>
      <header class="eot-opening-top"><span class="eot-opening-signature"><i></i>E / T</span><span>ERKEN ERİŞİM</span></header>
      <main class="eot-opening-main">
        <svg class="eot-opening-emblem" viewBox="0 0 240 240" aria-hidden="true">
          <defs>
            <linearGradient id="eotOpeningMetal" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#e9debd"/><stop offset=".5" stop-color="#bba77d"/><stop offset="1" stop-color="#827251"/></linearGradient>
            <linearGradient id="eotOpeningGlass" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#8bced0"/><stop offset="1" stop-color="#2a677a"/></linearGradient>
            <radialGradient id="eotOpeningHalo"><stop stop-color="#528c9b" stop-opacity=".22"/><stop offset="1" stop-color="#528c9b" stop-opacity="0"/></radialGradient>
          </defs>
          <circle class="eot-opening-light" cx="120" cy="120" r="105" fill="url(#eotOpeningHalo)"/>
          <circle cx="120" cy="120" r="103" fill="none" stroke="#607f8c" stroke-opacity=".15" stroke-width=".7"/>
          <circle id="eotOpeningRing" class="eot-opening-ring" cx="120" cy="120" r="103" pathLength="100" fill="none" stroke="#cdb98e" stroke-width="1.5" stroke-linecap="round"/>
          <path d="M120 36 197 80V164L120 208 43 164V80Z" fill="#0b202d" fill-opacity=".7" stroke="#54808e" stroke-opacity=".28"/>
          <path d="M120 36V208M43 80 120 124 197 80M43 164 120 124 197 164" fill="none" stroke="#628999" stroke-opacity=".12"/>
          <path d="M70 91 118 64 168 93 120 121Z" fill="url(#eotOpeningMetal)"/>
          <path d="M70 91V105L120 134V121Z" fill="#796849"/><path d="M120 121 168 93V107L120 134Z" fill="#b29c71"/>
          <path d="M70 120 87 110 120 129 153 110 170 120 120 149Z" fill="url(#eotOpeningGlass)"/>
          <path d="M70 120V134L120 163V149Z" fill="#285366"/><path d="M120 149 170 120V134L120 163Z" fill="#4f929f"/>
          <path d="M70 150 87 140 120 159 153 140 170 150 120 179Z" fill="url(#eotOpeningMetal)"/>
          <path d="M70 150V159L120 188V179Z" fill="#796849"/><path d="M120 179 170 150V159L120 188Z" fill="#b29c71"/>
          <path d="M75 89 118 65 164 92M74 149 87 141M124 178 166 153" stroke="#eee1bc" stroke-width=".8" fill="none" opacity=".65"/>
        </svg>
        <h1 class="eot-opening-title">EMPIRE<span><em>OF</em> TRADE</span></h1>
        <p class="eot-opening-tagline">Vizyonunla başla. Kararlarınla büyü.</p>
        <div class="eot-opening-status" role="status" aria-label="Oyun yükleniyor"><span class="eot-opening-status-label" id="eotSplashPhase">Oyun hazırlanıyor</span><span class="eot-opening-percent" id="eotSplashPercent">%0</span></div>
      </main>
      <footer class="eot-opening-bottom">EKONOMİ · TİCARET · STRATEJİ</footer>`;
    document.body.appendChild(el);
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
    const ring=document.getElementById('eotOpeningRing');
    if(ring)ring.style.strokeDashoffset=String(100-shown);
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