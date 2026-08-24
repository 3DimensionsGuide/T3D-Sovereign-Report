#!/usr/bin/env python3
"""
T3D Stripe API Version Fix
============================
The installed Stripe SDK's TypeScript types only recognize
'2026-05-27.dahlia' as a valid apiVersion. The code was hardcoded to
the older '2025-04-30' string, which the current package no longer
accepts — causing the checkout page's PaymentIntent creation to fail
at runtime with "Invalid Stripe API version."

Run from project root:
  python3 patch_stripe_api_version.py
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

old = "apiVersion: '2025-04-30',"
new = "apiVersion: '2026-05-27.dahlia',"

if old in content:
    content = content.replace(old, new)
    print("✓ Stripe apiVersion updated: '2025-04-30' → '2026-05-27.dahlia'")
else:
    print('✗ Pattern not found — check file for manual edit')

with open(path, 'w') as f:
    f.write(content)

print(f'\n{"─" * 56}')
if content == original:
    print('⚠ NO CHANGES WERE MADE.')
else:
    print('✓ create-payment-intent/route.ts updated successfully')
    print('\nRestart: rm -rf .next && npm run dev')
