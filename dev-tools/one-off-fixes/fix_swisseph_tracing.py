#!/usr/bin/env python3
"""
T3D Deploy Fix — swisseph Native Binary Missing at Runtime
==============================================================
The node-gyp fix earlier solved COMPILING swisseph during `npm install`.
This is a separate, later problem: Next.js's automatic file-tracing
(which decides what to include in each serverless function's deployed
bundle) doesn't reliably detect native .node binaries that are loaded
dynamically inside a compiled addon's loader code, rather than through
a plain `require()` Next.js can statically see.

Result: the compiled swisseph.node binary quietly gets left out of the
deployed function package, even though it compiled successfully during
build — surfacing only as a runtime crash the first time the function
actually runs:

  Cannot find module '.../swisseph/build/Release/swisseph.node'

Fix: outputFileTracingIncludes explicitly forces this file to be
included in any /api/** function's bundle, regardless of whether
Next.js's automatic tracing detected it.

Run from project root:
  python3 fix_swisseph_tracing.py
"""

import os, sys

PROJECT_ROOT = sys.argv[1] if len(sys.argv) > 1 else os.path.expanduser(
    '~/Developer/3dimensions.guide'
)

# next.config could be .ts or .js — check both
candidates = [
    os.path.join(PROJECT_ROOT, 'next.config.ts'),
    os.path.join(PROJECT_ROOT, 'next.config.js'),
]
path = next((p for p in candidates if os.path.exists(p)), None)

if not path:
    print(f'ERROR: next.config.ts/.js not found in {PROJECT_ROOT}')
    sys.exit(1)

with open(path, 'r') as f:
    content = f.read()

original = content

old = "  serverExternalPackages: ['swisseph'],"
new = """  serverExternalPackages: ['swisseph'],
  // The compiled swisseph.node binary is loaded dynamically by the
  // addon's own loader code, which Next.js's automatic file-tracing
  // doesn't reliably detect. This forces it into any API route's
  // deployed function bundle so it's actually present at runtime.
  outputFileTracingIncludes: {
    '/api/**': ['./node_modules/swisseph/build/Release/*.node'],
  },"""

if old in content:
    content = content.replace(old, new)
    print('✓ outputFileTracingIncludes added to', os.path.basename(path))
else:
    print(f'✗ Expected line not found in {os.path.basename(path)}')
    print('  Looking for:', repr(old))
    print('  Current serverExternalPackages line(s):')
    for i, line in enumerate(content.split('\n'), 1):
        if 'serverExternalPackages' in line:
            print(f'    L{i}: {line}')

with open(path, 'w') as f:
    f.write(content)

print(f'\n{"─" * 56}')
if content == original:
    print('⚠ NO CHANGES WERE MADE — check the file manually.')
else:
    print('✓ Config updated successfully')
    print('\nRe-run: npm run build')
    print('Then commit, push, and test /api/calculate-t3d on the live site again.')
