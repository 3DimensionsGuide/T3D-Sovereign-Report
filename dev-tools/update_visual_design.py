#!/usr/bin/env python3
"""
T3D Sovereign Report — Visual Design System Update
===================================================
Applies Design Layers 2 and 8 across all section files.

  Layer 2: Body pages → #F5F5F3 (Alabaster Parchment)
  Layer 8: Technical Line System → TechnicalLines component in every content page

Run from your project root:
  python3 update_visual_design.py

Or with a custom path:
  python3 update_visual_design.py ~/Developer/3dimensions.guide
"""

import os
import sys
import re

# ── Configuration ─────────────────────────────────────────────────────────────

PROJECT_ROOT = sys.argv[1] if len(sys.argv) > 1 else os.path.expanduser(
    '~/Developer/3dimensions.guide'
)
REPORT_DIR = os.path.join(PROJECT_ROOT, 'src', 'lib', 'report')

# Dark/divider pages — do NOT add TechnicalLines('light'), use 'dark' variant
DARK_PAGES = {
    'Page1Cover.tsx',
    'Page10VehicleDivider.tsx',
    'Page18RoadDivider.tsx',
    'Page26StoplightDivider.tsx',
    'Page34SOSDivider.tsx',
    'Page44ClosingLetter.tsx',
}

# Body-page background colors to standardize → #F5F5F3
OLD_BG_COLORS = [
    "'#FAFAF9'",
    "'#FFFFFF'",
    "'#FEFEFE'",
    "'#F8F8F6'",
    "'#FAFAF8'",
]

# The import line to add (points to shared component)
IMPORT_TECHNICAL = "import { TechnicalLines } from '../shared/PageComponents';\n"

# The import line for Pages inside section sub-dirs (same relative path)
# All section files are in src/lib/report/sectionN/ — always one level deep.

# ── Helpers ───────────────────────────────────────────────────────────────────

def is_dark_page(filename: str) -> bool:
    return filename in DARK_PAGES

def has_technical_lines(content: str) -> bool:
    return 'TechnicalLines' in content

def find_section_files() -> list:
    """Return all .tsx files inside section directories."""
    files = []
    for entry in sorted(os.listdir(REPORT_DIR)):
        section_path = os.path.join(REPORT_DIR, entry)
        if not os.path.isdir(section_path):
            continue
        if not entry.startswith('section'):
            continue
        for fname in sorted(os.listdir(section_path)):
            if fname.endswith('.tsx') or fname.endswith('.ts'):
                files.append(os.path.join(section_path, fname))
    return files

def add_import(content: str) -> str:
    """Add TechnicalLines import after the first @react-pdf/renderer import."""
    if IMPORT_TECHNICAL.strip() in content:
        return content  # Already present

    # Insert after the @react-pdf/renderer import line
    pattern = r"(import \{[^}]+\} from '@react-pdf/renderer';)"
    match   = re.search(pattern, content)
    if match:
        end = match.end()
        return content[:end] + '\n' + IMPORT_TECHNICAL.rstrip('\n') + content[end:]

    # Fallback: insert before the first local import
    pattern2 = r"(import \{[^}]+\} from '\.\./)"
    match2   = re.search(pattern2, content)
    if match2:
        pos = match2.start()
        return content[:pos] + IMPORT_TECHNICAL + content[pos:]

    return content  # Could not find insertion point

def inject_technical_lines(content: str, dark: bool) -> str:
    """
    Inject <TechnicalLines [variant="dark"] /> as the first child of each <Page>.
    Works for both single-Page files and multi-export files (Pages23to25, Pages27to28, etc.).
    """
    variant_attr = ' variant="dark"' if dark else ''
    component    = f'      <TechnicalLines{variant_attr} />\n'

    # Match every <Page ... > opening tag (handles multiline style attributes)
    # Strategy: find '<Page ' then find the closing '>' of the opening tag,
    # then insert TechnicalLines immediately after.

    result = []
    i = 0
    while i < len(content):
        # Look for <Page
        tag_start = content.find('<Page ', i)
        if tag_start == -1:
            result.append(content[i:])
            break

        # Append everything up to and including the opening tag
        # Find the closing '>' of the opening <Page ...> tag
        # We need to handle nested <> inside style attributes — count braces
        j = tag_start + 6  # skip '<Page '
        depth = 0
        in_string = False
        string_char = None
        found_close = -1

        while j < len(content):
            ch = content[j]
            if in_string:
                if ch == string_char and content[j-1] != '\\':
                    in_string = False
            else:
                if ch in ('"', "'"):
                    in_string = True
                    string_char = ch
                elif ch == '{':
                    depth += 1
                elif ch == '}':
                    depth -= 1
                elif ch == '>' and depth == 0:
                    found_close = j
                    break
            j += 1

        if found_close == -1:
            # Could not find closing >, append rest and stop
            result.append(content[i:])
            break

        # Include up to and including the '>'
        result.append(content[i:found_close + 1])
        result.append('\n')
        result.append(component)
        i = found_close + 1

    return ''.join(result)

def update_bg_colors(content: str) -> str:
    """Standardize body-page backgrounds to #F5F5F3."""
    for old in OLD_BG_COLORS:
        content = content.replace(old, "'#F5F5F3'")
    return content

def process_file(filepath: str) -> tuple:
    """Process a single file. Returns (changed: bool, summary: str)."""
    filename = os.path.basename(filepath)
    dark     = is_dark_page(filename)

    with open(filepath, 'r', encoding='utf-8') as f:
        original = f.read()

    content = original

    # 1. Standardize body-page background color (both light and dark pages)
    content = update_bg_colors(content)

    # 2. Add TechnicalLines import if this file renders Pages
    if '<Page ' in content and not has_technical_lines(content):
        content = add_import(content)

    # 3. Inject TechnicalLines into every <Page> opening
    if '<Page ' in content and not has_technical_lines(original):
        content = inject_technical_lines(content, dark)

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        action = 'dark variant' if dark else 'light variant'
        return True, f'✓  {filename:<40} [{action}]'
    else:
        return False, f'—  {filename:<40} [no change]'

# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    if not os.path.isdir(REPORT_DIR):
        print(f'ERROR: Could not find report directory at:\n  {REPORT_DIR}')
        print('\nUsage: python3 update_visual_design.py [project_root]')
        sys.exit(1)

    # Ensure shared directory exists
    shared_dir = os.path.join(REPORT_DIR, 'shared')
    if not os.path.isdir(shared_dir):
        print(f'ERROR: shared/ directory not found at {shared_dir}')
        print('Copy PageComponents.tsx to src/lib/report/shared/ first.')
        sys.exit(1)

    files = find_section_files()
    if not files:
        print('No section files found.')
        sys.exit(1)

    print(f'\nT3D Visual Design System Update')
    print(f'Project: {PROJECT_ROOT}')
    print(f'Files found: {len(files)}\n')

    changed = 0
    for filepath in files:
        ok, summary = process_file(filepath)
        print(summary)
        if ok:
            changed += 1

    print(f'\n{"─" * 54}')
    print(f'Updated {changed} / {len(files)} files.')
    print('\nDesign layers applied:')
    print('  Layer 2: Body pages → #F5F5F3 (Alabaster Parchment)')
    print('  Layer 8: TechnicalLines added to all content pages')
    print('\nRestart your dev server:  rm -rf .next && npm run dev')

if __name__ == '__main__':
    main()
