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
    .eot-splash-glow{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 58%,#174d6255,transparent 57%),linear-gradient(165deg,#07121f,#030b12 65%);pointer-events:none}
    .eot-splash-inner{position:absolute;top:46%;left:50%;transform:translate(-50%,-50%);width:min(88%,460px);text-align:center}
    .eot-splash-stage{margin:0 auto 22px;display:grid;place-items:center}
    .eot-splash-logo{width:76px;height:76px;border-radius:21px;background:url('./apple-touch-icon.png?v=190') center/cover no-repeat;box-shadow:0 12px 32px #0005}
    .eot-splash-brand{margin:0;color:#f3f7fa;font-size:clamp(24px,6.5vw,34px);line-height:1.2;font-weight:700;letter-spacing:.035em}
    .eot-splash-brand span{display:block;margin-top:7px;font-size:.65em;font-weight:400;letter-spacing:.24em;padding-left:.24em;color:#9bb8c5}
    .eot-splash-progress-wrap{position:relative;width:100%;margin:38px auto 0;text-align:left}
    .eot-splash-city{width:100%;height:auto;display:block;overflow:visible}
    .eot-splash-building{filter:drop-shadow(0 5px 7px #0004)}
    .eot-splash-window{fill:#d5c397;opacity:.85}
    .eot-splash-kicker{margin:0 0 14px;color:#b8a981;font-size:8px;letter-spacing:.3em}
    .eot-splash-crane-hook{animation:eotHoist 4s ease-in-out infinite;transform-origin:254px 25px}
    @keyframes eotHoist{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}
    .eot-splash-progress-head{display:flex;justify-content:space-between;align-items:center;gap:12px;margin:16px 12px 0;font-size:12px;color:#b0c2cd;letter-spacing:.025em}
    .eot-splash-percent{font-variant-numeric:tabular-nums;white-space:nowrap;color:#d8c59a}
    .eot-splash-caption{margin:8px 12px 0;color:#657e8e;font-size:10px;line-height:1.5}
    .eot-splash-footer{position:absolute;bottom:calc(env(safe-area-inset-bottom,0px) + 28px);left:0;right:0;text-align:center;color:#657e8e;font-size:9px;letter-spacing:.16em}
    @media(max-height:740px){.eot-splash-logo{width:56px;height:56px;border-radius:16px}.eot-splash-stage{margin-bottom:15px}.eot-splash-brand{font-size:26px}.eot-splash-inner{width:min(82%,360px)}.eot-splash-progress-wrap{margin-top:24px}.eot-splash-kicker{margin-bottom:9px}}
    @media(max-height:540px) and (orientation:portrait){.eot-splash-inner{width:min(72%,270px)}.eot-splash-logo{width:40px;height:40px;border-radius:12px}.eot-splash-kicker,.eot-splash-caption{display:none}.eot-splash-brand{font-size:22px}.eot-splash-progress-wrap{margin-top:16px}}
    @media(max-height:480px) and (orientation:landscape){.eot-splash-inner{display:grid;grid-template-columns:1fr 1.35fr;gap:0 32px;align-items:center;width:min(88%,760px);top:46%}.eot-splash-stage{grid-column:1;margin:0 auto 16px}.eot-splash-kicker{display:none}.eot-splash-brand{grid-column:1;align-self:start}.eot-splash-progress-wrap{grid-column:2;grid-row:1/3;margin:0}.eot-splash-footer{bottom:12px}}
    @media(prefers-reduced-motion:reduce){#eotStartupSplash{transition:none}.eot-splash-crane-hook{animation:none}}
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
        <p class="eot-splash-kicker">HER İMPARATORLUK BİR TEMELLE BAŞLAR</p>
        <h1 class="eot-splash-brand">EMPIRE<span>OF TRADE</span></h1>
      <div class="eot-splash-progress-wrap" role="status" aria-label="Oyun yükleniyor">
        <svg class="eot-splash-city" viewBox="0 0 350 238" role="img" aria-label="Yüklemeyle birlikte inşa edilen şehir">
          <defs>
            <linearGradient id="eotBuildingFace" x2="0" y2="1"><stop stop-color="#397184"/><stop offset=".55" stop-color="#183e53"/><stop offset="1" stop-color="#102535"/></linearGradient>
            <linearGradient id="eotGroundGlow"><stop stop-color="#64b7bf" stop-opacity="0"/><stop offset=".5" stop-color="#64b7bf" stop-opacity=".7"/><stop offset="1" stop-color="#64b7bf" stop-opacity="0"/></linearGradient>
            ${buildingPlan.map((b,i)=>'<clipPath id="eotBuildMask'+i+'"><rect id="eotBuildClip'+i+'" x="0" y="194" width="350" height="0"/></clipPath>').join('')}
          </defs>
          <g fill="#133040" opacity=".48"><path d="M8 181V124H30V99H44V181M59 181V93H73V82H92V181M112 181V62H137V181M223 181V71H242V56H257V181M279 181V108H303V87H317V181M328 181V136H343V181"/></g>
          <path d="M6 194L31 179H322L347 194 322 222H31Z" fill="#102735" stroke="#355362" stroke-width=".6"/>
          <path d="M6 194L31 222H322L347 194V199L322 227H31L6 199Z" fill="#071822"/>
          <path d="M18 200H334M25 210H328" stroke="#49616c" stroke-width=".7"/>
          <path d="M35 205H315" stroke="#b9a778" stroke-width=".7" stroke-dasharray="9 7" opacity=".7"/>
          <path d="M6 194H344" stroke="url(#eotGroundGlow)"/>
          ${buildingPlan.map((b,i)=>{
            const y=194-b.h;
            let windows='';
            for(let floor=1;floor<Math.floor(b.h/15);floor++)windows+='<path d="M'+b.x+' '+(194-floor*15)+'h'+b.w+'" stroke="#7598a8" stroke-opacity=".24" stroke-width=".6"/>';
            windows+='<path d="M'+(b.x+3)+' '+(y+2)+'v'+(b.h-2)+'" stroke="#8fc7d1" stroke-opacity=".5" stroke-width="1"/>';
            for(let row=0;row<Math.floor((b.h-20)/15);row++)for(let col=0;col<3;col++)windows+='<rect class="eot-splash-window" x="'+(b.x+8+col*12)+'" y="'+(y+12+row*15)+'" width="5" height="7" rx="1"/>';
            return '<g fill="none" stroke="#456477" stroke-opacity=".3" stroke-dasharray="3 5"><rect x="'+b.x+'" y="'+y+'" width="'+b.w+'" height="'+b.h+'"/></g><g class="eot-splash-building" clip-path="url(#eotBuildMask'+i+')"><path d="M'+b.x+' '+y+'l8 -6h'+b.w+'l-8 6Z" fill="#54818c"/><path d="M'+(b.x+b.w)+' '+y+'l8 -6v'+b.h+'l-8 6Z" fill="#0b202e"/><rect x="'+b.x+'" y="'+y+'" width="'+b.w+'" height="'+b.h+'" fill="url(#eotBuildingFace)" stroke="#547d8b" stroke-width=".6"/>'+windows+'<rect x="'+(b.x+b.w/2-5)+'" y="181" width="10" height="13" fill="#0a1b26"/></g>';
          }).join('')}
          <g fill="none" stroke="#bdab80" stroke-width="1.3" opacity=".7"><path d="M207 194V16M177 25H260L207 16ZM211 25V194M254 25V48"/><path class="eot-splash-crane-hook" d="M254 48v18m-3 0v5h6v-5"/><path d="M207 40l4 12-4 12 4 12-4 12 4 12-4 12 4 12-4 12 4 12-4 12" stroke-width=".7"/></g>
          <g fill="#203f47" stroke="#50736c" stroke-width=".5"><ellipse cx="17" cy="188" rx="5" ry="8"/><ellipse cx="336" cy="187" rx="5" ry="9"/></g>
          <g stroke="#729a9f" stroke-width=".8"><path d="M17 190v6M336 190v6M74 213v-13h5M269 213v-13h5"/></g>
          <g fill="#f0d49a"><circle cx="79" cy="200" r="1.6"/><circle cx="274" cy="200" r="1.6"/></g>
        </svg>
        <div class="eot-splash-progress-head"><span id="eotSplashPhase">Temeller atılıyor</span><span class="eot-splash-percent" id="eotSplashPercent">%0</span></div>
        <p class="eot-splash-caption">İmparatorluğun adım adım yükseliyor.</p>
      </div>
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
    const display=Math.max(0,Math.min(100,Number(v)||0));
    shown=Math.max(shown,display);
    const visible=Math.max(0,Math.min(100,Math.round(shown)));
    buildingClips.forEach((clip,i)=>{
      if(!clip)return;
      const b=buildingPlan[i];
      const fraction=Math.max(0,Math.min(1,(shown-b.start)/40));
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