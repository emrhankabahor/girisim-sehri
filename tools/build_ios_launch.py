"""Build the iPhone 414x896 @3x launch asset from the official game logo.
Matches the initial HTML shell. No player data or game logic is involved.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
ROOT = Path(__file__).resolve().parents[1]

def build():
    scale = 3
    image = Image.new('RGB', (414*scale, 896*scale), '#06152f')
    logo = Image.open(ROOT/'assets/logo-v221-512.png').convert('RGBA').resize((288,288), Image.Resampling.LANCZOS)
    # The initial HTML shell has a centered 96px logo, title and status line.
    image.paste(logo, ((image.width-288)//2, 1077), logo)
    draw = ImageDraw.Draw(image)
    font_dir = Path('/usr/share/fonts/truetype/dejavu')
    title = ImageFont.truetype(str(font_dir/'DejaVuSans-Bold.ttf'), 54)
    status = ImageFont.truetype(str(font_dir/'DejaVuSans.ttf'), 36)
    draw.text((image.width//2, 1437), 'EMPIRE OF TRADE', font=title, fill='#ffd34f', anchor='mm')
    draw.text((image.width//2, 1542), 'Oyun hazırlanıyor…', font=status, fill='#bdcee6', anchor='mm')
    target = ROOT/'ios-startup-1242x2688.png'
    image.save(target, optimize=True)
    with Image.open(target) as check:
        check.verify()
    print('Verified iOS launch PNG:', target.name)

if __name__ == '__main__':
    build()
