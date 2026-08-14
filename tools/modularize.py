from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
src = ROOT / 'index.html'
s = src.read_text(encoding='utf-8')

# Profilde Yaşam Standardı bağlantısını ve ekranını kaldır.
s = re.sub(r'<a class="menu-card" href="#lifestyle">.*?</a>\s*', '', s, flags=re.S)
s = re.sub(r'<section id="lifestyle" class="screen">.*?</section>\s*', '', s, count=1, flags=re.S)

# Sürüm etiketi.
s = s.replace('Demo V1.64 • Kalıcı Hesap', 'Demo V1.65 • Modüler Yapı')
s = s.replace('MOBİL DEMO • V1.64 • KALICI HESAP', 'MOBİL DEMO • V1.65 • MODÜLER YAPI')

styles = re.findall(r'<style>(.*?)</style>', s, re.S)
scripts = re.findall(r'<script>(.*?)</script>', s, re.S)
body_m = re.search(r'<body[^>]*>(.*)</body>', s, re.S)
if not styles or len(scripts) < 4 or not body_m:
    raise SystemExit('Beklenen V1.64 yapısı bulunamadı')

# İlk iki küçük script eski/tekrarlı giriş bootstrap'ları. Ana hesap kontrolü app scriptinde zaten var.
app_js = scripts[2] + '\n' + scripts[3]
body = re.sub(r'<script>.*?</script>', '', body_m.group(1), flags=re.S)

(ROOT / 'styles.css').write_text(styles[0], encoding='utf-8')
(ROOT / 'app.js').write_text(app_js, encoding='utf-8')

# Büyük statik HTML'yi GitHub bağlayıcısının rahat düzenleyebilmesi için parçalara ayır.
for old in ROOT.glob('content-*.html'):
    old.unlink()
chunk_size = 350_000
chunks = [body[i:i+chunk_size] for i in range(0, len(body), chunk_size)]
for i, chunk in enumerate(chunks, 1):
    (ROOT / f'content-{i}.html').write_text(chunk, encoding='utf-8')

files = [f'content-{i}.html' for i in range(1, len(chunks)+1)]
bootstrap = f'''(async function(){{
  const root=document.getElementById('app-root');
  try{{
    const files={files!r};
    const parts=await Promise.all(files.map(f=>fetch(f,{{cache:'no-store'}}).then(r=>{{if(!r.ok)throw new Error(f+' '+r.status);return r.text()}})));
    root.innerHTML=parts.join('');
    const script=document.createElement('script');
    script.src='app.js?v=165';
    document.body.appendChild(script);
  }}catch(err){{
    console.error(err);
    root.innerHTML='<main style="padding:24px;color:white;font-family:Arial"><h2>Girişim Şehri yüklenemedi</h2><p>Sayfayı yenileyin.</p></main>';
  }}
}})();
'''
(ROOT / 'bootstrap.js').write_text(bootstrap, encoding='utf-8')

index = '''<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover,user-scalable=no">
<meta name="theme-color" content="#07111f">
<title>Girişim Şehri Demo V1.65 • Modüler Yapı</title>
<link rel="stylesheet" href="styles.css?v=165">
</head>
<body>
<div id="app-root"></div>
<script src="bootstrap.js?v=165"></script>
</body>
</html>
'''
src.write_text(index, encoding='utf-8')

# Önceki denemeden kalmış geçici dosya varsa temizle.
tmp = ROOT / 'assets' / 'app-1.b64'
if tmp.exists():
    tmp.unlink()
try:
    (ROOT / 'assets').rmdir()
except OSError:
    pass

print(f'Modülerleştirme tamamlandı: {len(chunks)} içerik parçası')
