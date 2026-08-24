#!/usr/bin/env python3
"""
T3D Sovereign Report — Content Module System Audit
===================================================
Scans all section files for Level C content that has leaked into core pages.

Level C content patterns (should only appear on Page43DataNotes):
  — Raw gate numbers (e.g., "Gate 20", "gate_20")
  — Full planetary listings (Mars, Jupiter, Saturn, Neptune, Pluto)
  — All-12-house inventories
  — Exhaustive aspect tables
  — Full center-by-center inventory (all 9 centers in a list)
  — All Pinnacle/Challenge paragraphs in a single block
  — Raw calculation workbooks

Run from project root:
  python3 audit_content_modules.py
"""

import os, sys, re
from collections import defaultdict

PROJECT_ROOT = sys.argv[1] if len(sys.argv) > 1 else os.path.expanduser(
    '~/Developer/3dimensions.guide'
)
SECTION_DIR = os.path.join(PROJECT_ROOT, 'src', 'lib', 'report')

# ── Level C content patterns ──────────────────────────────────────────────────
LEVEL_C_PATTERNS = [
    # HD — Level C
    (r'\bgate[s]?\s+\d+\b',                 'HD',   'Gate numbers should be Field Library only'),
    (r'\bincarnation[_\s]cross\b',           'HD',   'Incarnation Cross is Level C — Field Library'),
    (r'\bvariable\b.*\barrows?\b',           'HD',   'Variable/arrows is Level C — Field Library'),
    (r'\bcircuit[_\s]group\b',               'HD',   'Circuit group is Level C — Field Library'),
    (r'(all|every|each)\s+(9|nine)\s+center', 'HD', 'Full center inventory is Level C'),

    # Numerology — Level C
    (r'\bhidden[_\s]passion\b',              'Num',  'Hidden Passion detail is Level B/C — verify page'),
    (r'\bmonth[_\s]by[_\s]month\b',         'Num',  'Month-by-month breakdown is Level C'),
    (r'\bpythagorean[_\s]letter\b',         'Num',  'Letter-value chart is Level C — Field Library'),
    (r'\bmaturity[_\s]number\b',             'Num',  'Maturity Number is Level C — Field Library'),
    (r'\bsubconscious[_\s]self\b',           'Num',  'Subconscious Self is Level C — Field Library'),

    # Astrology — Level C
    (r'\b(mars|jupiter|saturn|neptune|pluto)\b.*\bdegree', 'Ast', 'Outer planet degrees are Level C'),
    (r'\b(all|every|each)\s+(12|twelve)\s+house', 'Ast', 'All 12 houses is Level C — Field Library'),
    (r'\baspect[_\s]table\b',               'Ast',  'Aspect table is Level C — Field Library'),
    (r'\bsextile\b',                         'Ast',  'Sextile aspects are Level C — Field Library'),
    (r'\bprogressed\b',                      'Ast',  'Progressed chart is Level C — Field Library'),
    (r'\btransit[_\s]table\b',              'Ast',  'Transit table is Level C — Field Library'),
    (r'\basteroid\b',                        'Ast',  'Asteroid placements are Level C — Field Library'),
    (r'\bmidheaven\b.*\baspect',             'Ast',  'MC aspects are Level C — Field Library'),
]

# Pages that ARE ALLOWED to contain Level C content
LEVEL_C_ALLOWED_PAGES = {
    'Page43DataNotes.tsx',
    'contentModules.ts',
}

# ── Page designation from contentModules.ts ───────────────────────────────────
PAGE_LEVELS = {
    'Page5Dashboard.tsx':         'A',
    'Page11TypeStrategy.tsx':     'A',
    'Page12Authority.tsx':        'A',
    'Page13Profile.tsx':          'B',
    'Page14DefinedStrengths.tsx': 'B',
    'Page15OpenTerrain.tsx':      'B',
    'Page16Friction.tsx':         'B',
    'Page19LifePath.tsx':         'A',
    'Page20BirthdayAttitude.tsx': 'B',
    'Page21InnerDrivers.tsx':     'B',
    'Page22Pinnacles.tsx':        'B',
    'Page23Challenges.tsx':       'B',
    'Page27BigThree.tsx':         'A',
    'Pages27to28.tsx':            'A',
    'Page28ElementModality.tsx':  'B',
    'Pages29to33.tsx':            'B',
    'Page29RulerArenas.tsx':      'B',
    'Page30TensionsResources.tsx':'B',
    'Page43DataNotes.tsx':        'C',
}

# ── Editorial rules — what each level should contain ─────────────────────────
EDITORIAL_CHECKS = {
    'A': {
        'max_items_per_section': 4,
        'must_have': ['sectionTag', 'heading', 'sub'],
        'must_not_have': ['gate', 'house_1', 'sextile', 'progressed'],
    },
    'B': {
        'max_items_per_section': 6,
        'must_have': ['sectionTag', 'heading'],
        'must_not_have': ['gate_list', 'all_12_houses', 'full_aspect_table'],
    },
}

def find_section_files():
    files = []
    for section in ['section1','section2','section3','section4',
                    'section5','section6','section7','shared','schema']:
        path = os.path.join(SECTION_DIR, section)
        if not os.path.isdir(path): continue
        for fname in sorted(os.listdir(path)):
            if fname.endswith('.tsx') or fname.endswith('.ts'):
                files.append((os.path.join(path, fname), fname, section))
    return files

def audit_file(filepath, filename, section):
    """Check a file for Level C content violations."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read().lower()  # case-insensitive

    violations = []
    if filename in LEVEL_C_ALLOWED_PAGES:
        return violations  # allowed to have Level C content

    for pattern, system, message in LEVEL_C_PATTERNS:
        matches = re.findall(pattern, content, re.IGNORECASE)
        if matches:
            violations.append({
                'pattern': pattern,
                'system':  system,
                'message': message,
                'count':   len(matches),
            })

    return violations

def editorial_summary(files):
    """
    Produce an editorial summary of content distribution across levels.
    """
    level_counts = defaultdict(int)
    for _, fname, _ in files:
        level = PAGE_LEVELS.get(fname, '?')
        level_counts[level] += 1
    return level_counts

def main():
    if not os.path.isdir(SECTION_DIR):
        print(f'ERROR: Section dir not found at {SECTION_DIR}')
        sys.exit(1)

    files = find_section_files()
    print(f'\nT3D Content Module System Audit')
    print(f'Project: {PROJECT_ROOT}')
    print(f'Files scanned: {len(files)}\n')

    # 1. Level C violation scan
    all_violations = []
    print('─── LEVEL C CONTENT SCAN ───\n')
    print('Checking for reference-layer content in core pages...\n')

    for filepath, filename, section in files:
        violations = audit_file(filepath, filename, section)
        if violations:
            level = PAGE_LEVELS.get(filename, '?')
            print(f'  ⚠ {filename} [Level {level}]:')
            for v in violations:
                print(f'      {v["system"]}: {v["message"]} ({v["count"]}× found)')
            all_violations.extend(violations)
        else:
            level = PAGE_LEVELS.get(filename, '—')
            print(f'  ✓ {filename:<44} [Level {level}]')

    # 2. Editorial summary
    print(f'\n─── EDITORIAL SUMMARY ───\n')
    level_counts = editorial_summary(files)
    print(f'  Level A (Essential):   {level_counts.get("A", 0)} pages')
    print(f'  Level B (Contextual):  {level_counts.get("B", 0)} pages')
    print(f'  Level C (Reference):   {level_counts.get("C", 0)} pages  ← Field Library')
    print(f'  Unclassified:          {level_counts.get("?", 0)} pages')

    # 3. Content module compliance
    print(f'\n─── CONTENT MODULE COMPLIANCE ───\n')

    hd_a = ['Type', 'Strategy', 'Authority', 'Signature', 'Not-Self theme']
    hd_b = ['Profile', 'Defined centers (2–3 capacities)', 'Open center themes (top 3)']
    num_a = ['Life Path (compound display)', 'Personal Year', 'Life Path direction']
    num_b = ['Birthday', 'Attitude', 'Current Pinnacle', 'Current Challenge']
    ast_a = ['Sun', 'Moon', 'Rising', 'Element pattern', 'Modality pattern']
    ast_b = ['Chart ruler', 'Sun house', 'Sun-Moon dynamic', 'Seasonal orientation']

    for system, a_items, b_items in [
        ('Human Design', hd_a, hd_b),
        ('Numerology',   num_a, num_b),
        ('Astrology',    ast_a, ast_b),
    ]:
        print(f'  {system}:')
        print(f'    Level A: {", ".join(a_items[:3])}{"..." if len(a_items) > 3 else ""}')
        print(f'    Level B: {", ".join(b_items[:3])}{"..." if len(b_items) > 3 else ""}')
        print(f'    Level C: → Field Library (3dimensions.guide/library)')
        print()

    # 4. Result
    print(f'{"─" * 56}')
    if all_violations:
        print(f'Found {len(all_violations)} potential Level C items in core pages.')
        print('Review each flagged item and move to Page43DataNotes')
        print('or add a Field Library reference using FieldLibraryCallout.')
    else:
        print('✓ No Level C content found in core report pages.')
        print('  The report selects rather than dumps.')
    print()

if __name__ == '__main__':
    main()
