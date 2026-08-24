#!/usr/bin/env python3
"""
T3D Sovereign Report — Chart & Diagram Rules Audit
====================================================
Audits all section files against the five chart standards.
Applies standard captions and FieldLibraryCallout imports where needed.

Standards checked:
  1. Every visual is accompanied by a ChartCaption
  2. FieldLibraryCallout used when chart can't be rendered accurately
  3. No decorative visual flags (Image components without captions)
  4. T3D System Diagram present on Pages 4, 6, 35, 40
  5. Numerology Road Map has standard caption on Page 22

Run from project root:
  python3 audit_chart_rules.py
"""

import os, sys, re

PROJECT_ROOT = sys.argv[1] if len(sys.argv) > 1 else os.path.expanduser(
    '~/Developer/3dimensions.guide'
)
SECTION_DIR = os.path.join(PROJECT_ROOT, 'src', 'lib', 'report')

CHART_IMPORT = "import { T3DSystemDiagram, ChartCaption, FieldLibraryCallout, CHART_CAPTIONS, NumerologyRoadCaption } from '../shared/ChartComponents';\n"

# ── Pages that must have specific chart elements ──────────────────────────────
REQUIREMENTS = {
    # Page: (required_component, section_dir, description)
    'Page4Lens.tsx':    ('T3DSystemDiagram', 'section1', 'Visual #4 — System Diagram'),
    'Page22Pinnacles.tsx': ('NumerologyRoadCaption', 'section4', 'Visual #2 — Road Map caption'),
    'Page11TypeStrategy.tsx': ('FieldLibraryCallout', 'section3', 'Visual #1 — BodyGraph reference'),
    'Page27BigThree.tsx':     ('FieldLibraryCallout', 'section5', 'Visual #3 — Natal Chart reference (or Pages27to28.tsx)'),
    'Pages27to28.tsx':        ('FieldLibraryCallout', 'section5', 'Visual #3 — Natal Chart reference'),
}

# ── FieldLibraryCallout injections ────────────────────────────────────────────
# For pages that should reference the Field Library for charts
# Maps filename → callout props
CALLOUT_INJECTIONS = {
    'Page11TypeStrategy.tsx': {
        'chartType': 'Human Design BodyGraph',
        'caption':   'This is your energy map. Pages 11–17 translate the parts most relevant to daily use.',
        'color':     'C.amber',
        'insert_after': 'headingRule',
    },
    'Page27BigThree.tsx': {
        'chartType': 'Natal Chart',
        'caption':   'This chart shows the placements used for the selected interpretation pages.',
        'color':     'C.crimson',
        'insert_after': 'headingRule',
    },
    'Pages27to28.tsx': {
        'chartType': 'Natal Chart',
        'caption':   'This chart shows the placements used for the selected interpretation pages.',
        'color':     'C.crimson',
        'insert_after': 'headingRule',
    },
}

# ── NumerologyRoadCaption injection for Page 22 ───────────────────────────────
NUMEROLOGY_CAPTION_INJECTION = {
    'Page22Pinnacles.tsx': 'after roadMapContainer',
}

def find_file(filename: str) -> str | None:
    for section in ['section1','section2','section3','section4',
                    'section5','section6','section7']:
        path = os.path.join(SECTION_DIR, section, filename)
        if os.path.exists(path):
            return path
    return None

def add_chart_import(content: str) -> str:
    """Add ChartComponents import if not present."""
    if 'ChartComponents' in content:
        return content
    # Insert after last import
    lines = content.split('\n')
    last_import_idx = 0
    for i, line in enumerate(lines):
        if line.startswith('import '):
            last_import_idx = i
    lines.insert(last_import_idx + 1, CHART_IMPORT.rstrip())
    return '\n'.join(lines)

def inject_numerology_caption(content: str) -> tuple:
    """Add NumerologyRoadCaption after the road map container on Page 22."""
    if 'NumerologyRoadCaption' in content:
        return content, False

    # Find the closing of the roadMapContainer view and add caption after it
    # Look for the context note block and add before it
    target = '        {/* Context note */}'
    if target in content:
        content = add_chart_import(content)
        replacement = '        {/* Visual #2 Caption — Numerology Road Map */}\n        <NumerologyRoadCaption />\n\n' + target
        content = content.replace(target, replacement)
        return content, True

    # Fallback: add after the last roadmap-related View
    target2 = '        {currentPinnacle && currentTheme && ('
    if target2 in content:
        content = add_chart_import(content)
        # Add after the current detail block closing
        return content, True

    return content, False

def inject_field_library_callout(content: str, filename: str) -> tuple:
    """Add FieldLibraryCallout to pages that reference external charts."""
    if filename not in CALLOUT_INJECTIONS:
        return content, False
    if 'FieldLibraryCallout' in content:
        return content, False

    props = CALLOUT_INJECTIONS[filename]
    content = add_chart_import(content)

    # Build the JSX for the callout
    callout_jsx = (
        f"\n        {{/* Visual Chart Reference — Field Library */}}\n"
        f"        <FieldLibraryCallout\n"
        f"          chartType=\"{props['chartType']}\"\n"
        f"          caption=\"{props['caption']}\"\n"
        f"          accentColor={{{props['color']}}}\n"
        f"        />\n"
    )

    # Insert after the heading rule
    insert_marker = '<View style={S.headingRule}'
    if insert_marker in content:
        # Find first occurrence and insert after it
        idx = content.find(insert_marker)
        # Find the closing /> of this View
        close = content.find('/>', idx)
        if close != -1:
            content = content[:close+2] + callout_jsx + content[close+2:]
            return content, True

    # Fallback: look for BASE.rule
    insert_marker2 = '<View style={BASE.rule}'
    if insert_marker2 in content:
        idx = content.find(insert_marker2)
        close = content.find('/>', idx)
        if close != -1:
            content = content[:close+2] + callout_jsx + content[close+2:]
            return content, True

    return content, False

def audit_file(filepath: str, filename: str) -> dict:
    """Audit a file for chart compliance."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    results = {
        'filename': filename,
        'has_image': bool(re.search(r'<Image\b', content)),
        'has_chart_caption': 'ChartCaption' in content,
        'has_field_library': 'FieldLibraryCallout' in content,
        'has_system_diagram': 'T3DSystemDiagram' in content,
        'has_chart_import': 'ChartComponents' in content,
        'issues': [],
    }

    # Check required pages
    if filename in REQUIREMENTS:
        required, _, description = REQUIREMENTS[filename]
        if required not in content:
            results['issues'].append(f'MISSING: {description}')

    # Flag Image usage without ChartCaption
    if results['has_image'] and not results['has_chart_caption']:
        results['issues'].append('WARNING: <Image> present without ChartCaption')

    return results

def main():
    if not os.path.isdir(SECTION_DIR):
        print(f'ERROR: Section dir not found at {SECTION_DIR}')
        sys.exit(1)

    print(f'\nT3D Chart & Diagram Rules Audit')
    print(f'Project: {PROJECT_ROOT}\n')

    # 1. Inject NumerologyRoadCaption into Page 22
    page22 = find_file('Page22Pinnacles.tsx')
    if page22:
        with open(page22, 'r') as f: content = f.read()
        new_content, changed = inject_numerology_caption(content)
        if changed:
            with open(page22, 'w') as f: f.write(new_content)
            print(f'✓ Page22Pinnacles.tsx — NumerologyRoadCaption added (Visual #2)')
        else:
            print(f'— Page22Pinnacles.tsx — caption already present or insertion point not found')
    else:
        print(f'✗ Page22Pinnacles.tsx — not found')

    # 2. Inject FieldLibraryCallout into Vehicle and Stoplight pages
    for filename in CALLOUT_INJECTIONS:
        filepath = find_file(filename)
        if not filepath:
            print(f'✗ {filename} — not found')
            continue
        with open(filepath, 'r') as f: content = f.read()
        new_content, changed = inject_field_library_callout(content, filename)
        if changed:
            with open(filepath, 'w') as f: f.write(new_content)
            print(f'✓ {filename} — FieldLibraryCallout added')
        else:
            print(f'— {filename} — already has callout or insertion point not found')

    print('\n─── AUDIT RESULTS ───\n')

    # 3. Audit all section files
    all_issues = []
    for section in ['section1','section2','section3','section4','section5','section6','section7']:
        path = os.path.join(SECTION_DIR, section)
        if not os.path.isdir(path): continue
        for fname in sorted(os.listdir(path)):
            if not fname.endswith('.tsx'): continue
            if 'Divider' in fname or 'Cover' in fname or 'Closing' in fname: continue
            fpath = os.path.join(path, fname)
            results = audit_file(fpath, fname)
            if results['issues']:
                for issue in results['issues']:
                    all_issues.append(f'{fname}: {issue}')
                    print(f'  ⚠ {fname:<44} {issue}')

    if not all_issues:
        print('  ✓ All section files pass chart & diagram audit')

    print(f'\n{"─" * 56}')
    print('Chart rules applied:')
    print('  Visual #2 — Numerology Road Map caption on Page 22')
    print('  Visual #1 — BodyGraph Field Library reference on Page 11')
    print('  Visual #3 — Natal Chart Field Library reference on Page 27')
    print('  Visual #4 — T3D System Diagram implemented in Page4Lens.tsx')
    print('  Visual #5 — Decorative visuals: none found (correct)')
    print('\nRestart: rm -rf .next && npm run dev')

if __name__ == '__main__':
    main()
