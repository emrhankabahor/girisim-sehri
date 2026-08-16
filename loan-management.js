/* Girişim Şehri V1.69 • Kredi Yönetimi */
(function(){
  if(window.__eotLoanManagementLoaded)return;
  window.__eotLoanManagementLoaded=true;

  function fmt(n){try{return '₺'+Number(n||0).toLocaleString('tr-TR',{maximumFractionDigits:2})}catch(e){return '₺0'}}
  function list(){try{return Array.isArray(loans)?loans.map((l,i)=>({l,i})).filter(x=>!x.l.closed&&Number(x.l.remaining||0)>.01):[]}catch(e){return []}}
  function ensureStyle(){if(document.getElementById('loanMgmtStyle'))return;const s=document.createElement('style');s.id='loanMgmtStyle';s.textContent=`
  .loan-mgmt-overlay{position:fixed;inset:0;z-index:99999;background:rgba(2,8,20,.82);backdrop-filter:blur(8px);display:none;align-items:flex-end;justify-content:center}.loan-mgmt-overlay.open{display:flex}
  .loan-mgmt-sheet{width:min(760px,100%);max-height:88vh;overflow:auto;border-radius:24px 24px 0 0;background:#081522;border:1px solid rgba(148,163,184,.2);padding:18px 16px calc(24px + env(safe-area-inset-bottom));box-shadow:0 -18px 50px rgba(0,0,0,.35)}
  .loan-mgmt-head{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:14px}.loan-mgmt-head h3{margin:0;font-size:18px}.loan-mgmt-close{width:38px;height:38px;border-radius:12px;border:1px solid rgba(148,163,184,.22);background:#102235;color:white;font-size:20px}
  .loan-mgmt-empty{padding:28px 12px;text-align:center;color:#91a4bb;border:1px dashed rgba(148,163,184,.2);border-radius:18px}.loan-mgmt-card{padding:15px;border:1px solid rgba(96,165,250,.2);border-radius:18px;background:linear-gradient(145deg,#0e2236,#0a1a2a);margin-bottom:12px}.loan-mgmt-bank{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}.loan-mgmt-bank b{font-size:14px}.loan-mgmt-status{font-size:9px;padding:5px 8px;border-radius:999px;background:rgba(45,212,191,.1);color:#78e1c9}.loan-mgmt-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px}.loan-mgmt-stat{padding:10px;border-radius:12px;background:rgba(255,255,255,.035)}.loan-mgmt-stat span{display:block;font-size:8px;color:#8ea2ba;margin-bottom:4px}.loan-mgmt-stat b{font-size:11px}.loan-mgmt-due{margin:11px 0;font-size:10px;color:#aebed0}.loan-mgmt-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px}.loan-mgmt-actions button{padding:11px;border:0;border-radius:12px;font-weight:800;font-size:10px}.loan-pay{background:#173b63;color:#dbeafe}.loan-close{background:#7f1d2d;color:#ffe4e6}.loan-close-note{margin-top:8px;font-size:9px;line-height:1.45;color:#91a4bb}
  `;document.head.appendChild(s)}
  function ensureOverlay(){if(document.getElementById('loanMgmtOverlay'))return;const o=document.createElement('div');o.id='loanMgmtOverlay';o.className='loan-mgmt-overlay';o.innerHTML='<div class="loan-mgmt-sheet"><div class="loan-mgmt-head"><div><h3>Kredi Yönetimi</h3><div style="font-size:10px;color:#91a4bb;margin-top:3px">Aktif kredilerini görüntüle ve yönet</div></div><button class="loan-mgmt-close" onclick="window.closeLoanManager()">×</button></div><div id="loanMgmtList"></div></div>';o.addEventListener('click',e=>{if(e.target===o)window.closeLoanManager()});document.body.appendChild(o)}
  function renderManager(){ensureStyle();ensureOverlay();const root=document.getElementById('loanMgmtList');if(!root)return;const arr=list();if(!arr.length){root.innerHTML='<div class="loan-mgmt-empty">Aktif kredin bulunmuyor.</div>';return}root.innerHTML=arr.map(({l,i})=>{const inst=Math.min(Number(l.installment||0),Number(l.remaining||0)),due=Number(l.nextDue||0),late=due&&Date.now()>due;return '<div class="loan-mgmt-card"><div class="loan-mgmt-bank"><div><b>'+String(l.name||'Banka Kredisi')+'</b><div style="font-size:9px;color:#91a4bb;margin-top:3px">Kredi hesabı</div></div><span class="loan-mgmt-status">'+(late?'GECİKMİŞ':'AKTİF')+'</span></div><div class="loan-mgmt-grid"><div class="loan-mgmt-stat"><span>KALAN BORÇ</span><b>'+fmt(l.remaining)+'</b></div><div class="loan-mgmt-stat"><span>SONRAKİ TAKSİT</span><b>'+fmt(inst)+'</b></div><div class="loan-mgmt-stat"><span>KULLANILAN KREDİ</span><b>'+fmt(l.amount||l.requestedAmount||0)+'</b></div><div class="loan-mgmt-stat"><span>ERKEN KAPAMA</span><b>'+fmt(l.remaining)+'</b></div></div><div class="loan-mgmt-due">Sonraki ödeme: <b>'+(due?new Date(due).toLocaleString('tr-TR'):'—')+'</b></div><div class="loan-mgmt-actions"><button class="loan-pay" onclick="window.loanMgmtPay('+i+')">Taksiti Öde</button><button class="loan-close" onclick="window.loanMgmtClose('+i+')">Krediyi Erken Kapat</button></div><div class="loan-close-note">Erken kapama işleminde kalan borcun tamamı tek seferde nakit bakiyenden tahsil edilir.</div></div>'}).join('')}
  window.openLoanManager=function(){renderManager();document.getElementById('loanMgmtOverlay')?.classList.add('open')};window.closeLoanManager=function(){document.getElementById('loanMgmtOverlay')?.classList.remove('open')};window.loanMgmtPay=function(i){if(typeof payInstallment==='function')payInstallment(i);setTimeout(renderManager,80)};window.loanMgmtClose=function(i){const arr=list(),item=arr.find(x=>x.i===i);if(!item)return;const amt=Number(item.l.remaining||0);if(!confirm('Bu krediyi '+fmt(amt)+' ödeyerek erken kapatmak istiyor musun?'))return;if(typeof closeLoan==='function')closeLoan(i);setTimeout(renderManager,80)};

  function addLauncher(){
    const finance=document.getElementById('finance');if(!finance)return;
    const heads=Array.from(finance.querySelectorAll('.section-head'));
    const banking=heads.find(h=>(h.textContent||'').toLocaleLowerCase('tr-TR').includes('bankacılık'));
    const grid=banking&&banking.nextElementSibling;
    if(!grid)return;

    let a=document.getElementById('loanMgmtLauncher')||grid.querySelector('[data-eot-banking-action="deposits"]');
    if(!a){
      a=document.createElement('a');
      a.id='loanMgmtLauncher';
      a.className='menu-card';
      a.dataset.eotBankingAction='deposits';
      grid.appendChild(a);
    }
    if(a.tagName!=='A')return;
    a.href='#deposits';
    a.onclick=null;
    a.innerHTML='<div class="iconbox">💰</div><h4>Vadeli Hesap</h4><p>Nakitini vadeli değerlendir.</p><span class="arrow">›</span>';
  }

  function refresh(){try{addLauncher();if(document.getElementById('loanMgmtOverlay')?.classList.contains('open'))renderManager()}catch(e){}}

  // İçerik bootstrap tarafından eklendiği anda kartı oluştur; 2-3 saniyelik gecikmeyi kaldır.
  const observer=new MutationObserver(()=>refresh());
  const observe=()=>{try{observer.observe(document.getElementById('app-root')||document.body,{childList:true,subtree:true})}catch(e){}};
  if(document.body)observe();else document.addEventListener('DOMContentLoaded',observe,{once:true});
  window.addEventListener('hashchange',refresh);
  refresh();
  setInterval(refresh,2000);
})();

/* Ek güvenlik katmanlarını ana oyun fonksiyonları yüklendikten sonra ekle. */
(function(){
  function loadOnce(src,attr){
    if(document.querySelector('script['+attr+']'))return;
    const s=document.createElement('script');
    s.src=src+'?v=190&_='+Date.now();
    s.setAttribute(attr,'1');
    document.body.appendChild(s);
  }
  loadOnce('construction-fixes.js','data-eot-construction-fixes');
  loadOnce('investment-fixes.js','data-eot-investment-fixes');
})();
