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

  let constructionBars=[],sectorLabels=[];
  const towerHeights=[34,49,40,68,55,84,64,100,77,89,58,72];
  const started=performance.now();
  let visibleStarted=0;
  let target=8, shown=0, ready=false, removed=false, finishing=false, timer=null;

  const style=document.createElement('style');
  style.id='eot-startup-splash-style';
  style.textContent=`
    html.eot-booting,html.eot-booting body{overflow:hidden!important;overscroll-behavior:none!important}
    html.eot-booting #app-root{visibility:hidden!important}
    #eotStartupSplash{position:fixed;inset:0;width:100%;height:100vh;height:100lvh;box-sizing:border-box;isolation:isolate;overflow:hidden;z-index:2147483646;color:#eef6ff;background:radial-gradient(ellipse at 50% 35%,#123968 0%,#081d3b 43%,#040d20 85%);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;opacity:1;transition:opacity .42s ease}
    #eotStartupSplash *{box-sizing:border-box}
    #eotStartupSplash.eot-splash-out{opacity:0;pointer-events:none}
    .eot-cinema-top{position:absolute;top:calc(env(safe-area-inset-top,0px) + 24px);left:7%;right:7%;display:flex;justify-content:space-between;gap:16px;align-items:center;font-size:8px;letter-spacing:.14em;color:#a5bfda}
    .eot-cinema-top span{font-size:7px;color:#e9cc84;border:1px solid #cda85233;border-radius:20px;padding:7px 10px;background:#e8ba5710}
    .eot-launch-composition{position:absolute;inset:calc(env(safe-area-inset-top,0px) + 75px) 0 calc(env(safe-area-inset-bottom,0px) + 35px);display:flex;flex-direction:column;justify-content:center;align-items:center;gap:clamp(30px,6vh,60px)}
    .eot-cinema-brand{flex:none;position:relative;text-align:center}
    .eot-cinema-brand::before{content:'';position:absolute;inset:-22%;border-radius:50%;background:radial-gradient(ellipse,#1b8fcc18,transparent 65%);z-index:-1}
    .eot-logo-heading{margin:0;line-height:0}
    .eot-opening-logo{display:block;width:clamp(190px,31vh,290px);height:auto;border-radius:22%;filter:drop-shadow(0 18px 28px #0004)}
    .eot-cinema-load{width:min(84%,500px);flex:none}
    .eot-construction{position:relative;padding-top:47px}
    .eot-cinema-track{position:relative;height:clamp(100px,17vh,160px);display:flex;gap:clamp(4px,1.1vw,8px);align-items:flex-end;border-bottom:2px solid #e5c16d;filter:drop-shadow(0 10px 25px #0ba7dd20)}
    .eot-cinema-track::after{content:'';position:absolute;left:-5%;right:-5%;bottom:-15px;height:13px;background:repeating-linear-gradient(90deg,transparent 0 19px,#87bde329 20px 21px);border-top:1px solid #64a8d433;transform:perspective(90px) rotateX(40deg);transform-origin:top}
    .eot-tower{position:relative;flex:1;min-width:0;height:var(--height);border:1px solid #84b8dc20;border-bottom:0;border-radius:3px 3px 0 0;background:repeating-linear-gradient(0deg,transparent 0 11px,#88c6e912 11px 12px)}
    .eot-tower-body{position:absolute;inset:0;border:1px solid #66ccec;border-bottom:0;border-radius:3px 3px 0 0;background:linear-gradient(90deg,#1b6897,#338eb2 70%,#164c7e 71%);clip-path:inset(var(--unbuilt,100%) 0 0);transition:clip-path .16s linear}
    .eot-tower-body::before{content:'';position:absolute;inset:5px 4px 4px;background:repeating-linear-gradient(0deg,transparent 0 6px,#ffdf8f 6px 9px,transparent 9px 13px);mask-image:repeating-linear-gradient(90deg,#000 0 3px,transparent 3px 7px);opacity:.8}
    .eot-tower:nth-of-type(4n) .eot-tower-body{border-color:#f3cd82;background:linear-gradient(90deg,#946934,#c29551 70%,#695334 71%)}
    .eot-tower-cap{position:absolute;left:-2px;right:-2px;bottom:var(--built,0%);height:3px;background:#b7ecff;box-shadow:0 0 12px #60cfff88;opacity:0;transition:bottom .16s linear,opacity .2s}
    .eot-tower.building .eot-tower-cap{opacity:1}
    .eot-tower.complete{border-color:#6ac6e255}
    .eot-crane{position:absolute;z-index:2;bottom:0;left:var(--crane-x,4%);width:56px;height:calc(100% + 30px);transform:translateX(-50%);transition:left .2s linear,opacity .3s;pointer-events:none;color:#e9bd62}
    .eot-crane::before{content:'';position:absolute;left:27px;top:0;height:100%;width:3px;background:repeating-linear-gradient(0deg,#e9bd62 0 2px,transparent 2px 9px);border-inline:1px solid currentColor}
    .eot-crane::after{content:'';position:absolute;left:0;right:0;top:7px;height:7px;border:1px solid currentColor;background:repeating-linear-gradient(135deg,transparent 0 5px,#e9bd6277 5px 6px)}
    .eot-crane-cable{position:absolute;left:42px;top:15px;bottom:var(--roof,0%);width:1px;background:#dbbf83;transition:bottom .16s linear}
    .eot-crane-cable::after{content:'';position:absolute;bottom:-3px;left:-3px;width:7px;height:5px;background:#efca7f;border-radius:1px}
    .eot-cinema-sectors{display:flex;justify-content:space-between;gap:8px;margin-top:25px;color:#6686a7;font-size:8px;font-weight:700;letter-spacing:.1em}
    .eot-cinema-sectors span.active{color:#efcd83}
    .eot-cinema-status{display:flex;justify-content:space-between;align-items:center;gap:16px;margin-top:30px;padding-top:17px;border-top:1px solid #91b9db1c}
    .eot-cinema-phase{font-size:12px;letter-spacing:.04em;color:#acc5dd}
    .eot-cinema-percent{font-size:28px;font-weight:700;font-variant-numeric:tabular-nums;color:#f9d785;min-width:80px;text-align:right}
    #eotStartupSplash::before{content:'';position:absolute;inset:0;background:linear-gradient(90deg,transparent 49.8%,#a2cbed05 50%,transparent 50.2%),repeating-linear-gradient(0deg,transparent 0 79px,#91c6e905 80px);pointer-events:none}
    #eotStartupSplash::after{content:'';position:absolute;inset:calc(env(safe-area-inset-top,0px) + 64px) 20px calc(env(safe-area-inset-bottom,0px) + 26px);border:1px solid #8fb9d514;border-radius:160px 160px 24px 24px;pointer-events:none;z-index:-1}
    .eot-cinema-brand::before{inset:-18%;background:radial-gradient(ellipse,#238bc32b,transparent 67%);border:1px solid #8cbfe918;box-shadow:0 0 0 22px #88bfff03,0 0 0 44px #88bfff02}
    .eot-cinema-brand::after{content:'';position:absolute;left:12%;right:12%;bottom:-18px;height:1px;background:linear-gradient(90deg,transparent,#eac16e,transparent);box-shadow:0 0 20px #dfb55955}
    .eot-opening-logo{filter:drop-shadow(0 20px 32px #0008)}
    .eot-cinema-load{padding:0 4px}
    .eot-construction{padding:38px 10px 0;background:radial-gradient(ellipse at 50% 100%,#1f80af20,transparent 70%)}
    .eot-cinema-track{border-bottom:2px solid #e5c16d99}
    .eot-tower{border-color:#729dbe33;background:repeating-linear-gradient(0deg,transparent 0 11px,#88c6e90b 11px 12px),linear-gradient(90deg,#15335440,#081a3140)}
    .eot-tower-body{background:linear-gradient(90deg,#17496b,#287fab 67%,#113856 68%);border-color:#65cae8aa;box-shadow:inset 2px 0 #a1e9ff22}
    .eot-tower:nth-of-type(3n) .eot-tower-body{background:linear-gradient(90deg,#205b82,#43a7c5 67%,#143b58 68%)}
    .eot-tower:nth-of-type(4n) .eot-tower-body{background:linear-gradient(90deg,#695338,#a68044 67%,#493d2b 68%);border-color:#e6bf79aa}
    .eot-tower:nth-of-type(6)::before,.eot-tower:nth-of-type(8)::before{content:'';position:absolute;width:1px;height:13px;left:50%;top:-14px;background:#80b8d86b}
    .eot-tower-body::before{opacity:.35;transition:opacity .45s ease}
    .eot-tower.complete .eot-tower-body::before{opacity:1}
    .eot-tower.complete .eot-tower-body{border-color:#a4dced;box-shadow:inset 2px 0 #d4f2ff33}
    .eot-cinema-track.eot-city-complete{filter:drop-shadow(0 0 18px #53bfe644)}
    .eot-cinema-sectors{margin-top:28px;font-size:8px;letter-spacing:.07em}
    .eot-cinema-sectors span{position:relative;padding-top:10px;transition:color .3s}
    .eot-cinema-sectors span::before{content:'';position:absolute;top:0;left:50%;width:3px;height:3px;border-radius:50%;background:#34506e}
    .eot-cinema-sectors span.active::before{background:#edca7a;box-shadow:0 0 8px #edca7a66}
    .eot-cinema-status{margin-top:24px;padding-top:18px;border-top:1px solid #91b9db20}
    .eot-cinema-phase{font-size:11px;color:#b2c7d9}
    .eot-cinema-percent{font-size:28px;letter-spacing:-.04em;color:#f3db9d}
    @media(max-height:650px){.eot-launch-composition{gap:25px}.eot-opening-logo{width:135px}.eot-cinema-track{height:85px}.eot-cinema-status{margin-top:18px;padding-top:12px}}
    @media(orientation:landscape) and (max-height:600px){.eot-launch-composition{flex-direction:row;gap:7vw;inset:65px 6% 25px}.eot-cinema-load{width:55%;max-width:520px}.eot-opening-logo{width:min(25vw,190px)}.eot-cinema-track{height:90px}.eot-cinema-status{margin-top:18px}}
    @media(prefers-reduced-motion:reduce){#eotStartupSplash,.eot-tower-body,.eot-tower-cap,.eot-crane{transition:none}}
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
      <header class="eot-cinema-top"><b>EMPIRE OF TRADE</b><span>ERKEN ERİŞİM</span></header>
      <div class="eot-launch-composition">
        <div class="eot-cinema-brand"><h1 class="eot-logo-heading"><img class="eot-opening-logo" src="./assets/logo-v221-512.png" alt="Empire of Trade" width="512" height="512" fetchpriority="high"></h1></div>
        <div class="eot-cinema-load" role="status" aria-label="Oyun yükleniyor">
          <div class="eot-construction" aria-hidden="true">
            <div class="eot-cinema-track"><span class="eot-crane" id="eotLoadingCrane"><i class="eot-crane-cable"></i></span>${towerHeights.map((h,i)=>'<div class="eot-tower" data-floors="'+Math.round(h/10)+'" style="--height:'+h+'%"><i class="eot-tower-body"></i><i class="eot-tower-cap"></i></div>').join('')}</div>
          </div>
          <div class="eot-cinema-sectors" aria-hidden="true"><span>ARSA</span><span>GALERİ</span><span>İŞLETMELER</span><span>FİNANS</span></div>
          <div class="eot-cinema-status"><span class="eot-cinema-phase" id="eotSplashPhase">Yükleniyor…</span><span class="eot-cinema-percent" id="eotSplashPercent">%0</span></div>
        </div>
      </div>`;
    document.body.appendChild(el);
    constructionBars=Array.from(el.querySelectorAll('.eot-tower'));
    sectorLabels=Array.from(el.querySelectorAll('.eot-cinema-sectors span'));
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
    constructionBars.forEach((bar,i)=>{
      const floors=Number(bar.dataset.floors)||5;
      const raw=Math.max(0,Math.min(1,(shown/100*constructionBars.length)-i));
      const built=Math.floor(raw*floors)/floors;
      bar.style.setProperty('--unbuilt',((1-built)*100)+'%');
      bar.style.setProperty('--built',(built*100)+'%');
      bar.classList.toggle('building',raw>0&&raw<1);
      bar.classList.toggle('complete',raw>=1);
    });
    sectorLabels.forEach((item,i)=>item.classList.toggle('active',shown>i*25));
    const crane=document.getElementById('eotLoadingCrane');
    if(crane){
      const active=Math.min(constructionBars.length-1,Math.floor(shown/100*constructionBars.length));
      const fraction=Math.min(1,Math.max(0,shown/100*constructionBars.length-active));
      const floors=Number(constructionBars[active]?.dataset.floors)||5;
      const roof=towerHeights[active]*Math.floor(fraction*floors)/floors;
      crane.style.setProperty('--crane-x',((active+.5)/constructionBars.length*100)+'%');
      crane.style.setProperty('--roof',(roof*.82)+'%');
      crane.style.opacity=shown>=100?'0':'1';
      crane.parentElement.classList.toggle('eot-city-complete',shown>=100);
    }
    const pct=document.getElementById('eotSplashPercent');

    if(pct)pct.textContent='%'+visible;
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