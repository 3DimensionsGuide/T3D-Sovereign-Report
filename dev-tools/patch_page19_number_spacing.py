#!/usr/bin/env python3
"""
T3D Page 19 — Life Path Number Spacing Fix
=============================================
The 64pt compound number ("34/7") was bleeding into the direction text
below it. Two adjustments:

  1. compoundNumber lineHeight: 1.0 → 0.92
     Tightens the glyph's own line box, pulling it up slightly and
     removing the descender overshoot that Playfair Display Bold
     produces at large sizes.

  2. numberHeroRow marginBottom: 6 → 20
     Adds clear separation between the number row and the direction
     text that follows, so there is a visible gap rather than a bleed
     even at different rendering engines/zoom levels.

Run from project root:
  python3 patch_page19_number_spacing.py
"""

import os, sys

PROJECT_ROOT = sys.argv[1] if len(sys.argv) > 1 else os.path.expanduser(
    '~/Developer/3dimensions.guide'
)
path = os.path.join(
    PROJECT_ROOT, 'src', 'lib', 'report', 'section4', 'Page19LifePath.tsx'
)

if not os.path.exists(path):
    print(f'ERROR: File not found at {path}')
    sys.exit(1)

with open(path, 'r') as f:
    content = f.read()

original = content

# Fix 1: tighten the number's own line box
old1 = """  numberHeroRow: {
    flexDirection: 'row', alignItems: 'flex-end',
    gap: 14, marginBottom: 6,
  },
  compoundNumber: {
    fontFamily: F.display, fontSize: 64, fontWeight: 700,
    color: C.emerald, lineHeight: 1.0, letterSpacing: -2,
  },"""

new1 = """  numberHeroRow: {
    flexDirection: 'row', alignItems: 'flex-end',
    gap: 14, marginBottom: 20,
  },
  compoundNumber: {
    fontFamily: F.display, fontSize: 64, fontWeight: 700,
    color: C.emerald, lineHeight: 0.92, letterSpacing: -2,
  },"""

if old1 in content:
    content = content.replace(old1, new1)
    print('✓ compoundNumber lineHeight tightened (1.0 → 0.92)')
    print('✓ numberHeroRow marginBottom increased (6 → 20)')
else:
    print('✗ Pattern not found — file may differ from expected structure')

with open(path, 'w') as f:
    f.write(content)

print(f'\n{"─" * 56}')
if content == original:
    print('⚠ NO CHANGES WERE MADE — pattern did not match.')
else:
    print('✓ Page19LifePath.tsx updated successfully')
    print('\nRestart: rm -rf .next && npm run dev')
