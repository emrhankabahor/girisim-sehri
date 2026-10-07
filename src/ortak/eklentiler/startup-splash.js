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
    #eotStartupSplash{position:fixed;inset:0;height:100%;height:100dvh;min-height:0;z-index:2147483646;overflow:hidden;isolation:isolate;background:#050e1c;color:#ecdfc1;font-family:system-ui,sans-serif;opacity:1;transition:opacity .35s ease}
    #eotStartupSplash *{box-sizing:border-box}
    #eotStartupSplash.eot-splash-out{opacity:0;pointer-events:none}
    #eotStartupSplash{background:#031531}
    /* One cover-sized artwork plane keeps the supplied logo, caption and gold frame aligned. */
    .eot-reference-stage{position:absolute;left:50%;top:50%;width:100%;height:100%;transform:translate(-50%,-50%);overflow:hidden;pointer-events:none}
    .eot-reference-art{position:absolute;left:50%;top:50%;width:var(--eot-art-width,100%);height:auto;aspect-ratio:852/1846;transform:translate(-50%,-50%)}
    .eot-reference-art>img{display:block;width:100%;height:100%;pointer-events:none}
    .eot-startup-track{position:absolute;left:15.15%;top:72.77%;width:69.7%;height:2.8%;border-radius:999px;overflow:hidden;background:linear-gradient(#020d25,#031c4e 75%,#005280);box-shadow:inset 0 1px 2px #80dfff;isolation:isolate}
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
    // Use the reference unchanged; only the fill inside its gold loading frame is live.
    el.innerHTML=`<div class="eot-reference-stage" role="img" aria-label="Empire of Trade"><div class="eot-reference-art"><img src="./assets/splash-reference-v255.png" width="852" height="1846" alt="" fetchpriority="high"><div class="eot-startup-track" aria-hidden="true"><i id="eotLoadingFill"></i></div></div><div class="eot-sr-only" role="status"><span id="eotSplashPhase">Yükleniyor…</span><span id="eotSplashPercent">%0</span></div></div>`;
    document.body.appendChild(el);
    fitViewport();
  }

  // Safari toolbar changes affect the visible viewport independently of 100vh.
  // Measure that viewport; do not add a second safe-area strip below it.
  function fitViewport(){
    if(finishing||removed)return;
    const el=document.getElementById('eotStartupSplash');
    if(!el)return;
    const viewport=window.visualViewport;
    const width=viewport?viewport.width:window.innerWidth;
    const height=viewport?viewport.height:window.innerHeight;
    if(!(width>0&&height>0))return;
    el.style.left=(viewport?viewport.offsetLeft:0)+'px';
    el.style.top=(viewport?viewport.offsetTop:0)+'px';
    el.style.width=width+'px';el.style.height=height+'px';
    el.style.right='auto';el.style.bottom='auto';
    el.style.setProperty('--eot-art-width',Math.ceil(Math.max(width,height*852/1846))+'px');
  }
  window.addEventListener('resize',fitViewport);
  if(window.visualViewport){
    window.visualViewport.addEventListener('resize',fitViewport);
    window.visualViewport.addEventListener('scroll',fitViewport);
  }
  function stopViewportTracking(){
    window.removeEventListener('resize',fitViewport);
    if(window.visualViewport){
      window.visualViewport.removeEventListener('resize',fitViewport);
      window.visualViewport.removeEventListener('scroll',fitViewport);
    }
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
    stopViewportTracking();
    paint(100);
    setTimeout(()=>{
      const el=document.getElementById('eotStartupSplash');
      // Freeze the splash geometry before restoring scrollbars and page layout.
      if(el){
        const box=el.getBoundingClientRect();
        el.style.width=box.width+'px';el.style.height=box.height+'px';
        el.style.minHeight='0';el.style.right='auto';el.style.bottom='auto';
      }
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