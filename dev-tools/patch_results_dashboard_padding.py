#!/usr/bin/env python3
"""
T3D Build Fix — Duplicate padding Property
==============================================
ResultsDashboard.tsx had three separate padding-related properties on
the same style object:

  paddingLeft: 20,
  padding: 'clamp(24px,3vw,36px)',
  padding: 'clamp(24px,3vw,36px) clamp(24px,3vw,36px) clamp(24px,3vw,36px) 20px',

The third line already encodes the same intent as the first two combined
(responsive clamp() padding on top/right/bottom, 20px pinned on the left).
This removes the first two, redundant lines and keeps the one complete,
unambiguous declaration.

Run from project root:
  python3 patch_results_dashboard_padding.py
"""

import os, sys

PROJECT_ROOT = sys.argv[1] if len(sys.argv) > 1 else os.path.expanduser(
    '~/Developer/3dimensions.guide'
)
path = os.path.join(
    PROJECT_ROOT, 'src', 'components', 'calculator', 'ResultsDashboard.tsx'
)

if not os.path.exists(path):
    print(f'ERROR: File not found at {path}')
    sys.exit(1)

with open(path, 'r') as f:
    content = f.read()

original = content

old = """        paddingLeft: 20,  // left border is handled by flash animation
        padding: 'clamp(24px,3vw,36px)',
        padding: 'clamp(24px,3vw,36px) clamp(24px,3vw,36px) clamp(24px,3vw,36px) 20px',"""

new = """        padding: 'clamp(24px,3vw,36px) clamp(24px,3vw,36px) clamp(24px,3vw,36px) 20px',  // left pinned at 20px; border handled by flash animation"""

if old in content:
    content = content.replace(old, new)
    print('✓ Duplicate padding properties consolidated into one declaration')
else:
    print('✗ Exact pattern not found — file may differ from expected structure')
    print('  Searching for partial match around line 93-95...')
    lines = content.split('\n')
    for i, line in enumerate(lines, 1):
        if 'padding' in line.lower() and 88 <= i <= 100:
            print(f'  L{i}: {line}')

with open(path, 'w') as f:
    f.write(content)

print(f'\n{"─" * 56}')
if content == original:
    print('⚠ NO CHANGES WERE MADE — paste the file section around line 93-95 for a manual fix.')
else:
    print('✓ ResultsDashboard.tsx updated successfully')
    print('\nRe-run: npm run build')
