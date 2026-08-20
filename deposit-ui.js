/* Empire of Trade • 24 Saatlik Vadeli Hesap */
(function(){
  'use strict';
  if(window.__eotDepositUiLoaded)return;
  window.__eotDepositUiLoaded=true;

  const FIXED_RATE=0.99;
  const money=n=>'₺'+Number(n||0).toLocaleString('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:2});

  function getDeposits(){
    try{if(typeof deposits!=='undefined'&&Array.isArray(deposits))return deposits;}catch(_){}
    try{return JSON.parse(localStorage.getItem('gs113_deposits')||'[]')||[];}catch(_){return [];}
  }
  function stats(){
    const list=getDeposits();
    const principal=list.reduce((s,d)=>s+Number(d.amount||0),0);
    const earnings=list.reduce((s,d)=>s+Number(d.ret||0),0);
    const next=list.length?Math.min(...list.map(d=>Number(d.maturity||0)).filter(Boolean)):0;
    return {principal,earnings,next,count:list.length};
  }
  function installStyle(){
    if(document.getElementById('eot-deposit-ref-style'))return;
    const s=document.createElement('style');
    s.id='eot-deposit-ref-style';
    s.textContent=`
      #deposits .deposit-card,#deposits .portfolio-box{display:none!important}
      #deposits .eot-deposit-panel{position:relative;overflow:hidden;margin:14px 0 22px;padding:17px;border:1px solid rgba(93,187,232,.22);border-radius:25px;background:linear-gradient(155deg,#102d49 0%,#0a2238 55%,#081a2b 100%);box-shadow:0 18px 46px rgba(0,0,0,.24)}
      #deposits .eot-deposit-panel:before{content:"";position:absolute;right:-86px;top:-105px;width:235px;height:235px;border-radius:50%;background:radial-gradient(circle,rgba(51,198,214,.17),rgba(49,112,205,.06) 48%,transparent 71%);pointer-events:none}
      #deposits .eot-deposit-panel:after{content:"";position:absolute;left:-80px;bottom:-130px;width:190px;height:190px;border-radius:50%;background:radial-gradient(circle,rgba(56,190,139,.08),transparent 70%);pointer-events:none}
      #deposits .eot-deposit-title{position:relative;z-index:1;margin-bottom:14px}
      #deposits .eot-deposit-heading small{display:block;color:#6fd9ea;font-size:7px;font-weight:900;letter-spacing:.2em;margin-bottom:5px}
      #deposits .eot-deposit-heading h2{margin:0;color:#fff;font-size:22px;line-height:1.08;letter-spacing:-.025em}

      #deposits .eot-deposit-balance-hero{position:relative;z-index:1;padding:16px 17px;margin-bottom:10px;border:1px solid rgba(91,174,227,.18);border-radius:18px;background:linear-gradient(135deg,rgba(25,68,103,.80),rgba(12,37,59,.72));box-shadow:inset 0 1px 0 rgba(255,255,255,.035),0 10px 24px rgba(0,0,0,.10)}
      #deposits .eot-deposit-balance-label{display:block;color:#91a9bd;font-size:7px;font-weight:900;letter-spacing:.13em}
      #deposits .eot-deposit-balance-value{display:block;margin-top:8px;color:#fff;font-size:21px;font-weight:950;letter-spacing:-.04em;line-height:1.05;overflow-wrap:anywhere}

      #deposits .eot-deposit-summary{position:relative;z-index:1;display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-bottom:14px}
      #deposits .eot-deposit-stat{min-width:0;min-height:66px;padding:12px 13px;border:1px solid rgba(255,255,255,.07);border-radius:16px;background:linear-gradient(145deg,rgba(7,26,43,.72),rgba(4,17,29,.45));display:flex;flex-direction:column;justify-content:center;box-shadow:inset 0 1px 0 rgba(255,255,255,.025)}
      #deposits .eot-deposit-stat span{display:block;color:#809bb1;font-size:6.5px;font-weight:900;letter-spacing:.1em;line-height:1.2}
      #deposits .eot-deposit-stat b{display:block;margin-top:7px;color:#fff;font-size:11px;line-height:1.22;overflow-wrap:anywhere}
      #deposits .eot-deposit-stat-earn{background:linear-gradient(145deg,rgba(18,77,67,.30),rgba(4,17,29,.42))}
      #deposits .eot-deposit-stat-earn b{color:#6fe1b6}

      #deposits .eot-deposit-form{position:relative;z-index:1;padding:13px;border:1px solid rgba(255,255,255,.07);border-radius:18px;background:linear-gradient(145deg,rgba(4,18,31,.44),rgba(3,14,25,.32));box-shadow:inset 0 1px 0 rgba(255,255,255,.025)}
      #deposits .eot-deposit-form-head{margin-bottom:9px;color:#d8e8f3;font-size:8px;font-weight:900;letter-spacing:.11em}
      #deposits .eot-deposit-field{margin:0}
      #deposits .eot-deposit-field input{width:100%;box-sizing:border-box;min-height:58px;padding:0 16px;border:1.5px solid rgba(185,205,228,.70);border-radius:15px;background:#f8fafc;color:#07111d;font-size:18px;font-weight:900;outline:none;box-shadow:inset 0 1px 0 rgba(255,255,255,.85)}
      #deposits .eot-deposit-field input:focus{border-color:#4fc7db;box-shadow:0 0 0 3px rgba(79,199,219,.12)}
      #deposits .eot-deposit-actions{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:13px}
      #deposits .eot-deposit-actions button{min-height:54px;border:0;border-radius:16px;color:#fff;font-size:14px;font-weight:950;box-shadow:0 7px 18px rgba(0,0,0,.16)}
      #deposits .eot-deposit-put{background:linear-gradient(135deg,#28b94f,#66d86f)}
      #deposits .eot-deposit-take{background:linear-gradient(135deg,#2472c8,#438fe8)}

      @media(max-width:430px){
        #deposits .eot-deposit-panel{padding:14px}
        #deposits .eot-deposit-heading h2{font-size:20px}
        #deposits .eot-deposit-balance-hero{padding:14px 15px}
        #deposits .eot-deposit-balance-value{font-size:19px}
        #deposits .eot-deposit-summary{gap:7px}
        #deposits .eot-deposit-stat{min-height:62px;padding:10px 11px}
        #deposits .eot-deposit-stat b{font-size:10px}
        #deposits .eot-deposit-form{padding:11px}
        #deposits .eot-deposit-actions{gap:8px}
      }
    `;
    document.head.appendChild(s);
  }

  function formatDateTime(ts){
    if(!ts)return '—';
    return new Date(ts).toLocaleString('tr-TR',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});
  }
  function refresh(panel){
    if(!panel)return;
    if(typeof window.processMaturedDeposits==='function')window.processMaturedDeposits(false);
    const st=stats();
    const balance=panel.querySelector('[data-dep-balance]');
    const earn=panel.querySelector('[data-dep-earn]');
    const maturity=panel.querySelector('[data-dep-maturity]');
    if(balance)balance.textContent=money(st.principal);
    if(earn)earn.textContent=money(st.earnings);
    if(maturity)maturity.textContent=formatDateTime(st.next);
  }

  function mount(){
    const screen=document.getElementById('deposits');
    if(!screen)return;
    installStyle();
    const old=screen.querySelector('.eot-deposit-simple');if(old)old.remove();
    let panel=screen.querySelector('.eot-deposit-panel');
    if(!panel){
      panel=document.createElement('div');
      panel.className='eot-deposit-panel';
      panel.innerHTML=`
        <div class="eot-deposit-title">
          <div class="eot-deposit-heading"><small>GÜVENLİ BİRİKİM</small><h2>Vadeli Hesap</h2></div>
        </div>
        <div class="eot-deposit-balance-hero">
          <span class="eot-deposit-balance-label">HESAP BAKİYESİ</span>
          <b class="eot-deposit-balance-value" data-dep-balance>₺0,00</b>
        </div>
        <div class="eot-deposit-summary">
          <div class="eot-deposit-stat eot-deposit-stat-earn"><span>TOPLAM KAZANÇ</span><b data-dep-earn>₺0,00</b></div>
          <div class="eot-deposit-stat"><span>GELİR ZAMANI</span><b data-dep-maturity>—</b></div>
        </div>
        <div class="eot-deposit-form">
          <div class="eot-deposit-form-head">YATIRILACAK TUTAR</div>
          <div class="eot-deposit-field"><input id="eotDepositAmount" type="number" min="1" step="1000" inputmode="decimal" placeholder="Tutar girmek için dokun"></div>
          <div class="eot-deposit-actions"><button class="eot-deposit-put" type="button">Para Yatır</button><button class="eot-deposit-take" type="button">Para Çek</button></div>
        </div>`;
      const portfolio=screen.querySelector('.portfolio-box');
      if(portfolio)screen.insertBefore(panel,portfolio);else screen.appendChild(panel);

      panel.querySelector('.eot-deposit-put').addEventListener('click',()=>{
        const amount=Number(panel.querySelector('#eotDepositAmount').value||0);
        if(!Number.isFinite(amount)||amount<=0){if(typeof toast==='function')toast('Geçerli bir tutar gir');else alert('Geçerli bir tutar gir');return;}
        if(typeof window.open24HourDeposit==='function')window.open24HourDeposit('eotDepositAmount');
        else if(typeof window.openDeposit==='function')window.openDeposit(1,FIXED_RATE,'eotDepositAmount');
        else {if(typeof toast==='function')toast('Vadeli hesap sistemi henüz hazır değil');return;}
        refresh(panel);
      });
      panel.querySelector('.eot-deposit-take').addEventListener('click',()=>{
        if(typeof window.withdrawAllDepositsEarly==='function')window.withdrawAllDepositsEarly();
        else if(typeof toast==='function')toast('Para çekme sistemi henüz hazır değil');
        refresh(panel);
      });
    }
    refresh(panel);
  }

  window.addEventListener('eot:deposit-updated',()=>{const p=document.querySelector('#deposits .eot-deposit-panel');if(p)refresh(p)});
  window.addEventListener('hashchange',mount);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)mount()});
  mount();
  setTimeout(mount,120);
  setInterval(()=>{const p=document.querySelector('#deposits .eot-deposit-panel');if(p&&location.hash==='#deposits'&&!document.hidden)refresh(p)},30000);
})();
