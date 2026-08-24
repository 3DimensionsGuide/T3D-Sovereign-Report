#!/usr/bin/env python3
"""
T3D Build Fix — Comprehensive borderOpacity Sweep
=====================================================
`borderOpacity` (and its Top/Bottom/Left/Right variants) is not a valid
style property in this project's installed @react-pdf/renderer version.
It's been used in several files across the report codebase, surfacing
as a fresh build error each time `npm run build` reaches a new one.

This script scans every .ts/.tsx file under src/, and for each
occurrence of a border*Opacity property:

  1. If there's a matching border*Color using a known T3D design token
     (C.base, C.crimson, etc.) nearby, it merges the opacity directly
     into the color as an rgba() value — preserving the exact visual
     result, just expressed in a way react-pdf actually supports.

  2. If the color expression isn't recognized (rare), it safely removes
     just the invalid opacity line, leaving the color as-is. This
     guarantees the build succeeds everywhere; any resulting visual
     difference (slightly more opaque border) can be spot-checked
     afterward.

Run from project root:
  python3 fix_all_border_opacity.py
"""

import os, re, sys

PROJECT_ROOT = sys.argv[1] if len(sys.argv) > 1 else os.path.expanduser(
    '~/Developer/3dimensions.guide'
)
SRC_DIR = os.path.join(PROJECT_ROOT, 'src')

# ── T3D design token → hex color map (from tokens.ts) ─────────────────────────
TOKEN_HEX = {
    'C.base':           '#0D0D0E',
    'C.baseSoft':       '#141416',
    'C.parchment':      '#F5F5F3',
    'C.parchmentDim':   '#A8A8A6',
    'C.parchmentFaint': '#6B6B69',
    'C.amber':          '#E5A93C',
    'C.amberDim':       '#8C6520',
    'C.amberLight':     '#FDF3DC',
    'C.emerald':        '#1F8A4D',
    'C.emeraldDim':     '#0E4425',
    'C.emeraldLight':   '#EAF5EE',
    'C.crimson':        '#991B1B',
    'C.crimsonDim':     '#4C0D0D',
    'C.crimsonLight':   '#FDEAEA',
    'C.pageLight':      '#F5F5F3',
    'C.rule':           '#DDDBD8',
    'C.ruleFaint':      '#EDEBE8',
    'STAR_SLATE':       '#6D7797',
}

def hex_to_rgba(hex_color: str, opacity: str) -> str:
    hex_color = hex_color.strip("'\"")
    r = int(hex_color[1:3], 16)
    g = int(hex_color[3:5], 16)
    b = int(hex_color[5:7], 16)
    return f"rgba({r},{g},{b},{opacity})"

PREFIXES = ['', 'Top', 'Bottom', 'Left', 'Right']

def process_file(filepath: str) -> tuple[bool, int, int]:
    """Returns (changed, merged_count, stripped_count)."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content
    merged_count = 0

    for prefix in PREFIXES:
        color_key = f'border{prefix}Color'
        style_key = f'border{prefix}Style'
        opacity_key = f'border{prefix}Opacity'

        # Match: borderXColor: <expr>, [borderXStyle: 'solid',] borderXOpacity: <num>,
        pattern = re.compile(
            rf"{re.escape(color_key)}:\s*([^,\n]+),"
            rf"(?:\s*{re.escape(style_key)}:\s*['\"]solid['\"],)?"
            rf"\s*{re.escape(opacity_key)}:\s*([\d.]+),",
        )

        def repl(m: re.Match) -> str:
            nonlocal merged_count
            color_expr = m.group(1).strip()
            opacity = m.group(2)
            hex_val = TOKEN_HEX.get(color_expr)
            if hex_val:
                merged_count += 1
                rgba = hex_to_rgba(hex_val, opacity)
                return f"{color_key}: '{rgba}',"
            # Unknown color expression — leave color, drop opacity below
            return m.group(0)  # unchanged; handled by cleanup pass

        content = pattern.sub(repl, content)

    # ── Safety-net cleanup: strip any remaining border*Opacity lines ─────────
    stripped_count = 0
    cleanup_pattern = re.compile(r'[ \t]*border(?:Top|Bottom|Left|Right)?Opacity:\s*[\d.]+,\n?')
    def cleanup_repl(m: re.Match) -> str:
        nonlocal stripped_count
        stripped_count += 1
        return ''
    content = cleanup_pattern.sub(cleanup_repl, content)

    changed = content != original
    if changed:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

    return changed, merged_count, stripped_count

def find_source_files() -> list[str]:
    files = []
    for root, dirs, filenames in os.walk(SRC_DIR):
        dirs[:] = [d for d in dirs if d not in ('node_modules', '.next')]
        for fname in filenames:
            if fname.endswith('.tsx') or fname.endswith('.ts'):
                files.append(os.path.join(root, fname))
    return files

def main():
    if not os.path.isdir(SRC_DIR):
        print(f'ERROR: src directory not found at {SRC_DIR}')
        sys.exit(1)

    print(f'\nT3D borderOpacity Sweep')
    print(f'Project: {PROJECT_ROOT}\n')

    files = find_source_files()
    total_merged = 0
    total_stripped = 0
    files_changed = 0

    for filepath in files:
        changed, merged, stripped = process_file(filepath)
        if changed:
            rel = os.path.relpath(filepath, PROJECT_ROOT)
            print(f'  ✓ {rel}  (merged: {merged}, stripped: {stripped})')
            files_changed += 1
            total_merged += merged
            total_stripped += stripped

    print(f'\n{"─" * 60}')
    print(f'Files changed:      {files_changed}')
    print(f'Opacities merged into rgba():  {total_merged}')
    print(f'Opacities stripped (fallback): {total_stripped}')

    # Final verification — scan for any leftover occurrences
    remaining = 0
    for filepath in find_source_files():
        with open(filepath, 'r', encoding='utf-8') as f:
            remaining += len(re.findall(r'border(?:Top|Bottom|Left|Right)?Opacity:', f.read()))

    print(f'\nRemaining border*Opacity occurrences: {remaining}')
    if remaining == 0:
        print('✓ All instances resolved.')
    else:
        print('⚠ Some instances remain — re-run npm run build to see exactly where.')

    print('\nRe-run: npm run build')

if __name__ == '__main__':
    main()
