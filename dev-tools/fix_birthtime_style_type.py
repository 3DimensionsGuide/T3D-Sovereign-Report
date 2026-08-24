#!/usr/bin/env python3
"""
T3D Build Fix — BirthTimeSensitivity Style Type
====================================================
CERTAINTY_LABELS declared its `style` field as the generic `object`
type, instead of matching the actual react-pdf Style type that
DQ.valGood / DQ.valWarn / DQ.valError already are. That looseness then
made TypeScript widen the inferred type of `row.style` in the `rows`
array later in the same file to something incompatible with react-pdf's
Text `style` prop.

Fix: reference `typeof DQ.valGood` instead of the generic `object` —
this picks up the real react-pdf Style type directly from an existing
correctly-typed style object.

Run from project root:
  python3 fix_birthtime_style_type.py
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

old = "const CERTAINTY_LABELS: Record<BirthTimeCertainty, { label: string; style: object }> = {"
new = "const CERTAINTY_LABELS: Record<BirthTimeCertainty, { label: string; style: typeof DQ.valGood }> = {"

if old in content:
    content = content.replace(old, new)
    print('✓ CERTAINTY_LABELS style type corrected: object → typeof DQ.valGood')
else:
    print('✗ Exact pattern not found — searching for partial match...')
    if 'CERTAINTY_LABELS' in content:
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
