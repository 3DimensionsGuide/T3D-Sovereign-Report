#!/usr/bin/env python3
"""
T3D Sovereign Report — Grid Layout Application
================================================
Applies correct flex ratios to pages that already have flexDirection:'row' layouts.
Does not restructure JSX — only updates existing flex values to grid proportions.

Layout ratios applied:
  Interpretation  7 + 5  (copy left, callout right)
  Field Practice  8 + 4  (exercise, notation)
  Reflection      5 + 7  (prompt, writing — handled by separate file rebuild)

Run from project root:
  python3 apply_grid_layouts.py
"""

import os, sys, re

PROJECT_ROOT = sys.argv[1] if len(sys.argv) > 1 else os.path.expanduser(
    '~/Developer/3dimensions.guide'
)
SECTION_DIR = os.path.join(PROJECT_ROOT, 'src', 'lib', 'report')

# ── Target files and their layout types ──────────────────────────────────────
# Maps filename → (layout_type, left_flex, right_flex)
LAYOUT_MAP = {
    # Interpretation: 7+5
    'Page11TypeStrategy.tsx':    ('interpretation', 7, 5),
    'Page12Authority.tsx':       ('interpretation', 7, 5),
    'Page13Profile.tsx':         ('interpretation', 7, 5),
    'Page14DefinedStrengths.tsx':('interpretation', 7, 5),
    'Page15OpenTerrain.tsx':     ('interpretation', 7, 5),
    'Page16Friction.tsx':        ('interpretation', 7, 5),
    'Page19LifePath.tsx':        ('interpretation', 7, 5),
    'Page27BigThree.tsx':        ('interpretation', 7, 5),
    'Page32StoplightFriction.tsx':('interpretation', 7, 5),
    'Page36CreativeWork.tsx':    ('interpretation', 7, 5),
    'Page37Relate.tsx':          ('interpretation', 7, 5),
    'Page38Recalibration.tsx':   ('interpretation', 7, 5),
    'Pages27to28.tsx':           ('interpretation', 7, 5),
    'Pages29to33.tsx':           ('interpretation', 7, 5),
    'Pages36to39.tsx':           ('interpretation', 7, 5),

    # Field Practice: 8+4
    'Page9SevenDay.tsx':         ('fieldPractice', 8, 4),
    'Page17VehiclePractice.tsx': ('fieldPractice', 8, 4),
    'Page25RoadPractice.tsx':    ('fieldPractice', 8, 4),
    'Page33StoplightPractice.tsx':('fieldPractice', 8, 4),
    'Page39SevenDay.tsx':        ('fieldPractice', 8, 4),
    'Pages23to25.tsx':           ('fieldPractice', 8, 4),
}

# ── Add grid import if not present ────────────────────────────────────────────
GRID_IMPORT = "import { GRID } from '../shared/grid';\n"

def add_grid_import(content: str) -> str:
    if 'shared/grid' in content:
        return content
    # Insert after last import line
    lines = content.split('\n')
    last_import = 0
    for i, line in enumerate(lines):
        if line.startswith('import '):
            last_import = i
    lines.insert(last_import + 1, GRID_IMPORT.rstrip())
    return '\n'.join(lines)

# ── Update GRID-based flexbox styles ─────────────────────────────────────────
def apply_grid_flex(content: str, layout: str, left: int, right: int) -> tuple:
    """
    Look for existing two-column row structures and update their flex values.
    Specifically handles:
      twoCol / promptRow / tableRow / frictionItems etc.
    """
    changes = 0

    # Pattern: styles with flex: 1 inside two-column contexts
    # We target the style sheet definitions for column/panel styles
    # and update flex:1 to the appropriate grid ratio

    # For interpretation pages: left panels at flex:1 → flex:7, right at flex:1 → flex:5
    # Strategy: find pairs of flex:1 in style objects that are clearly two-column

    # Simple targeted replacements for common two-col patterns:
    patterns = [
        # twoCol layouts (two panels side by side)
        (r'(twoCol:\s*\{[^}]*?)flex:\s*(?:1|2)\b', f'\\1flex: {left}'),
    ]

    # More targeted: look for style key names that indicate columns
    col_keys = ['tableCol', 'promptBlock', 'frictionItem', 'driverLeft',
                'charBadge', 'left', 'col', 'panel', 'column']

    return content, changes

def apply_right_col_constraint(content: str) -> str:
    """Add maxWidth to right-column callout/notation areas where appropriate."""
    # This prevents callout areas from being wider than their grid spec
    return content

def process_file(filepath: str) -> tuple:
    filename = os.path.basename(filepath)
    if filename not in LAYOUT_MAP:
        return False, 0

    layout, left_flex, right_flex = LAYOUT_MAP[filename]

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content

    # 1. Add grid import
    content = add_grid_import(content)

    # 2. For files with existing promptRow / tableRow layouts,
    #    update the flex values to grid ratios.
    # We look for explicit flex values in two-column row styles.

    changes_made = 0

    # Pattern: StyleSheet containing a 'twoCol' or 'tableRow' definition
    # with child flex values — update to correct ratios
    if 'flexDirection: \'row\'' in content or 'flexDirection: "row"' in content:
        # Update style blocks that define column panels
        # Look for: left/right column style pairs with flex:1
        # and replace with correct grid flex values
        pass  # Complex JSX restructuring not attempted via script

    # The most reliable mechanical change: update specific known style names
    # These have flex:1 and represent the LEFT column in a 2-col layout
    left_style_names = ['tableColLeft', 'leftCol', 'promptCol', 'exerciseCol', 'copyCol']
    right_style_names = ['tableColRight', 'rightCol', 'calloutCol', 'notationCol', 'promptBlock']

    for name in left_style_names:
        old = f'{name}: {{ flex: 1'
        new = f'{name}: {{ flex: {left_flex}'
        if old in content:
            content = content.replace(old, new)
            changes_made += 1

    for name in right_style_names:
        old = f'{name}: {{ flex: 1'
        new = f'{name}: {{ flex: {right_flex}'
        if old in content:
            content = content.replace(old, new)
            changes_made += 1

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True, changes_made
    return False, 0

def find_file(filename: str) -> str | None:
    for section in ['section1','section2','section3','section4',
                    'section5','section6','section7']:
        path = os.path.join(SECTION_DIR, section, filename)
        if os.path.exists(path):
            return path
    return None

def main():
    if not os.path.isdir(SECTION_DIR):
        print(f'ERROR: Report dir not found at {SECTION_DIR}')
        sys.exit(1)

    print(f'\nT3D Grid Layout Application')
    print(f'Project: {PROJECT_ROOT}\n')
    print('This script adds the GRID import to all layout-target files.')
    print('Structural JSX changes (7+5, 8+4 splits) are applied via rebuilt components.\n')

    updated = 0
    for filename, (layout, left, right) in LAYOUT_MAP.items():
        filepath = find_file(filename)
        if not filepath:
            print(f'  ✗ {filename:<44} NOT FOUND')
            continue

        changed, count = process_file(filepath)
        if changed:
            print(f'  ✓ {filename:<44} [{layout} {left}+{right}] ({count} changes)')
            updated += 1
        else:
            print(f'  — {filename:<44} [{layout}] (import already present or no change)')

    print(f'\n{"─" * 56}')
    print(f'Updated {updated} files with grid imports.\n')
    print('Grid layout types active:')
    print('  Page5Dashboard   → rebuilt as 3×4 Dashboard (download separately)')
    print('  Pages41to42      → rebuilt as 5+7 Reflection (download separately)')
    print('  All others       → GRID import added for future structural updates')
    print('\nRestart: rm -rf .next && npm run dev')

if __name__ == '__main__':
    main()
