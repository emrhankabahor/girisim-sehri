# Empire of Trade — menü kaynak düzeni

Bu ayrım v222'nin çalışan kodunu değiştirmeden yapılmıştır. `src/` düzenlenebilir
kaynak, kökteki `app.js`, `bootstrap.js`, CSS, ek JS ve `content-*.html` dosyaları
uyumluluk çıktılarıdır. Oyunun yüklediği dosya adresleri, ekran kimlikleri,
fonksiyon kapsamları, başlangıç sırası ve localStorage anahtarları değişmedi.

## Bölümler

| Ana menü | Kaynak | Alt bölümler |
|---|---|---|
| Ana Sayfa | `src/ana-sayfa/` | Dashboard, profil özeti, cüzdan, varlık sayıları ve işletme kısayolları |
| Pazar | `src/pazar/` | Arsa → iller/ilçeler, gayrimenkul → iller/ilçeler, galeri → sıfır/ikinci el/markalar, canlı ilanlar, teklifler, pazarlık |
| İşletmeler | `src/isletmeler/` | Mağazalar → perakende/market/restoran, fabrika, inşaat → planlama/projeler/arsa geliştirme, galeri, gayrimenkul → tadilat, şirket → kuruluş, personel, stok, rakipler, ihaleler |
| Finans | `src/finans/` | Banka, krediler → bankalar/teminat/ticari/yapılandırma, kredi kartı, mevduat, borsa → araştırma, kripto, altın, halka arz, bütçe, raporlar, vergiler, işlem geçmişi, ekonomi → haberler, kriz |
| Profil | `src/profil/` | Hesap, karakter, varlıklar, garaj → servis, görevler, başarımlar, bildirimler, servet geçmişi, çok oyunculu |
| Ortak | `src/ortak/` | Kayıt, başlangıç, gezinme, paylaşılan durum/ekran yardımcıları, stiller ve birden fazla alanı etkileyen eklentiler |

Ana Sayfa'daki **Mağazalar / Fabrika / İnşaat / Galeri / Gayrimenkul / Arsa**
kısayollarının sahiplik haritası `src/ana-sayfa/menu.json` içindedir.
Diğer ana menülerin de kendi `menu.json` dosyaları vardır. Bunlar geliştirici
haritasıdır; oyuncunun gezinmesini değiştirmek için kullanılmaz.
Ortak bir ekran kopyalanmaz: örneğin Profil'den açılan işlem geçmişi Finans'taki
tek kaynağa, Ana Sayfa'daki Arsa kısayolu Pazar'daki tek kaynağa işaret eder.

## Düzenleme akışı

1. Ekranın hash kimliğini `src/routes.json` içinde ara. `source` alanı ilgili
   `views.html` dosyasını, `links` alanı ekrandaki mevcut bağlantıları gösterir.
2. Aynı bölümdeki `app.js` işlevleri veya adı açık JS eklentisini düzenle.
   Dashboard üretimi `src/ana-sayfa/bootstrap.js` içindedir.
3. `python tools/build_menu_sources.py` çalıştır.
4. `python tools/build_menu_sources.py --check`,
   `python -m unittest discover -s tests -p 'menu_*.py'` ve
   `node --test tests/*.test.cjs` çalıştır.
5. Kaynak ve üretilen çıktıları birlikte commit et. Oyuncuya giden değişikliklerde
   normal sürüm/önbellek yükseltme süreci ayrıca uygulanır. Bu refaktörde çıktı
   değişmediği için oynanabilir sürüm v222 olarak kalır.

`EOT_PART` / `EOT_END` işaretleri derleyicinin sıralama sınırlarıdır. İçlerindeki
kodu düzenle; işaretleri silme. Yeni ekran/işlev eklerken `src/menu-build.json`
içindeki ilgili `html_order` / `outputs.*.parts` sırasına da ekle. Yeni ekranı
`src/routes.json` ve ilgili `menu.json` haritasına kaydet.
`src/menu-build.json` yalnızca derleme sırasını belirler. Tarayıcıda binlerce
kaynak isteği veya eval çalıştırılmaz; mevcut altı HTML isteği korunur.

## Güvence ve sınırlar

- `src/migration-baseline.json` bu geçiş öncesindeki dosyaların SHA-256 özetidir.
  `python tools/build_menu_sources.py --check --baseline` yalnızca bu ilk
  geçişin birebir eşitliğini doğrular. Gelecekte bilinçli davranış değişiklikleri
  yapıldığında baseline ile eşitlik beklenmez; normal CI `--check` kullanır.
- Kaynak/çıktı sapması, kayıp/tekrarlı bloklar ve ekran envanteri CI'da denetlenir.
- Bu menü odaklı bir **kaynak kodu ayrımıdır**. Çalışma zamanındaki global
  bağımlılıklar henüz bağımsız ES modüllerine dönüştürülmedi. Böylece mevcut
  eklentilerin global işlevlere erişimi ve kayıtlar korunur.
- `tools/migrate_menu_sources.py` yalnızca ilk geçiş içindir; mevcut kaynak
  manifesti varsa yeniden yazmaz. `tools/modularize.py` eski v164 dönüşüm
  aracıdır; yeni düzeni oluşturmak/düzenlemek için kullanılmaz.
