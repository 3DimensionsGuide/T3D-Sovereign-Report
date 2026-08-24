#!/usr/bin/env python3
"""
T3D Fix — Duplicate bgImage Style Block
===========================================
Page44ClosingLetter.tsx's StyleSheet.create({...}) ended up with the
bgImage style declared twice — likely because the original background-
image patch script was applied more than once (its anchor text for the
style insertion still matches even after being applied once, since it
anchors on the surrounding `page: {...}` line rather than checking
whether bgImage already exists).

This script finds the exact bgImage block, and if it appears more than
once, keeps only the first occurrence and removes any duplicates —
leaving everything else in the file untouched.

Run from project root:
  python3 fix_page44_duplicate_bgimage.py
"""

import os, sys

PROJECT_ROOT = sys.argv[1] if len(sys.argv) > 1 else os.path.expanduser(
    '~/Developer/3dimensions.guide'
)
path = os.path.join(
    PROJECT_ROOT, 'src', 'lib', 'report', 'section7', 'Page44ClosingLetter.tsx'
)

if not os.path.exists(path):
    print(f'ERROR: File not found at {path}')
    sys.exit(1)

with open(path, 'r') as f:
    content = f.read()

original = content

# The exact block the original patch inserted
marker = """  // Full-bleed background image — pre-processed, sits behind all content
  bgImage: {
    position: 'absolute',
    top: 0, left: 0,
    width: PAGE.width, height: PAGE.height,
  },"""

count = content.count(marker)
print(f'Found {count} occurrence(s) of the bgImage style block.')

if count <= 1:
    print('✓ Nothing to deduplicate — 0 or 1 occurrence is correct.')
    if count == 0:
        print('  (0 means the block may have been altered — check manually if the')
        print('   build still fails on this file.)')
else:
    # Split on the marker, keep first occurrence, drop the rest
    parts = content.split(marker)
    # parts has (count + 1) pieces; rejoin keeping exactly ONE marker
    content = parts[0] + marker + ''.join(parts[1:])
    removed = count - 1
    print(f'✓ Removed {removed} duplicate occurrence(s) — kept exactly 1.')

with open(path, 'w') as f:
    f.write(content)

print(f'\n{"─" * 56}')
if content == original:
    print('No changes were needed.')
else:
    print('✓ Page44ClosingLetter.tsx updated successfully')
    print('\nRe-run: npm run build')
