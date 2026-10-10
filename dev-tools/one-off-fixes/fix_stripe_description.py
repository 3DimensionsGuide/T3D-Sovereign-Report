#!/usr/bin/env python3
"""
T3D Fix — Stripe Receipt Page Count
=======================================
Run from project root:
  python3 fix_stripe_description.py
"""

import os, sys

PROJECT_ROOT = sys.argv[1] if len(sys.argv) > 1 else os.path.expanduser(
    '~/Developer/3dimensions.guide'
)
path = os.path.join(
    PROJECT_ROOT, 'src', 'app', 'api', 'stripe', 'create-payment-intent', 'route.ts'
)

if not os.path.exists(path):
    print(f'ERROR: File not found at {path}')
    sys.exit(1)

with open(path, 'r') as f:
    content = f.read()

original = content

old = "description:   'T3D Sovereign Report — Complete Natal Analysis (100 pages)',"
new = "description:   'T3D Sovereign Report — Complete Natal Analysis (44 pages)',"

if old in content:
    content = content.replace(old, new)
    print('✓ Receipt description updated: 100 pages → 44 pages')
else:
    print('✗ Pattern not found — check the file manually')

with open(path, 'w') as f:
    f.write(content)

print(f'\n{"─" * 56}')
if content == original:
    print('⚠ NO CHANGES WERE MADE.')
else:
    print('✓ create-payment-intent/route.ts updated successfully')
