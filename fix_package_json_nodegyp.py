#!/usr/bin/env python3
"""
T3D Deploy Fix — node-gyp / Python 3.12 distutils Incompatibility
======================================================================
swisseph is a native module requiring compilation via node-gyp during
npm install. Vercel's Linux build servers run Python 3.12, which removed
the `distutils` module entirely — and swisseph resolves to an old
node-gyp (8.4.1) that still depends on it, causing:

  ModuleNotFoundError: No module named 'distutils'

node-gyp 10.x+ fixed this (moved off the removed distutils dependency).
This adds an `overrides` entry to package.json forcing npm to use a
modern node-gyp everywhere in the dependency tree — including inside
swisseph's own install step — without needing to touch swisseph itself
or any of your actual calculation code.

Run from project root:
  python3 fix_package_json_nodegyp.py
"""

import json
import os
import sys

PROJECT_ROOT = sys.argv[1] if len(sys.argv) > 1 else os.path.expanduser(
    '~/Developer/3dimensions.guide'
)
path = os.path.join(PROJECT_ROOT, 'package.json')

if not os.path.exists(path):
    print(f'ERROR: package.json not found at {path}')
    sys.exit(1)

with open(path, 'r') as f:
    pkg = json.load(f)

changed = False

if 'overrides' not in pkg:
    pkg['overrides'] = {}
    changed = True

if pkg['overrides'].get('node-gyp') != '^10.0.0':
    pkg['overrides']['node-gyp'] = '^10.0.0'
    changed = True
    print('✓ Added override: node-gyp → ^10.0.0')
else:
    print('— node-gyp override already present and correct')

if changed:
    with open(path, 'w') as f:
        json.dump(pkg, f, indent=2)
        f.write('\n')
    print('✓ package.json updated')
else:
    print('No changes needed.')

print(f'\n{"─" * 56}')
print('Next steps:')
print('  1. rm -rf node_modules package-lock.json')
print('  2. npm install    (regenerates lockfile with the override applied)')
print('  3. npm run build  (confirm it still builds cleanly locally)')
print('  4. git add package.json package-lock.json')
print('  5. git commit -m "Fix: pin node-gyp to fix Vercel/Python 3.12 build failure"')
print('  6. git push')
print('  (Vercel will automatically redeploy on push)')
