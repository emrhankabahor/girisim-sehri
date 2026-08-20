/* Empire of Trade • Vadeli hesap özet senkronu */
(function(){
  'use strict';
  if(window.__eotDepositBalanceSync)return;
  window.__eotDepositBalanceSync=true;

  const money=n=>'₺'+Number(n||0).toLocaleString('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:2});
  function list(){try{return typeof deposits!=='undefined'&&Array.isArray(deposits)?deposits:JSON.parse(localStorage.getItem('gs113_deposits')||'[]')}catch(e){return[]}}
  function data(){
    const arr=list(),now=Date.now();
    let balance=0,expected=0,earned=0,active=0,next=0;
    arr.forEach(d=>{
      const amount=Number(d&&d.amount||0);if(amount<=0)return;
      balance+=amount;
      if(d&&d.available===true){earned+=Math.max(0,Number(d.earned||0));return;}
      active++;
      expected+=Math.max(0,Number(d&&d.ret||0));
      const m=Number(d&&d.maturity||0);if(m>now&&(!next||m<next))next=m;
    });
    return {balance,expected,earned,active,next};
  }
  function fmtDate(ts){return ts?new Date(ts).toLocaleString('tr-TR',{day:'2-digit',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit'}):'—'}
  function sync(){
    const d=data();
    const count=document.getElementById('depositCount'),total=document.getElementById('depositTotal'),ret=document.getElementById('depositReturn');
    if(count)count.textContent=d.active;
    if(total)total.textContent=money(d.balance);
    if(ret)ret.textContent=money(d.expected);
    const panel=document.querySelector('#deposits .eot-deposit-panel');
    if(panel){
      const bal=panel.querySelector('[data-dep-balance]'),earn=panel.querySelector('[data-dep-earn]'),mat=panel.querySelector('[data-dep-maturity]'),note=panel.querySelector('.eot-deposit-note');
      if(bal)bal.textContent=money(d.balance);
      if(earn)earn.textContent=money(d.expected+d.earned);
      if(mat)mat.textContent=fmtDate(d.next);
      if(note)note.textContent='Para yatırdığın tarih ve saatten tam 24 saat sonra ana para + %0,99 faiz vadeli hesap bakiyene eklenir. Nakit bakiyene aktarmak için Para Çek butonunu kullan.';
    }
  }
  window.addEventListener('eot:deposit-updated',()=>setTimeout(sync,0));
  window.addEventListener('hashchange',()=>{if(location.hash==='#deposits')setTimeout(sync,0)});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&location.hash==='#deposits')setTimeout(sync,0)});
  setTimeout(sync,0);setTimeout(sync,180);
  window.eotSyncDepositBalance=sync;
})();
