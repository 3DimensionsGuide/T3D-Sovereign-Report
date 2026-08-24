#!/usr/bin/env python3
"""
T3D Page 25 — Field Practice Question Spacing Fix
=====================================================
The Three Questions block had cramped spacing:
  — Row padding (12pt) too tight for wrapping question text
  — Label-to-question-text gap (4pt) too tight
  — Badge-to-text gap (12pt) slightly tight
  — No breathing room before the Notes section

Adjustments:
  1. questionRow / questionRowLast paddingVertical: 12 → 18
  2. Badge-to-text gap: 12 → 16
  3. Label-to-question marginBottom: 4 → 7
  4. questionText lineHeight: 1.5 → 1.55 (slightly more open)
  5. questionsList marginBottom: 20 → 26 (more room before Notes)

Run from project root:
  python3 patch_page25_spacing.py
"""

import os, sys

PROJECT_ROOT = sys.argv[1] if len(sys.argv) > 1 else os.path.expanduser(
    '~/Developer/3dimensions.guide'
)
path = os.path.join(
    PROJECT_ROOT, 'src', 'lib', 'report', 'section4', 'Pages23to25.tsx'
)

if not os.path.exists(path):
    print(f'ERROR: File not found at {path}')
    sys.exit(1)

with open(path, 'r') as f:
    content = f.read()

original = content
changes = 0

# Fix 1 & 2: row padding and badge-to-text gap
old1 = """  questionsList: { flexDirection: 'column', gap: 0, marginBottom: 20 },
  questionRow: {
    paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: C.base,
    borderBottomStyle: 'solid', flexDirection: 'row', gap: 12, alignItems: 'flex-start',
  },
  questionRowLast: { paddingVertical: 12, flexDirection: 'row', gap: 12, alignItems: 'flex-start' },"""

new1 = """  questionsList: { flexDirection: 'column', gap: 0, marginBottom: 26 },
  questionRow: {
    paddingVertical: 18, borderBottomWidth: 0.5, borderBottomColor: C.base,
    borderBottomStyle: 'solid', flexDirection: 'row', gap: 16, alignItems: 'flex-start',
  },
  questionRowLast: { paddingVertical: 18, flexDirection: 'row', gap: 16, alignItems: 'flex-start' },"""

if old1 in content:
    content = content.replace(old1, new1)
    print('✓ Row padding increased (12 → 18), badge gap increased (12 → 16)')
    print('✓ questionsList marginBottom increased (20 → 26)')
    changes += 1
else:
    print('✗ Pattern 1 not found')

# Fix 3 & 4: label-to-text gap and question text lineHeight
old2 = """  questionText: { flex: 1, fontFamily: F.sans, fontSize: 10.5, fontWeight: 300, color: C.base, lineHeight: 1.5, opacity: 0.85 },"""

new2 = """  questionText: { flex: 1, fontFamily: F.sans, fontSize: 10.5, fontWeight: 300, color: C.base, lineHeight: 1.55, opacity: 0.85 },"""

if old2 in content:
    content = content.replace(old2, new2)
    print('✓ questionText lineHeight opened up (1.5 → 1.55)')
    changes += 1
else:
    print('✗ Pattern 2 not found')

# Fix 5: label-to-question marginBottom (inline style in JSX, not StyleSheet)
old3 = "fontWeight: 500, fontSize: 7, letterSpacing: 1.5, textTransform: 'uppercase', color: C.parchmentFaint, marginBottom: 4"
new3 = "fontWeight: 500, fontSize: 7, letterSpacing: 1.5, textTransform: 'uppercase', color: C.parchmentFaint, marginBottom: 7"

if old3 in content:
    content = content.replace(old3, new3)
    print('✓ Label-to-question-text gap increased (4 → 7)')
    changes += 1
else:
    print('✗ Pattern 3 not found')

with open(path, 'w') as f:
    f.write(content)

print(f'\n{"─" * 56}')
if content == original:
    print('⚠ NO CHANGES WERE MADE — patterns did not match.')
else:
    print(f'✓ Pages23to25.tsx updated successfully ({changes}/3 patches applied)')
    print('\nRestart: rm -rf .next && npm run dev')
