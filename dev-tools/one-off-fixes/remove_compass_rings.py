#!/usr/bin/env python3
"""
T3D Homepage — Remove Spinning Compass Rings
================================================
Removes the fixed, full-viewport SovereignCompassCanvas (3D/SVG spinning
rings) from the homepage, leaving the ambient background and everything
else on the page untouched.

Safe because:
  — Both places that call the compass's ref methods
    (triggerResultsTransition, triggerCalculation) already use optional
    chaining (compassRef.current?.), so they safely no-op once the
    component is no longer rendered.
  — The import is converted to a type-only import, so `compassRef`'s
    TypeScript type annotation (useRef<SovereignCompassHandle>) still
    compiles correctly without pulling in the actual component code.
  — useScroll()/scrollProgress are left in place untouched (harmless
    if now unused) to keep this change as minimal and low-risk as
    possible.

The component file itself (SovereignCompassCanvas.tsx) is NOT deleted —
only its usage on the homepage is removed. This makes it trivial to
bring back later if you change your mind.

Run from project root:
  python3 remove_compass_rings.py
"""

import os, sys

PROJECT_ROOT = sys.argv[1] if len(sys.argv) > 1 else os.path.expanduser(
    '~/Developer/3dimensions.guide'
)
path = os.path.join(PROJECT_ROOT, 'src', 'app', 'page.tsx')

if not os.path.exists(path):
    print(f'ERROR: File not found at {path}')
    sys.exit(1)

with open(path, 'r') as f:
    content = f.read()

original = content
changes = 0

# ── 1. Convert the default+named import to a type-only import ────────────────
old_import = "import SovereignCompassCanvas, { type SovereignCompassHandle } from '@/components/SovereignCompassCanvas';"
new_import = "import type { SovereignCompassHandle } from '@/components/SovereignCompassCanvas';"

if old_import in content:
    content = content.replace(old_import, new_import)
    print('✓ Import converted to type-only (keeps compassRef typing intact)')
    changes += 1
else:
    print('✗ Import line not matched exactly')

# ── 2. Remove the fixed compass render ─────────────────────────────────────────
old_render = """      {/* ── Fixed 3D Compass Layer ─────────────────────────────────────────── */}
      <SovereignCompassCanvas ref={compassRef} scrollProgress={scrollProgress} />

"""
new_render = ""

if old_render in content:
    content = content.replace(old_render, new_render)
    print('✓ Compass render removed from homepage')
    changes += 1
else:
    print('✗ Render block not matched exactly — trying looser match...')
    # Fallback: just the JSX line itself, in case whitespace/comment differs slightly
    loose_old = "<SovereignCompassCanvas ref={compassRef} scrollProgress={scrollProgress} />"
    if loose_old in content:
        content = content.replace(loose_old, "")
        print('✓ Compass render line removed (fallback match)')
        changes += 1
    else:
        print('✗ Could not find render line at all — no changes made to this part')

with open(path, 'w') as f:
    f.write(content)

print(f'\n{"─" * 56}')
if content == original:
    print('⚠ NO CHANGES WERE MADE.')
else:
    print(f'✓ page.tsx updated ({changes}/2 patches applied)')
    print('\nRestart: rm -rf .next && npm run dev')
    print('(then confirm homepage loads correctly before rebuilding for deploy)')
