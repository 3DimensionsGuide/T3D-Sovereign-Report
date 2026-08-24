#!/usr/bin/env python3
"""
T3D Build Fix — Duplicate longitudeToGate Export
====================================================
human_design.ts exports longitudeToGate twice:

  export function longitudeToGate(...) { ... }     ← direct export

  ...later in the file...

  export { longitudeToGate, GATE_SEQUENCE, ... };   ← re-exported again

TypeScript disallows redeclaring the same export twice. GATE_SEQUENCE,
GATE_CENTER_MAP, and UNIQUE_CHANNELS are plain (non-exported) consts, so
that bottom line is their only export path and must stay — only
longitudeToGate needs to be removed from it, since it already has its
own direct export.

Run from project root:
  python3 fix_human_design_duplicate_export.py
"""

import os, sys

PROJECT_ROOT = sys.argv[1] if len(sys.argv) > 1 else os.path.expanduser(
    '~/Developer/3dimensions.guide'
)
path = os.path.join(
    PROJECT_ROOT, 'src', 'server', 'engines', 'human_design.ts'
)

if not os.path.exists(path):
    print(f'ERROR: File not found at {path}')
    sys.exit(1)

with open(path, 'r') as f:
    content = f.read()

original = content

old = "export { longitudeToGate, GATE_SEQUENCE, GATE_CENTER_MAP, UNIQUE_CHANNELS };"
new = "export { GATE_SEQUENCE, GATE_CENTER_MAP, UNIQUE_CHANNELS };"

if old in content:
    content = content.replace(old, new)
    print('✓ Duplicate longitudeToGate export removed')
else:
    print('✗ Exact pattern not found — searching for partial match...')
    for i, line in enumerate(content.split('\n'), 1):
        if 'export {' in line and 'longitudeToGate' in line:
            print(f'  L{i}: {line}')

with open(path, 'w') as f:
    f.write(content)

print(f'\n{"─" * 56}')
if content == original:
    print('⚠ NO CHANGES WERE MADE.')
else:
    print('✓ human_design.ts updated successfully')
    print('\nRe-run: npm run build')
