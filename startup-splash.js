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

  let target=8, shown=0, ready=false, removed=false, finishing=false;

  const style=document.createElement('style');
  style.id='eot-startup-splash-style';
  style.textContent=`
    html.eot-booting,html.eot-booting body{overflow:hidden!important;overscroll-behavior:none!important}
    html.eot-booting,html.eot-booting body,html.eot-booting body.eot-design-v1{background:#040c1b!important}
    html.eot-booting #app-root{visibility:hidden!important}
    #eotStartupSplash{position:fixed;inset:0;width:100%;height:auto;min-height:100vh;min-height:100lvh;z-index:2147483646;isolation:isolate;overflow:hidden;background:radial-gradient(ellipse at 50% 36%,#103f7b 0%,#08244c 40%,#040c1b 85%);color:#f5dfaa;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;opacity:1;transition:opacity .42s ease}
    #eotStartupSplash *{box-sizing:border-box}
    #eotStartupSplash.eot-splash-out{opacity:0;pointer-events:none}
    .eot-royal-pattern{position:absolute;inset:0;pointer-events:none;background:repeating-linear-gradient(45deg,transparent 0 22px,#5196cd06 22px 23px),repeating-linear-gradient(-45deg,transparent 0 22px,#5196cd06 22px 23px);mask-image:linear-gradient(#000,transparent 48%,#000)}
    .eot-royal-frame{position:absolute;inset:calc(env(safe-area-inset-top,0px) + 12px) 16px calc(env(safe-area-inset-bottom,0px) + 12px);border-left:1px solid #cba85b66;border-right:1px solid #cba85b66;pointer-events:none}
    .eot-frame-corner{position:absolute;width:clamp(95px,30vw,200px);height:clamp(95px,30vw,200px);overflow:visible}
    .eot-frame-corner:nth-child(1){top:0;left:0}.eot-frame-corner:nth-child(2){top:0;right:0;transform:scaleX(-1)}
    .eot-frame-corner:nth-child(3){bottom:0;left:0;transform:scaleY(-1)}.eot-frame-corner:nth-child(4){bottom:0;right:0;transform:scale(-1)}
    .eot-frame-corner .facet{fill:#103770;stroke:#3673a8;stroke-width:1}
    .eot-frame-corner .edge{fill:none;stroke:url(#eotRoyalGold);stroke-width:3}
    .eot-frame-corner .spark{fill:none;stroke:#fff0b1;stroke-width:2;stroke-dasharray:9 91;animation:eotFrameLight 7s linear infinite;filter:drop-shadow(0 0 3px #ffe190)}
    .eot-royal-crest{position:absolute;left:50%;top:calc(env(safe-area-inset-top,0px) + 24px);transform:translateX(-50%);width:54px;height:54px;color:#efcd80;filter:drop-shadow(0 2px 8px #d7a94c44)}
    .eot-royal-crest::before,.eot-royal-crest::after{content:'';position:absolute;top:50%;height:1px;width:clamp(30px,13vw,100px);background:linear-gradient(90deg,transparent,#c9a964)}
    .eot-royal-crest::before{right:75px}.eot-royal-crest::after{left:75px;transform:scaleX(-1)}
    .eot-logo-stage{position:absolute;left:50%;top:43%;transform:translate(-50%,-50%);width:min(82vw,420px,47vh);aspect-ratio:1;isolation:isolate}
    .eot-logo-aura{position:absolute;inset:-30%;border-radius:50%;background:radial-gradient(ellipse,#1375d76b,transparent 68%);pointer-events:none;animation:eotAura 5s ease-in-out infinite alternate}
    .eot-royal-seal{position:absolute;inset:-10%;width:120%;height:120%;pointer-events:none;overflow:visible}
    .eot-royal-seal .outline{fill:none;stroke:#c8ab6670;stroke-width:1}
    .eot-royal-seal .ticks{fill:none;stroke:#eedb9b88;stroke-width:2;stroke-dasharray:1 8}
    .eot-royal-seal .market{fill:none;stroke:#459cdc44;stroke-width:1}
    .eot-logo-emblem{position:absolute;inset:5%;margin:0;z-index:2;filter:drop-shadow(0 24px 30px #0009)}
    .eot-logo-crop{position:relative;width:100%;height:100%;overflow:hidden;border-radius:22%;box-shadow:0 0 36px #198be32b}
    .eot-logo-crop img{display:block;width:100%;height:100%;object-fit:contain;animation:eotLogoAppear .8s ease-out both}
    .eot-logo-crop::after{content:'';position:absolute;inset:-20% -60%;background:linear-gradient(110deg,transparent 45%,#fff0bd44 50%,transparent 55%);animation:eotGoldSweep 2.4s ease-out .1s both;pointer-events:none}
    .eot-logo-loading{position:absolute;top:calc(43% + min(41vw,210px,23.5vh) + 54px);left:50%;transform:translateX(-50%);width:min(76vw,360px)}
    .eot-loading-ornament{display:flex;align-items:center;gap:14px;justify-content:center;margin-bottom:24px;color:#e9c778;font-size:15px}
    .eot-loading-ornament::before,.eot-loading-ornament::after{content:'';height:1px;width:30%;background:linear-gradient(90deg,transparent,#dabb77)}
    .eot-loading-ornament::after{transform:scaleX(-1)}
    .eot-loading-caption{display:flex;justify-content:center;align-items:baseline;gap:12px;margin-bottom:16px;font-size:clamp(17px,4.5vw,23px);font-weight:750;color:#f6df9d;text-shadow:0 2px 2px #000;letter-spacing:.01em}
    #eotSplashPercent{font-variant-numeric:tabular-nums;font-size:12px;font-weight:500;color:#a9c9e5;min-width:34px}
    .eot-loading-shell{position:relative;padding:4px;border-radius:22px;background:linear-gradient(165deg,#fff0b3,#a77723 28%,#f9d371 49%,#745021 76%,#f1d38b);box-shadow:0 5px 15px #0008,0 0 22px #2186cb22}
    .eot-loading-shell::before,.eot-loading-shell::after{content:'';position:absolute;top:50%;width:12px;height:12px;transform:translateY(-50%) rotate(45deg);border:2px solid #f7d47d;background:linear-gradient(135deg,#a8efff,#07629c);box-shadow:0 0 9px #021225}
    .eot-loading-shell::before{left:-7px}.eot-loading-shell::after{right:-7px}
    .eot-loading-line{height:22px;background:#03182f;border:2px solid #052e54;border-radius:16px;overflow:hidden;box-shadow:inset 0 2px 6px #000}
    .eot-loading-line i{display:block;width:calc(var(--progress,0) * 100%);height:100%;position:relative;overflow:hidden;border-radius:12px;background:repeating-linear-gradient(130deg,transparent 0 16px,#b4faff26 16px 29px),linear-gradient(#a0f8ff,#05bcf3 35%,#087bdf 70%,#3ad9ff);box-shadow:inset 0 1px 0 #e1ffff,0 0 12px #5de6ff}
    .eot-loading-line i::after{content:'';position:absolute;inset:0;background:linear-gradient(110deg,transparent 25%,#fff9 50%,transparent 75%);animation:eotBarLight 2.8s ease-in-out infinite}
    @keyframes eotFrameLight{to{stroke-dashoffset:-100}}
    @keyframes eotAura{from{opacity:.55}to{opacity:1}}
    @keyframes eotLogoAppear{from{opacity:.65}to{opacity:1}}
    @keyframes eotGoldSweep{from{transform:translateX(-65%);opacity:0}25%{opacity:.7}to{transform:translateX(65%);opacity:0}}
    @keyframes eotBarLight{0%{transform:translateX(-120%)}70%,100%{transform:translateX(120%)}}
    @media(max-height:650px){.eot-royal-crest{width:34px;height:34px;top:16px}.eot-logo-loading{top:calc(43% + min(41vw,210px,23.5vh) + 26px)}.eot-loading-ornament{margin-bottom:12px}}
    @media(orientation:landscape) and (max-height:600px){.eot-logo-stage{left:32%;top:51%;width:min(65vh,300px)}.eot-logo-loading{left:70%;top:42%;width:min(34vw,300px)}.eot-royal-crest{left:70%;top:15%}}
    @media(prefers-reduced-motion:reduce){#eotStartupSplash *,#eotStartupSplash *::before,#eotStartupSplash *::after{animation:none!important;transition:none!important}.eot-logo-crop::after,.eot-loading-line i::after,.eot-frame-corner .spark{display:none}#eotStartupSplash{transition:none}}
  `;
  document.head.appendChild(style);
  document.documentElement.classList.add('eot-booting');
  const firstPaintGuard=document.getElementById('eot-first-paint-guard');

  function mount(){
    if(document.getElementById('eotStartupSplash'))return;
    const el=document.createElement('div');
    el.id='eotStartupSplash';
    // Let CSS cover the complete viewport, including the iOS home-indicator area.
    // screen.height can differ from the CSS viewport under display zoom or rotation.
    const corner='<svg class="eot-frame-corner" viewBox="0 0 160 160" aria-hidden="true"><path class="facet" d="M0 0H105L65 40V95L0 150V128L46 86V32L78 0Z"/><path class="edge" d="M0 153 65 96V40L105 0M0 123 41 86V30L72 0"/><path class="spark" pathLength="100" d="M0 153 65 96V40L105 0"/></svg>';
    el.innerHTML=`
      <svg width="0" height="0" aria-hidden="true" style="position:absolute"><defs><linearGradient id="eotRoyalGold" x2="1" y2="1"><stop stop-color="#9c6d2e"/><stop offset=".4" stop-color="#fce4a2"/><stop offset=".7" stop-color="#ac803c"/><stop offset="1" stop-color="#ffe8ae"/></linearGradient></defs></svg>
      <div class="eot-royal-pattern" aria-hidden="true"></div>
      <div class="eot-royal-frame" aria-hidden="true">${corner.repeat(4)}</div>
      <div class="eot-royal-crest" aria-hidden="true"><svg viewBox="0 0 60 60"><path d="M12 38 7 18 21 27 30 10 39 27 53 18 48 38Z" fill="url(#eotRoyalGold)"/><path d="M14 43H46" stroke="#e9c579" stroke-width="3"/></svg></div>
      <div class="eot-logo-stage">
        <div class="eot-logo-aura" aria-hidden="true"></div>
        <svg class="eot-royal-seal" viewBox="0 0 500 500" aria-hidden="true"><path class="outline" d="M250 10 420 80 490 250 420 420 250 490 80 420 10 250 80 80Z"/><circle class="ticks" cx="250" cy="250" r="223"/><path class="outline" d="M105 80Q250 -20 395 80M105 420Q250 520 395 420"/><path class="market" d="M15 310 60 310V260H95V208H130V155H165M335 340H370V290H405V220H440V150H480"/></svg>
        <h1 class="eot-logo-emblem"><div class="eot-logo-crop"><img src="./assets/logo-v221-512.png" alt="Empire of Trade" width="512" height="512" fetchpriority="high"></div></h1>
      </div>
      <div class="eot-logo-loading" role="status" aria-label="Oyun yükleniyor"><div class="eot-loading-ornament" aria-hidden="true">◆</div><div class="eot-loading-caption"><span id="eotSplashPhase">Yükleniyor…</span><strong id="eotSplashPercent">%0</strong></div><div class="eot-loading-shell"><div class="eot-loading-line" aria-hidden="true"><i id="eotLoadingFill"></i></div></div></div>`;
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