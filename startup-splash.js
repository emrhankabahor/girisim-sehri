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
    .eot-splash-glow{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 42%,#15334066,transparent 60%);pointer-events:none}
    .eot-splash-inner{position:absolute;top:44%;left:50%;transform:translate(-50%,-50%);width:min(86%,430px);text-align:center}
    .eot-splash-stage{margin:0 auto 30px;display:grid;place-items:center}
    .eot-splash-logo{width:88px;height:88px;border-radius:23px;background:url('./apple-touch-icon.png?v=190') center/cover no-repeat;box-shadow:0 12px 32px #0005}
    .eot-splash-brand{margin:0;color:#f3f7fa;font-size:clamp(24px,6.5vw,34px);line-height:1.2;font-weight:700;letter-spacing:.035em}
    .eot-splash-brand span{display:block;margin-top:7px;font-size:.65em;font-weight:400;letter-spacing:.24em;padding-left:.24em;color:#9bb8c5}
    .eot-splash-progress-wrap{position:absolute;bottom:calc(env(safe-area-inset-bottom,0px) + 72px);left:50%;transform:translateX(-50%);width:min(70%,280px)}
    .eot-splash-progress-head{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:12px;font-size:11px;color:#94aab8}
    .eot-splash-percent{font-variant-numeric:tabular-nums;white-space:nowrap;color:#b4d7d9}
    .eot-splash-track{height:3px;background:#172a35;border-radius:4px;overflow:hidden}
    .eot-splash-fill{height:100%;width:0%;border-radius:inherit;background:#79c9cc;transition:width .16s linear}
    .eot-splash-footer{position:absolute;bottom:calc(env(safe-area-inset-bottom,0px) + 28px);left:0;right:0;text-align:center;color:#657e8e;font-size:9px;letter-spacing:.16em}
    @media(max-height:550px){.eot-splash-logo{width:64px;height:64px;border-radius:17px}.eot-splash-stage{margin-bottom:18px}.eot-splash-brand{font-size:24px}.eot-splash-inner{top:40%}.eot-splash-progress-wrap{bottom:calc(env(safe-area-inset-bottom,0px) + 58px)}}
    @media(max-height:380px) and (orientation:landscape){.eot-splash-inner{left:30%;top:48%;width:48%}.eot-splash-progress-wrap{left:76%;width:30%;bottom:43%}}
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
      <div class="eot-splash-glow" aria-hidden="true"></div>
      <div class="eot-splash-inner">
        <div class="eot-splash-stage" aria-hidden="true"><div class="eot-splash-logo"></div></div>
        <h1 class="eot-splash-brand">EMPIRE<span>OF TRADE</span></h1>
      </div>
      <div class="eot-splash-progress-wrap" role="status" aria-label="Oyun yükleniyor">
        <div class="eot-splash-progress-head"><span>Yükleniyor</span><span class="eot-splash-percent" id="eotSplashPercent">%0</span></div>
        <div class="eot-splash-track"><div class="eot-splash-fill" id="eotSplashFill"></div></div>
      </div>
      <div class="eot-splash-footer">ERKEN ERİŞİM</div>`;
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