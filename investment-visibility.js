/* Arayüz görünürlük ve profil rehberi yamaları. */
(function(){
  function norm(s){return String(s||'').toLocaleLowerCase('tr-TR').replace(/ı/g,'i').replace(/ş/g,'s').replace(/ğ/g,'g').replace(/ü/g,'u').replace(/ö/g,'o').replace(/ç/g,'c').replace(/\s+/g,' ').trim()}

  function hideStockResearch(){
    document.querySelectorAll('a,button,[role="button"],.menu-card,.finance-card,.info-card,.asset-card,.home-main-card,.item-card,.investment-card,.quick-btn,li').forEach(el=>{
      const t=norm(el.textContent);
      if(t.includes('hisse arastirma')||t.includes('hisse arastir')||t.includes('hisse analizi')){
        const card=el.closest('.menu-card,.finance-card,.info-card,.asset-card,.home-main-card,.item-card,.investment-card,li')||el;
        card.style.setProperty('display','none','important');
        card.setAttribute('data-stock-research-hidden','1');
      }
    });
  }

  function upgradeProfileGuide(){
    const profile=document.getElementById('profile');
    if(profile){
      const characterCard=[...profile.querySelectorAll('.menu-card')].find(card=>norm(card.textContent).includes('karakter'));
      if(characterCard && characterCard.dataset.reputationGuide!=='1'){
        characterCard.dataset.reputationGuide='1';
        characterCard.setAttribute('href','#character');
        const icon=characterCard.querySelector('.iconbox');
        const title=characterCard.querySelector('h4');
        const text=characterCard.querySelector('p');
        if(icon) icon.textContent='🏆';
        if(title) title.textContent='Temel Bilgiler';
        if(text) text.textContent='İtibar kazanma, seviye ve kariyer rehberi.';
      }
      const subtitle=profile.querySelector('.panel-title p');
      if(subtitle && norm(subtitle.textContent).includes('karakter')) subtitle.textContent='İtibar, kariyer gelişimi ve sahip olduğun varlıklar';
    }

    const guide=document.getElementById('character');
    if(guide && guide.dataset.reputationGuide!=='1'){
      guide.dataset.reputationGuide='1';
      const title=guide.querySelector('.panel-title h2');
      const subtitle=guide.querySelector('.panel-title p');
      if(title) title.textContent='Temel Bilgiler';
      if(subtitle) subtitle.textContent='İtibar, seviye ve kariyer gelişim rehberi';

      const hero=guide.querySelector('.character-hero');
      if(hero){
        hero.innerHTML='<div class="avatar big">🏆</div><div><b>İtibar & Kariyer Rehberi</b><span>Empire of Trade temel oyun bilgileri</span></div>';
      }

      const metric=guide.querySelector('.metric-grid');
      if(metric) metric.remove();

      guide.querySelectorAll('.info-card').forEach(el=>el.remove());

      const cards=document.createElement('div');
      cards.className='profile-guide-list';
      cards.innerHTML=`
        <div class="info-card"><strong>🏆 İtibar nasıl kazanılır?</strong><p>Kredilerini zamanında öde, işletmelerini düzenli yönet, üretim ve ticaret yap, başarılı projeler tamamla ve finansal yükümlülüklerini aksatma. Güvenilir bir iş geçmişi itibarını yükseltir.</p></div>
        <div class="info-card"><strong>⚠️ İtibar neden düşer?</strong><p>Geciken kredi ödemeleri, kontrolsüz borçlanma, başarısız işletme yönetimi ve ödeme yükümlülüklerini yerine getirmemek itibarını olumsuz etkileyebilir.</p></div>
        <div class="info-card"><strong>📈 Seviye ve XP</strong><p>Ticaret, yatırım, şirket yönetimi ve görevlerde ilerledikçe XP kazanırsın. Seviye yükseldikçe daha büyük iş fırsatlarına ve gelişmiş sistemlere erişim için kariyerin güçlenir.</p></div>
        <div class="info-card"><strong>💳 Kredi puanı</strong><p>Düzenli ödeme geçmişi kredi puanının temelidir. Daha yüksek kredi puanı; daha iyi banka teklifleri, daha yüksek limitler ve daha avantajlı finansman koşulları için önemlidir.</p></div>
        <div class="info-card"><strong>💰 Nakit akışı</strong><p>Sadece toplam servete odaklanma. Aylık gelirinin giderlerini karşılayabildiğinden emin ol. Güçlü nakit akışı yeni yatırımlar yaparken seni borç krizinden korur.</p></div>
        <div class="info-card"><strong>🏢 Sağlam büyüme stratejisi</strong><p>Küçük ve sürdürülebilir adımlarla ilerle. Önce gelir üreten varlıklar oluştur, ardından şirketlerini büyüt ve büyük yatırımlara geçmeden önce yeterli nakit rezervi bırak.</p></div>`;
      guide.appendChild(cards);
    }
  }

  function applyAll(){
    hideStockResearch();
    upgradeProfileGuide();
  }

  const obs=new MutationObserver(applyAll);
  obs.observe(document.body,{childList:true,subtree:true});
  window.addEventListener('hashchange',()=>setTimeout(applyAll,0));
  setInterval(applyAll,1000);
  setTimeout(applyAll,0);
})();
