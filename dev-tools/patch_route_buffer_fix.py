#!/usr/bin/env python3
"""
T3D Build Fix — Buffer / BodyInit Type Mismatch
===================================================
A newer @types/node release changed Buffer's generic signature
(Buffer<ArrayBufferLike>), which TypeScript's DOM lib types no longer
see as directly assignable to BodyInit — even though Buffer has always
been a working Uint8Array subclass at runtime.

Fix: explicitly wrap pdfBuffer in `new Uint8Array(...)` before passing
it to NextResponse. This is a real, correct fix (not a type-only cast) —
Uint8Array is a first-class BodyInit type, and this produces byte-identical
output to the original Buffer.

Run from project root:
  python3 patch_route_buffer_fix.py
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

old = "return new NextResponse(pdfBuffer, {"
new = "return new NextResponse(new Uint8Array(pdfBuffer), {"

if old in content:
    content = content.replace(old, new)
    print('✓ pdfBuffer wrapped in Uint8Array — build type error resolved')
else:
    print('✗ Exact pattern not found — file may differ from expected structure')

with open(path, 'w') as f:
    f.write(content)

print(f'\n{"─" * 56}')
if content == original:
    print('⚠ NO CHANGES WERE MADE.')
else:
    print('✓ route.ts updated successfully')
    print('\nRe-run: npm run build')
