#!/usr/bin/env python3
"""
Genera íconos PWA desde el logo existente.
Ejecutar en tu PC o en PythonAnywhere con Pillow instalado:
  pip install Pillow
  python3 generate_icons.py

Asume que tienes /public/logo.png en tu proyecto Next.js.
Genera los íconos en /public/icons/
"""

from PIL import Image
import os

# Ajusta esta ruta al logo de tu proyecto
LOGO_PATH = 'public/logo.png'
OUTPUT_DIR = 'public/icons'

SIZES = [72, 96, 128, 144, 152, 192, 384, 512]

def generate_icons():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    try:
        img = Image.open(LOGO_PATH)
    except FileNotFoundError:
        print(f"No se encontró {LOGO_PATH}")
        print("Ajusta LOGO_PATH al path correcto de tu logo")
        return
    
    # Convertir a RGBA si no lo es
    if img.mode != 'RGBA':
        img = img.convert('RGBA')
    
    for size in SIZES:
        resized = img.resize((size, size), Image.LANCZOS)
        output_path = os.path.join(OUTPUT_DIR, f'icon-{size}x{size}.png')
        resized.save(output_path, 'PNG')
        print(f'✅ {output_path} ({size}x{size})')
    
    print(f'\n🎉 {len(SIZES)} íconos generados en {OUTPUT_DIR}/')

if __name__ == '__main__':
    generate_icons()
