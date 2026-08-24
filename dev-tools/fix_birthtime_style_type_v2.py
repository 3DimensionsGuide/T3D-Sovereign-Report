#!/usr/bin/env python3
"""
T3D Build Fix — BirthTimeSensitivity Style Type (v2)
========================================================
The previous fix used `typeof DQ.valGood` as the style type, which
captured that ONE style object's exact literal color type ("#1F8A4D").
That's too narrow — valWarn and valError have different (but equally
valid) literal color values, and TypeScript correctly rejected them
against a type demanding specifically "#1F8A4D".

The real fix: type the style field by its actual shared shape —
{ color: string; fontWeight: number } — which is what valGood, valWarn,
and valError all structurally are, without pinning to one instance's
exact literal values.

Run from project root:
  python3 fix_birthtime_style_type_v2.py
"""

import os, sys

PROJECT_ROOT = sys.argv[1] if len(sys.argv) > 1 else os.path.expanduser(
    '~/Developer/3dimensions.guide'
)
path = os.path.join(
    PROJECT_ROOT, 'src', 'lib', 'report', 'shared', 'BirthTimeSensitivity.tsx'
)

if not os.path.exists(path):
    print(f'ERROR: File not found at {path}')
    sys.exit(1)

with open(path, 'r') as f:
    content = f.read()

original = content

old = "const CERTAINTY_LABELS: Record<BirthTimeCertainty, { label: string; style: typeof DQ.valGood }> = {"
new = "const CERTAINTY_LABELS: Record<BirthTimeCertainty, { label: string; style: { color: string; fontWeight: number } }> = {"

if old in content:
    content = content.replace(old, new)
    print('✓ CERTAINTY_LABELS style type corrected: typeof DQ.valGood → { color: string; fontWeight: number }')
else:
    print('✗ Exact pattern not found — searching for partial match...')
    for i, line in enumerate(content.split('\n'), 1):
        if 'CERTAINTY_LABELS' in line and 'Record' in line:
            print(f'  L{i}: {line}')

with open(path, 'w') as f:
    f.write(content)

print(f'\n{"─" * 56}')
if content == original:
    print('⚠ NO CHANGES WERE MADE.')
else:
    print('✓ BirthTimeSensitivity.tsx updated successfully')
    print('\nRe-run: npm run build')
