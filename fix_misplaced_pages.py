#!/usr/bin/env python3
"""
T3D Fix — Correctly Place the Three New Pages
=================================================
Next.js App Router requires the file to be named EXACTLY `page.tsx` —
the route comes from the folder name, not the file name. Files named
page2.tsx, page3.tsx, etc. are invisible to Next.js routing entirely,
which is why they 404.

This script searches your project and Downloads folder for .tsx files
matching any name pattern, reads each one's actual content, and
identifies which page it is by a unique marker string inside it —
then copies it to the exact correct location as page.tsx, regardless
of what it's currently named or where it currently sits.

Run from project root:
  python3 fix_misplaced_pages.py
"""

import os, sys, glob

PROJECT_ROOT = sys.argv[1] if len(sys.argv) > 1 else os.path.expanduser(
    '~/Developer/3dimensions.guide'
)

# Unique marker string → correct destination
MARKERS = {
    "Privacy Policy — T3D Sovereign Report":       ('privacy',     'src/app/privacy/page.tsx'),
    "Field Library — T3D Sovereign Report":        ('library',     'src/app/library/page.tsx'),
    "Update Your Birth Time — T3D Sovereign Report": ('update-time', 'src/app/update-time/page.tsx'),
}

# ── Places to search for candidate files ──────────────────────────────────────
search_locations = [
    os.path.join(PROJECT_ROOT, 'src', 'app', 'privacy'),
    os.path.join(PROJECT_ROOT, 'src', 'app', 'library'),
    os.path.join(PROJECT_ROOT, 'src', 'app', 'update-time'),
    os.path.join(PROJECT_ROOT, 'src', 'app'),
    os.path.expanduser('~/Downloads'),
]

candidates = []
for loc in search_locations:
    if os.path.isdir(loc):
        candidates.extend(glob.glob(os.path.join(loc, '*.tsx')))

candidates = list(set(candidates))  # dedupe

found = {}   # route_name -> (source_path, content)
stray_files = []  # misnamed files found inside the three target dirs

for filepath in candidates:
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception:
        continue

    matched = False
    for marker, (route_name, _) in MARKERS.items():
        if marker in content:
            matched = True
            # Prefer the first match found; note if we find a duplicate
            if route_name not in found:
                found[route_name] = (filepath, content)
            break

    # Track files sitting inside the target dirs but NOT named page.tsx
    for route_name, _ in MARKERS.values():
        pass
    if os.path.basename(filepath) != 'page.tsx':
        parent = os.path.basename(os.path.dirname(filepath))
        if parent in ('privacy', 'library', 'update-time'):
            stray_files.append(filepath)

print(f'\nT3D Page Placement Fix')
print(f'Project: {PROJECT_ROOT}\n')

if not found:
    print('✗ Could not find any of the three page files by content.')
    print('  Searched:', ', '.join(search_locations))
    sys.exit(1)

for marker, (route_name, dest_rel) in MARKERS.items():
    if route_name not in found:
        print(f'✗ {route_name}: not found anywhere — you may need to re-download it')
        continue

    src_path, content = found[route_name]
    dest_path = os.path.join(PROJECT_ROOT, dest_rel)
    os.makedirs(os.path.dirname(dest_path), exist_ok=True)

    with open(dest_path, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f'✓ {route_name}: found at {src_path}')
    print(f'    → copied to {dest_rel}')

# ── Report stray misnamed files for cleanup ───────────────────────────────────
stray_files = [f for f in stray_files if f not in [v[0] for v in found.values()]]
if stray_files:
    print(f'\n⚠ Misnamed files still sitting in your target folders (safe to delete):')
    for f in stray_files:
        print(f'    {f}')
    print('\n  Delete them with:')
    for f in stray_files:
        print(f'    rm "{f}"')

print(f'\n{"─" * 56}')
print('Restart: rm -rf .next && npm run dev')
print('Then visit /privacy, /library, and /update-time to confirm.')
