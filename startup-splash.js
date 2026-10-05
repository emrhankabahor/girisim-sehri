/* Empire of Trade • Sade açılış temeli + render perdesi */
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
    #eotStartupSplash{position:fixed;inset:0;min-height:100vh;min-height:100lvh;z-index:2147483646;overflow:hidden;display:grid;place-items:center;background:#040c1b;color:#bdcde0;font-family:system-ui,sans-serif;opacity:1;transition:opacity .3s ease}
    #eotStartupSplash *{box-sizing:border-box}
    #eotStartupSplash.eot-splash-out{opacity:0;pointer-events:none}
    .eot-startup-base{width:min(64vw,240px);text-align:center}
    .eot-startup-base img{display:block;width:min(40vw,150px,35vh);height:auto;margin:0 auto 28px;border-radius:20%}
    .eot-startup-caption{display:flex;justify-content:space-between;gap:16px;font-size:12px;margin-bottom:12px}
    #eotSplashPercent{font-variant-numeric:tabular-nums;font-weight:500}
    .eot-startup-track{height:3px;background:#20324a;border-radius:4px;overflow:hidden}
    #eotLoadingFill{display:block;height:100%;width:100%;transform:scaleX(var(--progress,0));transform-origin:left;background:#6fabc9}
    @media(prefers-reduced-motion:reduce){#eotStartupSplash{transition:none}}
  `;
  document.head.appendChild(style);
  document.documentElement.classList.add('eot-booting');

  function mount(){
    if(document.getElementById('eotStartupSplash'))return;
    const el=document.createElement('div');
    el.id='eotStartupSplash';
    // Let CSS cover the complete viewport, including the iOS home-indicator area.
    // screen.height can differ from the CSS viewport under display zoom or rotation.
    el.innerHTML=`<div class="eot-startup-base" role="status" aria-label="Oyun yükleniyor">
      <img src="./assets/logo-v221-512.png" alt="Empire of Trade" width="512" height="512" fetchpriority="high">
      <div class="eot-startup-caption"><span id="eotSplashPhase">Yükleniyor…</span><span id="eotSplashPercent">%0</span></div>
      <div class="eot-startup-track" aria-hidden="true"><i id="eotLoadingFill"></i></div>
    </div>`;
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