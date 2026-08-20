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
      #deposits .eot-deposit-panel{position:relative;overflow:hidden;margin:14px 0 22px;padding:17px;border:1px solid rgba(95,188,231,.22);border-radius:25px;background:linear-gradient(155deg,#102d49 0%,#0b2238 52%,#081a2b 100%);box-shadow:0 18px 46px rgba(0,0,0,.24)}
      #deposits .eot-deposit-panel:before{content:"";position:absolute;right:-78px;top:-95px;width:220px;height:220px;border-radius:50%;background:radial-gradient(circle,rgba(47,207,215,.16),rgba(44,119,207,.07) 47%,transparent 70%);pointer-events:none}
      #deposits .eot-deposit-panel:after{content:"";position:absolute;left:-70px;bottom:-120px;width:180px;height:180px;border-radius:50%;background:radial-gradient(circle,rgba(54,191,138,.08),transparent 70%);pointer-events:none}
      #deposits .eot-deposit-title{position:relative;z-index:1;display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:13px}
      #deposits .eot-deposit-heading{min-width:0}
      #deposits .eot-deposit-heading small{display:block;color:#6fd9ea;font-size:7px;font-weight:900;letter-spacing:.2em;margin-bottom:5px}
      #deposits .eot-deposit-heading h2{margin:0;color:#fff;font-size:22px;line-height:1.08;letter-spacing:-.025em}
      #deposits .eot-deposit-badges{display:flex;align-items:center;gap:7px}
      #deposits .eot-deposit-term{padding:7px 10px;border-radius:999px;border:1px solid rgba(96,217,227,.22);background:rgba(25,151,170,.12);color:#9aeaf2;font-size:7px;font-weight:900;letter-spacing:.055em;white-space:nowrap;box-shadow:inset 0 1px 0 rgba(255,255,255,.04)}
      #deposits .eot-deposit-info{width:34px;height:34px;flex:0 0 34px;border-radius:12px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.07);color:#edf9ff;font-weight:900;font-size:16px}

      #deposits .eot-deposit-balance-hero{position:relative;z-index:1;padding:15px 16px 14px;margin-bottom:9px;border:1px solid rgba(91,174,227,.17);border-radius:18px;background:linear-gradient(135deg,rgba(25,68,103,.78),rgba(12,37,59,.72));box-shadow:inset 0 1px 0 rgba(255,255,255,.035)}
      #deposits .eot-deposit-balance-top{display:flex;align-items:center;justify-content:space-between;gap:10px}
      #deposits .eot-deposit-balance-label{color:#91a9bd;font-size:7px;font-weight:900;letter-spacing:.13em}
      #deposits .eot-deposit-balance-status{display:inline-flex;align-items:center;gap:5px;color:#74dfbc;font-size:7px;font-weight:850;white-space:nowrap}
      #deposits .eot-deposit-balance-status:before{content:"";width:6px;height:6px;border-radius:50%;background:#43d5a4;box-shadow:0 0 0 4px rgba(67,213,164,.09)}
      #deposits .eot-deposit-balance-value{display:block;margin-top:8px;color:#fff;font-size:20px;font-weight:950;letter-spacing:-.04em;line-height:1.05;overflow-wrap:anywhere}
      #deposits .eot-deposit-balance-foot{margin-top:8px;color:#718da5;font-size:7px;line-height:1.35}

      #deposits .eot-deposit-summary{position:relative;z-index:1;display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px}
      #deposits .eot-deposit-stat{min-width:0;min-height:64px;padding:11px 12px;border:1px solid rgba(255,255,255,.065);border-radius:15px;background:rgba(4,17,29,.32)}
      #deposits .eot-deposit-stat span{display:block;color:#809bb1;font-size:6.5px;font-weight:900;letter-spacing:.1em;line-height:1.2}
      #deposits .eot-deposit-stat b{display:block;margin-top:7px;color:#fff;font-size:11px;line-height:1.22;overflow-wrap:anywhere}
      #deposits .eot-deposit-stat-earn{background:linear-gradient(145deg,rgba(18,77,67,.28),rgba(4,17,29,.32))}
      #deposits .eot-deposit-stat-earn b{color:#6fe1b6}

      #deposits .eot-deposit-form{position:relative;z-index:1;padding:13px;border:1px solid rgba(255,255,255,.07);border-radius:18px;background:rgba(3,14,25,.30);box-shadow:inset 0 1px 0 rgba(255,255,255,.025)}
      #deposits .eot-deposit-form-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:9px}
      #deposits .eot-deposit-form-head b{color:#d8e8f3;font-size:8px;letter-spacing:.11em}
      #deposits .eot-deposit-form-head span{color:#6fd9e9;font-size:7px;font-weight:900}
      #deposits .eot-deposit-field{margin:0}
      #deposits .eot-deposit-field input{width:100%;box-sizing:border-box;min-height:58px;padding:0 16px;border:1.5px solid rgba(185,205,228,.70);border-radius:15px;background:#f8fafc;color:#07111d;font-size:18px;font-weight:900;outline:none;box-shadow:inset 0 1px 0 rgba(255,255,255,.85)}
      #deposits .eot-deposit-field input:focus{border-color:#4fc7db;box-shadow:0 0 0 3px rgba(79,199,219,.12)}
      #deposits .eot-deposit-note{margin:10px 3px 0;color:#819bb0;font-size:8.5px;line-height:1.48;text-align:center}
      #deposits .eot-deposit-actions{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:13px}
      #deposits .eot-deposit-actions button{min-height:53px;border:0;border-radius:15px;color:#fff;font-size:14px;font-weight:950;box-shadow:0 7px 18px rgba(0,0,0,.16)}
      #deposits .eot-deposit-put{background:linear-gradient(135deg,#28b94f,#66d86f)}
      #deposits .eot-deposit-take{background:linear-gradient(135deg,#2472c8,#438fe8)}

      @media(max-width:430px){
        #deposits .eot-deposit-panel{padding:14px}
        #deposits .eot-deposit-heading h2{font-size:20px}
        #deposits .eot-deposit-term{padding:6px 8px;font-size:6.5px}
        #deposits .eot-deposit-balance-hero{padding:13px 14px 12px}
        #deposits .eot-deposit-balance-value{font-size:18px}
        #deposits .eot-deposit-stat{min-height:60px;padding:10px}
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
    const old=screen.querySelector('.eot-deposit-simple'); if(old)old.remove();
    let panel=screen.querySelector('.eot-deposit-panel');
    if(!panel){
      panel=document.createElement('div');
      panel.className='eot-deposit-panel';
      panel.innerHTML=`
        <div class="eot-deposit-title">
          <div class="eot-deposit-heading"><small>GÜVENLİ BİRİKİM</small><h2>Vadeli Hesap</h2></div>
          <div class="eot-deposit-badges"><span class="eot-deposit-term">24 SAAT • %0,99</span><button class="eot-deposit-info" type="button" aria-label="Bilgi">i</button></div>
        </div>
        <div class="eot-deposit-balance-hero">
          <div class="eot-deposit-balance-top"><span class="eot-deposit-balance-label">HESAP BAKİYESİ</span><span class="eot-deposit-balance-status">AKTİF</span></div>
          <b class="eot-deposit-balance-value" data-dep-balance>₺0,00</b>
          <div class="eot-deposit-balance-foot">Vadeli hesaptaki ana para ve vade sonunda eklenen kazanç burada tutulur.</div>
        </div>
        <div class="eot-deposit-summary">
          <div class="eot-deposit-stat eot-deposit-stat-earn"><span>TOPLAM KAZANÇ</span><b data-dep-earn>₺0,00</b></div>
          <div class="eot-deposit-stat"><span>GELİR ZAMANI</span><b data-dep-maturity>—</b></div>
        </div>
        <div class="eot-deposit-form">
          <div class="eot-deposit-form-head"><b>YATIRILACAK TUTAR</b><span>%0,99 GETİRİ</span></div>
          <div class="eot-deposit-field"><input id="eotDepositAmount" type="number" min="1" step="1000" inputmode="decimal" placeholder="Tutar girmek için dokun"></div>
          <div class="eot-deposit-note">Para yatırdığın tarih ve saatten tam 24 saat sonra ana para + %0,99 faiz vadeli hesap bakiyene eklenir. Nakit bakiyene aktarmak için Para Çek butonunu kullan.</div>
          <div class="eot-deposit-actions"><button class="eot-deposit-put" type="button">Para Yatır</button><button class="eot-deposit-take" type="button">Para Çek</button></div>
        </div>`;
      const portfolio=screen.querySelector('.portfolio-box');
      if(portfolio)screen.insertBefore(panel,portfolio);else screen.appendChild(panel);

      panel.querySelector('.eot-deposit-info').addEventListener('click',()=>{
        const msg='Vadeli hesap 24 saat çalışır. Süre sonunda ana para ve %0,99 faiz vadeli hesap bakiyende kalır. Nakit hesaba geçirmek için Para Çek butonunu kullan.';
        if(typeof toast==='function')toast(msg);else alert(msg);
      });
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
