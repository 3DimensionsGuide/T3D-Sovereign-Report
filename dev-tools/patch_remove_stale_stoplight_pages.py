#!/usr/bin/env python3
"""
T3D Fix — Remove Stale Duplicate Stoplight Pages
====================================================
SovereignReport.tsx was rendering 12 Section 5 pages instead of 8 —
the correct new sequence (Pages 26-33) plus four old, superseded pages
left over from before the Stoplight rebuild:

  Page28ElementModality   (old — superseded by Page28SiderealBigThree)
  Page29RulerArenas       (old — superseded by Page31RulerElementsArenas)
  Page30TensionsResources (old — superseded)
  Page31PresentSeason     (old — superseded)

This removes those four imports and their JSX render calls from
SovereignReport.tsx, leaving exactly the correct 8-page sequence.

After running this, delete the two now-fully-dead source files —
see instructions printed at the end.

Run from project root:
  python3 patch_remove_stale_stoplight_pages.py
"""

import os, sys

PROJECT_ROOT = sys.argv[1] if len(sys.argv) > 1 else os.path.expanduser(
    '~/Developer/3dimensions.guide'
)
path = os.path.join(
    PROJECT_ROOT, 'src', 'lib', 'report', 'SovereignReport.tsx'
)

if not os.path.exists(path):
    print(f'ERROR: File not found at {path}')
    sys.exit(1)

with open(path, 'r') as f:
    content = f.read()

original = content
changes = 0

# ── Remove the two stale import statements ────────────────────────────────────
old_imports = """import { Page28ElementModality }      from './section5/Pages27to28';
import { Page29RulerArenas, Page30TensionsResources,
         Page31PresentSeason }                    from './section5/Pages29to33';
"""

if old_imports in content:
    content = content.replace(old_imports, '')
    print('✓ Stale imports removed (Pages27to28, Pages29to33)')
    changes += 1
else:
    print('✗ Import block not matched — check for whitespace differences')

# ── Remove the four stale JSX render lines ────────────────────────────────────
old_jsx = """      <Page28ElementModality  data={data} />
      <Page29RulerArenas      data={data} />
      <Page30TensionsResources data={data} />
      <Page31PresentSeason    data={data} />
"""

if old_jsx in content:
    content = content.replace(old_jsx, '')
    print('✓ Stale JSX render calls removed — Section 5 is now exactly 8 pages')
    changes += 1
else:
    print('✗ JSX block not matched — check for whitespace differences')

with open(path, 'w') as f:
    f.write(content)

print(f'\n{"─" * 60}')
if content == original:
    print('⚠ NO CHANGES WERE MADE.')
else:
    print(f'✓ SovereignReport.tsx updated ({changes}/2 patches applied)')
    print()
    print('IMPORTANT — delete the two now-fully-dead files:')
    print()
    print('  rm src/lib/report/section5/Pages27to28.tsx')
    print('  rm src/lib/report/section5/Pages29to33.tsx')
    print()
    print('Nothing in the project references them anymore. Leaving them in')
    print('place would let next build type-check their broken internal Props')
    print('again the moment anything else changes nearby.')
    print()
    print('Then: npm run build')
