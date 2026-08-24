#!/usr/bin/env python3
"""
T3D Build Fix — Client Component Directive
==============================================
Nav.tsx and Footer.tsx use onMouseEnter/onMouseLeave handlers, which
require them to be Client Components. By default, every component in
the Next.js App Router is a Server Component — which cannot carry live
event handler functions during static prerendering.

Adding 'use client' as the very first line of each file marks them as
Client Components, allowing the hover handlers to work as intended.

This is safe for components like nav/footer that are purely
presentational. If either file does server-only work (async data
fetching, cookies(), headers()), this fix would need the alternate
approach of extracting just the interactive link into its own small
Client Component instead — but that's uncommon for navigation/footer
components, and the build will tell us clearly if that's the case here.

Run from project root:
  python3 add_use_client_nav_footer.py
"""

import os, sys

PROJECT_ROOT = sys.argv[1] if len(sys.argv) > 1 else os.path.expanduser(
    '~/Developer/3dimensions.guide'
)

files = [
    os.path.join(PROJECT_ROOT, 'src', 'components', 'navigation', 'Nav.tsx'),
    os.path.join(PROJECT_ROOT, 'src', 'components', 'navigation', 'Footer.tsx'),
]

for path in files:
    if not os.path.exists(path):
        print(f'✗ File not found: {path}')
        continue

    with open(path, 'r') as f:
        content = f.read()

    if content.strip().startswith("'use client'") or content.strip().startswith('"use client"'):
        print(f'— {os.path.basename(path)}: already has "use client" directive')
        continue

    new_content = "'use client';\n\n" + content

    with open(path, 'w') as f:
        f.write(new_content)

    print(f'✓ {os.path.basename(path)}: "use client" directive added')

print(f'\n{"─" * 56}')
print('Re-run: npm run build')
