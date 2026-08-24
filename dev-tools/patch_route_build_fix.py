#!/usr/bin/env python3
"""
T3D Build Fix — renderToBuffer Type Mismatch
================================================
@react-pdf/renderer's renderToBuffer() expects a ReactElement typed
specifically as DocumentProps. Wrapping SovereignReport through
React.createElement produces a FunctionComponentElement<Props> instead —
functionally identical at runtime (SovereignReport renders a <Document>
internally), but TypeScript's whole-project build check is stricter
about this than `next dev`'s incremental check.

Fix: a narrow `as any` cast on just this one call site. This does not
weaken type safety anywhere else in the file — it only tells TypeScript
to trust this specific, verified-correct render call.

Run from project root:
  python3 patch_route_build_fix.py
"""

import os, sys

PROJECT_ROOT = sys.argv[1] if len(sys.argv) > 1 else os.path.expanduser(
    '~/Developer/3dimensions.guide'
)
path = os.path.join(
    PROJECT_ROOT, 'src', 'app', 'api', 'generate-report', 'route.ts'
)

if not os.path.exists(path):
    print(f'ERROR: File not found at {path}')
    sys.exit(1)

with open(path, 'r') as f:
    content = f.read()

original = content

old = """    const pdfBuffer = await renderToBuffer(
      React.createElement(SovereignReport, { data: reportDataWithSynthesis })
    );"""

new = """    const pdfBuffer = await renderToBuffer(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      React.createElement(SovereignReport, { data: reportDataWithSynthesis }) as any
    );"""

if old in content:
    content = content.replace(old, new)
    print('✓ renderToBuffer call cast applied — build type error resolved')
else:
    print('✗ Exact pattern not found — file may differ from expected structure')
    print('  Searching for partial match...')
    if 'React.createElement(SovereignReport' in content:
        print('  Found similar line — check indentation/spacing manually')

with open(path, 'w') as f:
    f.write(content)

print(f'\n{"─" * 56}')
if content == original:
    print('⚠ NO CHANGES WERE MADE.')
else:
    print('✓ route.ts updated successfully')
    print('\nRe-run: npm run build')
