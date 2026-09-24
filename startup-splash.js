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

  let buildingClips=[];
  const buildingPlan=[{x:22,w:48,h:68,start:0},{x:83,w:48,h:112,start:12},{x:146,w:56,h:162,start:25},{x:215,w:47,h:128,start:40},{x:275,w:49,h:88,start:55}];
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
    .eot-splash-inner{position:absolute;top:30%;left:50%;transform:translate(-50%,-50%);width:min(86%,430px);text-align:center}
    .eot-splash-stage{margin:0 auto 30px;display:grid;place-items:center}
    .eot-splash-logo{width:88px;height:88px;border-radius:23px;background:url('./apple-touch-icon.png?v=190') center/cover no-repeat;box-shadow:0 12px 32px #0005}
    .eot-splash-brand{margin:0;color:#f3f7fa;font-size:clamp(24px,6.5vw,34px);line-height:1.2;font-weight:700;letter-spacing:.035em}
    .eot-splash-brand span{display:block;margin-top:7px;font-size:.65em;font-weight:400;letter-spacing:.24em;padding-left:.24em;color:#9bb8c5}
    .eot-splash-progress-wrap{position:absolute;top:48%;left:50%;transform:translateX(-50%);width:min(86%,420px)}
    .eot-splash-city{width:100%;height:auto;display:block;overflow:visible}
    .eot-splash-building{filter:drop-shadow(0 5px 7px #0004)}
    .eot-splash-window{fill:#b9dbcb;opacity:.8}
    .eot-splash-progress-head{display:flex;justify-content:space-between;align-items:center;gap:12px;margin:22px 8px 0;font-size:11px;color:#94aab8;letter-spacing:.025em}
    .eot-splash-percent{font-variant-numeric:tabular-nums;white-space:nowrap;color:#d8c59a}
    .eot-splash-caption{margin:9px 8px 0;color:#657e8e;font-size:10px;line-height:1.5}
    .eot-splash-footer{position:absolute;bottom:calc(env(safe-area-inset-bottom,0px) + 28px);left:0;right:0;text-align:center;color:#657e8e;font-size:9px;letter-spacing:.16em}
    @media(max-height:650px){.eot-splash-logo{width:60px;height:60px;border-radius:17px}.eot-splash-stage{margin-bottom:17px}.eot-splash-brand{font-size:24px}.eot-splash-inner{top:27%}.eot-splash-progress-wrap{top:45%;width:min(72%,300px)}.eot-splash-progress-head{margin-top:12px}}
    @media(max-height:480px) and (orientation:landscape){.eot-splash-inner{left:27%;top:48%;width:42%}.eot-splash-progress-wrap{left:73%;top:13%;width:min(42%,300px)}.eot-splash-footer{bottom:12px}}
    @media(prefers-reduced-motion:reduce){#eotStartupSplash{transition:none}}
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
        <svg class="eot-splash-city" viewBox="0 0 350 220" role="img" aria-label="Yüklemeyle birlikte inşa edilen şehir">
          <defs>
            <linearGradient id="eotBuildingFace" x2="0" y2="1"><stop stop-color="#28576a"/><stop offset="1" stop-color="#102c3d"/></linearGradient>
            <linearGradient id="eotGroundGlow"><stop stop-color="#64b7bf" stop-opacity="0"/><stop offset=".5" stop-color="#64b7bf" stop-opacity=".7"/><stop offset="1" stop-color="#64b7bf" stop-opacity="0"/></linearGradient>
            ${buildingPlan.map((b,i)=>'<clipPath id="eotBuildMask'+i+'"><rect id="eotBuildClip'+i+'" x="0" y="194" width="350" height="0"/></clipPath>').join('')}
          </defs>
          <ellipse cx="175" cy="197" rx="163" ry="15" fill="#102b38" opacity=".65"/>
          <path d="M6 194H344" stroke="url(#eotGroundGlow)"/>
          ${buildingPlan.map((b,i)=>{
            const y=194-b.h;
            let windows='';
            for(let row=0;row<Math.floor((b.h-20)/15);row++)for(let col=0;col<3;col++)windows+='<rect class="eot-splash-window" x="'+(b.x+8+col*12)+'" y="'+(y+12+row*15)+'" width="5" height="7" rx="1"/>';
            return '<g fill="none" stroke="#456477" stroke-opacity=".3" stroke-dasharray="3 5"><rect x="'+b.x+'" y="'+y+'" width="'+b.w+'" height="'+b.h+'"/></g><g class="eot-splash-building" clip-path="url(#eotBuildMask'+i+')"><path d="M'+b.x+' '+y+'l8 -6h'+b.w+'l-8 6Z" fill="#54818c"/><path d="M'+(b.x+b.w)+' '+y+'l8 -6v'+b.h+'l-8 6Z" fill="#0b202e"/><rect x="'+b.x+'" y="'+y+'" width="'+b.w+'" height="'+b.h+'" fill="url(#eotBuildingFace)" stroke="#547d8b" stroke-width=".6"/>'+windows+'<rect x="'+(b.x+b.w/2-5)+'" y="181" width="10" height="13" fill="#0a1b26"/></g>';
          }).join('')}
          <g fill="none" stroke="#bdab80" stroke-width="1.3" opacity=".7"><path d="M207 194V16M177 25H260L207 16ZM211 25V194M254 25V66"/><path d="M251 66v5h6v-5M207 40l4 12-4 12 4 12-4 12 4 12-4 12 4 12-4 12 4 12-4 12" stroke-width=".7"/></g>
        </svg>
        <div class="eot-splash-progress-head"><span id="eotSplashPhase">Temeller atılıyor</span><span class="eot-splash-percent" id="eotSplashPercent">%0</span></div>
        <p class="eot-splash-caption">İmparatorluğun adım adım yükseliyor.</p>
      </div>
      <div class="eot-splash-footer">ERKEN ERİŞİM</div>`;
    document.body.appendChild(el);
    buildingClips=buildingPlan.map((b,i)=>document.getElementById("eotBuildClip"+i));
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
    buildingClips.forEach((clip,i)=>{
      if(!clip)return;
      const b=buildingPlan[i];
      const fraction=Math.max(0,Math.min(1,(visible-b.start)/40));
      const height=(b.h+8)*fraction;
      clip.setAttribute('y',String(194-height));
      clip.setAttribute('height',String(height));
    });
    const phase=document.getElementById('eotSplashPhase');
    if(phase)phase.textContent=visible>=100?'Şehrin hazır':visible<25?'Temeller atılıyor':visible<65?'Binalar yükseliyor':'Son dokunuşlar yapılıyor';
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