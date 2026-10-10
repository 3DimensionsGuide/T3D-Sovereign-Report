#!/usr/bin/env python3
"""
T3D Checkout Copy Fix
========================
Corrects the "100 pages" claim (should be 44) and rewrites the includes
list to accurately describe what the report actually contains — no
fabricated features (there's no transit calendar), no overclaimed
completeness (the report deliberately curates rather than dumping every
gate/channel/aspect, per the Content Module System).

Run from project root:
  python3 fix_checkout_copy.py
"""

import os, sys

PROJECT_ROOT = sys.argv[1] if len(sys.argv) > 1 else os.path.expanduser(
    '~/Developer/3dimensions.guide'
)
path = os.path.join(PROJECT_ROOT, 'src', 'app', 'checkout', 'page.tsx')

if not os.path.exists(path):
    print(f'ERROR: File not found at {path}')
    sys.exit(1)

with open(path, 'r') as f:
    content = f.read()

original = content
changes = 0

# ── 1. Fix the h1 headline ────────────────────────────────────────────────────
old1 = '<h1 className="t3d-h2">Unlock your full 100-page report.</h1>'
new1 = '<h1 className="t3d-h2">Unlock your full 44-page report.</h1>'

if old1 in content:
    content = content.replace(old1, new1)
    print('✓ Headline corrected: 100-page → 44-page')
    changes += 1
else:
    print('✗ Headline not matched')

# ── 2. Fix the page-count label ───────────────────────────────────────────────
old2 = "100 PAGES · INSTANT DELIVERY · ONE-TIME"
new2 = "44 PAGES · INSTANT DELIVERY · ONE-TIME"

if old2 in content:
    content = content.replace(old2, new2)
    print('✓ Order summary label corrected: 100 → 44 pages')
    changes += 1
else:
    print('✗ Page count label not matched')

# ── 3. Rewrite the INCLUDES list to match the actual report ───────────────────
old3 = """const INCLUDES = [
  { label: '[HD.FULL]',  text: 'Complete Human Design Bodygraph — all 9 centers, 36 channels, 64 gates' },
  { label: '[NUM.FULL]', text: 'Full Numerology Blueprint — life path, expression, soul urge, all pinnacles' },
  { label: '[AST.FULL]', text: '12-Month Transit Calendar — go, caution, and stop windows mapped to your chart' },
  { label: '[INT.FULL]', text: 'Integrated Navigation Guide — how all three dimensions read together' },
] as const;"""

new3 = """const INCLUDES = [
  { label: '[VEHICLE]',   text: 'Human Design — your Type, Strategy, Authority, and Profile, plus the centers that shape how you make decisions.' },
  { label: '[ROAD]',      text: 'Numerology — your Life Path, current Pinnacle, Challenges, and (with your full name) your complete name-based blueprint.' },
  { label: '[STOPLIGHT]', text: 'Dual-Zodiac Astrology — your Tropical and Sidereal Big Three, read together as two complementary lenses on the same chart.' },
  { label: '[SYNTHESIS]', text: 'A synthesis written specifically for your exact configuration, plus a printable Sovereign Navigation Card for quick reference.' },
] as const;"""

if old3 in content:
    content = content.replace(old3, new3)
    print('✓ Includes list rewritten to match actual report contents')
    changes += 1
else:
    print('✗ Includes list not matched — check file for manual edit')

with open(path, 'w') as f:
    f.write(content)

print(f'\n{"─" * 56}')
if content == original:
    print('⚠ NO CHANGES WERE MADE.')
else:
    print(f'✓ checkout/page.tsx updated ({changes}/3 patches applied)')
    print('\nRestart: rm -rf .next && npm run dev')
