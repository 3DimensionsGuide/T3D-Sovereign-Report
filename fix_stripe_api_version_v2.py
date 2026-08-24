#!/usr/bin/env python3
"""
T3D Deploy Fix — Stripe API Version (v2)
============================================
The npm install triggered by the node-gyp fix pulled in a newer `stripe`
package version, whose TypeScript types now expect apiVersion
'2026-07-29.dahlia' instead of the previously-correct '2026-05-27.dahlia'.

This updates BOTH files that construct a Stripe client:
  — create-payment-intent/route.ts
  — stripe/webhook/route.ts

Run from project root:
  python3 fix_stripe_api_version_v2.py
"""

import os, sys

PROJECT_ROOT = sys.argv[1] if len(sys.argv) > 1 else os.path.expanduser(
    '~/Developer/3dimensions.guide'
)

files = [
    os.path.join(PROJECT_ROOT, 'src', 'app', 'api', 'stripe',
                'create-payment-intent', 'route.ts'),
    os.path.join(PROJECT_ROOT, 'src', 'app', 'api', 'stripe',
                'webhook', 'route.ts'),
]

old = "apiVersion: '2026-05-27.dahlia',"
new = "apiVersion: '2026-07-29.dahlia',"

any_changed = False

for path in files:
    if not os.path.exists(path):
        print(f'✗ File not found: {path}')
        continue

    with open(path, 'r') as f:
        content = f.read()

    if old in content:
        content = content.replace(old, new)
        with open(path, 'w') as f:
            f.write(content)
        print(f'✓ {os.path.relpath(path, PROJECT_ROOT)}: apiVersion updated')
        any_changed = True
    elif new in content:
        print(f'— {os.path.relpath(path, PROJECT_ROOT)}: already correct')
    else:
        print(f'✗ {os.path.relpath(path, PROJECT_ROOT)}: apiVersion pattern not found')

print(f'\n{"─" * 56}')
if any_changed:
    print('✓ Updated. Re-run: npm run build')
else:
    print('No changes made — check files manually if build still fails.')
