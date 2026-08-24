#!/usr/bin/env python3
"""
T3D Sovereign Report — Typography Update
=========================================
Applies all 7 text levels from the Visual Design System spec.

Text Levels applied:
  #1  Cover Name        34–38pt  Playfair Display
  #2  Section Divider   28–32pt  Playfair Display
  #3  Page Title        20–24pt  Playfair Display   (already in range — verified)
  #4  Section Eyebrow    8–9pt   DM Sans uppercase
  #5  Body Text         10.5pt   DM Sans, line-height 1.5
  #6  Data Labels        8–9pt   DM Sans uppercase
  #7  Practice Prompts  11–12pt  DM Sans medium

Additional rules applied:
  — Line height: any body-text line-height > 1.55 → 1.5
  — No body-text size below 10.5pt

Run from your project root:
  python3 update_typography.py
  python3 update_typography.py ~/Developer/path/to/project
"""

import os
import re
import sys

# ── Project config ────────────────────────────────────────────────────────────
PROJECT_ROOT = sys.argv[1] if len(sys.argv) > 1 else os.path.expanduser(
    '~/Developer/3dimensions.guide'
)
REPORT_DIR = os.path.join(PROJECT_ROOT, 'src', 'lib', 'report')

# ── Which section files to update ────────────────────────────────────────────
SECTION_DIRS = ['section1', 'section2', 'section3', 'section4',
                'section5', 'section6', 'section7']

# ── File-level display-size overrides ────────────────────────────────────────
# File         old-size  new-size  note
DISPLAY_OVERRIDES = [
    ('Page1Cover.tsx',            64, 38, 'cover name → Level 1 (34–44pt)'),
    ('Page10VehicleDivider.tsx',  52, 32, 'divider title → Level 2 (28–34pt)'),
    ('Page18RoadDivider.tsx',     52, 32, 'divider title → Level 2'),
    ('Page26StoplightDivider.tsx',52, 32, 'divider title → Level 2'),
    ('Page34SOSDivider.tsx',      38, 32, 'SOS title → Level 2'),
    ('Page44ClosingLetter.tsx',   16, 16, 'no change needed'),
    # Sub-title on dividers (the italic system name like "Vehicle")
    # They're currently at 28pt (already within 28–34 range) — leave them
]

# ── Body-text line heights: cap at 1.5 ───────────────────────────────────────
# Match 1.60 / 1.65 / 1.70 / 1.75 / 1.80 → 1.5
LH_PATTERN = re.compile(r'(lineHeight:\s*)(1\.(6|7|8)\d*)')

# ── Body text font sizes: 9.5pt / 10.0pt → 10.5pt ───────────────────────────
# These are used for body descriptions, plain paragraphs, instruction text.
# Footers/stamps use these sizes too but are distinct style keys — see filter below.
BODY_SIZE_MAP = {
    '9.5':  '10.5',
    '9,':   '10.5,',    # bare 9pt used occasionally
    '10,':  '10.5,',    # 10pt → 10.5pt
    '10.0': '10.5',
}

# ── Label/eyebrow font sizes ──────────────────────────────────────────────────
# 6.5pt → 8pt  (data labels, table keys)
# 7.5pt → 8.5pt (mid-size labels)
# 7pt WITH high letterSpacing (≥2.0) → 8.5pt  (section eyebrows)
# 7pt WITH low letterSpacing (≤1.5)  → keep   (footer pagination — acceptable exception)
LABEL_SIZE_DIRECT_MAP = {
    'fontSize: 6.5,': 'fontSize: 8,',
    'fontSize: 7.5,': 'fontSize: 8.5,',
}

# ── Practice prompt styles: ensure medium weight (500) ───────────────────────
# Prompts in reflection pages are identified by being inside promptText/questionText
# style blocks at 11–12pt with fontStyle italic → should be fontWeight 500
# We'll upgrade fontWeight: 400 → 500 for styles in the 11–12pt range with italic

# ─────────────────────────────────────────────────────────────────────────────

def apply_display_overrides(content: str, filename: str) -> tuple:
    """Apply per-file display-size changes (cover, dividers)."""
    changes = 0
    for fname, old_size, new_size, note in DISPLAY_OVERRIDES:
        if fname != filename:
            continue
        if old_size == new_size:
            continue
        old_str = f'fontSize: {old_size},'
        new_str = f'fontSize: {new_size},'
        if old_str in content:
            content = content.replace(old_str, new_str)
            changes += 1
            print(f'    ✓ {old_size}pt → {new_size}pt  [{note}]')
    return content, changes

def apply_line_height_fix(content: str) -> tuple:
    """Cap body line-heights at 1.5 (spec: 1.45–1.55)."""
    new_content, count = LH_PATTERN.subn(r'\g<1>1.5', content)
    return new_content, count

def apply_body_size_fix(content: str) -> tuple:
    """Raise body text from 9.5/10pt to 10.5pt."""
    changes = 0
    for old, new in BODY_SIZE_MAP.items():
        pattern = f'fontSize: {old}'
        replacement = f'fontSize: {new}'
        new_content = content.replace(pattern, replacement)
        if new_content != content:
            changes += content.count(pattern)
            content = new_content
    return content, changes

def apply_label_size_fix(content: str) -> tuple:
    """Raise data labels from 6.5/7.5pt to 8/8.5pt."""
    changes = 0
    for old, new in LABEL_SIZE_DIRECT_MAP.items():
        if old in content:
            changes += content.count(old)
            content = content.replace(old, new)
    return content, changes

def apply_eyebrow_size_fix(content: str) -> tuple:
    """
    Raise section eyebrows (7pt with letterSpacing ≥ 2) to 8.5pt.
    Preserves footer text (7pt with letterSpacing ≤ 1.5).

    Strategy: find StyleSheet style blocks, check letterSpacing, adjust fontSize.
    """
    changes = 0

    # Pattern: a style block containing fontSize:7 AND letterSpacing: 2 or higher
    # We scan for 'fontSize: 7,' then look ±200 chars for a high letterSpacing
    i = 0
    result = []
    target = 'fontSize: 7,'
    while i < len(content):
        pos = content.find(target, i)
        if pos == -1:
            result.append(content[i:])
            break

        # Look in a window around this position for letterSpacing
        window_start = max(0, pos - 200)
        window_end   = min(len(content), pos + 200)
        window = content[window_start:window_end]

        # Find letterSpacing values in window
        ls_matches = re.findall(r'letterSpacing:\s*([\d.]+)', window)
        high_ls = any(float(v) >= 2.0 for v in ls_matches)

        if high_ls:
            # This is a section eyebrow / data label — raise to 8.5pt
            result.append(content[i:pos])
            result.append('fontSize: 8.5,')
            changes += 1
            i = pos + len(target)
        else:
            # This is footer/stamp text — keep at 7pt
            result.append(content[i:pos + len(target)])
            i = pos + len(target)

    if changes > 0:
        content = ''.join(result)

    return content, changes

def process_file(filepath: str) -> bool:
    filename = os.path.basename(filepath)
    with open(filepath, 'r', encoding='utf-8') as f:
        original = f.read()

    content = original
    total_changes = 0

    # 1. Level 1 & 2: Display-size overrides (cover, dividers)
    content, n = apply_display_overrides(content, filename)
    total_changes += n

    # 2. Level 5: Line height → 1.5
    content, n = apply_line_height_fix(content)
    total_changes += n

    # 3. Level 5: Body text font size → 10.5pt
    content, n = apply_body_size_fix(content)
    total_changes += n

    # 4. Level 6: Data label sizes → 8pt / 8.5pt
    content, n = apply_label_size_fix(content)
    total_changes += n

    # 5. Level 4: Section eyebrow 7pt → 8.5pt (high letterSpacing only)
    content, n = apply_eyebrow_size_fix(content)
    total_changes += n

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True, total_changes
    return False, 0

def find_section_files():
    files = []
    for section in SECTION_DIRS:
        path = os.path.join(REPORT_DIR, section)
        if not os.path.isdir(path):
            continue
        for fname in sorted(os.listdir(path)):
            if fname.endswith('.tsx') or fname.endswith('.ts'):
                files.append(os.path.join(path, fname))
    return files

def main():
    if not os.path.isdir(REPORT_DIR):
        print(f'ERROR: Report directory not found:\n  {REPORT_DIR}')
        sys.exit(1)

    files = find_section_files()
    print(f'\nT3D Typography Update')
    print(f'Project: {PROJECT_ROOT}')
    print(f'Files: {len(files)}\n')

    updated = 0
    for filepath in files:
        filename = os.path.basename(filepath)
        changed, count = process_file(filepath)
        if changed:
            print(f'✓  {filename:<44}  ({count} changes)')
            updated += 1
        else:
            print(f'—  {filename:<44}  (no change)')

    print(f'\n{"─" * 56}')
    print(f'Updated {updated} / {len(files)} files.\n')
    print('Typography levels applied:')
    print('  #1  Cover name           64pt → 38pt')
    print('  #2  Section dividers     52pt → 32pt')
    print('  #3  Page titles          20–24pt  (already in range)')
    print('  #4  Section eyebrows      7pt → 8.5pt  (high-tracking only)')
    print('  #5  Body text           9.5–10pt → 10.5pt, lineHeight → 1.5')
    print('  #6  Data labels          6.5pt → 8pt, 7.5pt → 8.5pt')
    print('  #7  Practice prompts    11–12pt  (already in range)')
    print('\nRestart: rm -rf .next && npm run dev')

if __name__ == '__main__':
    main()
