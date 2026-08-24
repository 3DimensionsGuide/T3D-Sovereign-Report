#!/usr/bin/env python3
"""
T3D Page 1 — Cover Subtitle Patch
====================================
Updates the report title line beneath the reader's name from
"The Sovereign Report" to "The T3D Sovereign Report."

Run from project root:
  python3 patch_page1_subtitle.py
"""

import os, sys

PROJECT_ROOT = sys.argv[1] if len(sys.argv) > 1 else os.path.expanduser(
    '~/Developer/3dimensions.guide'
)
path = os.path.join(
    PROJECT_ROOT, 'src', 'lib', 'report', 'section1', 'Page1Cover.tsx'
)

if not os.path.exists(path):
    print(f'ERROR: File not found at {path}')
    sys.exit(1)

with open(path, 'r') as f:
    content = f.read()

original = content

old = "<Text style={S.reportTitle}>The Sovereign Report</Text>"
new = "<Text style={S.reportTitle}>The T3D Sovereign Report</Text>"

if old in content:
    content = content.replace(old, new)
    print('✓ Subtitle updated: "The Sovereign Report" → "The T3D Sovereign Report"')
else:
    print('✗ Pattern not found — check file for manual edit')

with open(path, 'w') as f:
    f.write(content)

print(f'\n{"─" * 56}')
if content == original:
    print('⚠ NO CHANGES WERE MADE.')
else:
    print('✓ Page1Cover.tsx updated successfully')
    print('\nRestart: rm -rf .next && npm run dev')
