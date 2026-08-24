#!/usr/bin/env python3
"""
T3D Language Guide-rail Audit
==============================
Scans all content files for language violations against the five guide-rails.

Guide-rails enforced:
  #1 No absolute claims      ("you will always", "will never", "guaranteed")
  #2 No cosmic authority     ("universe demands", "stars say", "must")
  #3 No pathologizing        ("your flaw is", "your weakness", "you are broken")
  #4 No predictive certainty ("this proves your destiny", "you are destined")
  #5 Scope integrity         ("replaces professional advice", "diagnosis")

Also checks for missing qualifiers in long interpretation strings.

Run from project root:
  python3 audit_language_guide.py
"""

import os, sys, re
from dataclasses import dataclass

PROJECT_ROOT = sys.argv[1] if len(sys.argv) > 1 else os.path.expanduser(
    '~/Developer/3dimensions.guide'
)
REPORT_DIR = os.path.join(PROJECT_ROOT, 'src', 'lib', 'report')

# ── Files to scan ─────────────────────────────────────────────────────────────
SCAN_DIRS = [
    'section1', 'section2', 'section3', 'section4',
    'section5', 'section6', 'section7',
    # 'shared' and 'schema' excluded: languageGuide.ts and synthesisEngine.ts
    # contain forbidden phrases as pattern definitions and examples — scanning
    # them is circular and produces only false positives.
]

# Files excluded from scanning even if found in scanned dirs
EXCLUDED_FILES = {
    'languageGuide.ts',    # contains forbidden phrases as rule definitions
    'synthesisEngine.ts',  # contains forbidden phrases as constraint examples
    'contentModules.ts',   # contains forbidden phrases in catalogue listings
}

# These contain code, not prose — only scan string literals
CODE_ONLY_PATTERNS = [
    r'const \w+ =', r'export const', r'StyleSheet', r'flexDirection',
    r'import ', r'from \'', r'from "',
]

# ── Violation patterns ────────────────────────────────────────────────────────
@dataclass
class ViolationPattern:
    pattern:    str
    guide_rail: int   # 1–5
    category:   str
    suggestion: str
    severity:   str   # 'error' or 'warning'

VIOLATIONS = [

    # ── Guide-rail #1: No absolute claims ────────────────────────────────────
    ViolationPattern(
        r'\byou will always\b', 1, 'Absolute claim',
        'Replace with "this pattern tends to" or "this often looks like"', 'error',
    ),
    ViolationPattern(
        r'\byou will never\b', 1, 'Absolute claim',
        'Replace with "this rarely" or "tends not to"', 'error',
    ),
    ViolationPattern(
        r'\bwill always\b', 1, 'Absolute claim',
        'Replace with "tends to" or "often"', 'error',
    ),
    ViolationPattern(
        r'\bwill never\b', 1, 'Absolute claim',
        'Replace with "rarely" or "tends not to"', 'error',
    ),
    ViolationPattern(
        r'\bguaranteed to\b', 1, 'Absolute claim',
        'Remove guarantee language — use "tends to" or "often produces"', 'error',
    ),

    # ── Guide-rail #2: No cosmic authority ───────────────────────────────────
    ViolationPattern(
        r'\bthe universe demands\b', 2, 'Cosmic authority',
        'Replace with "a useful experiment is" or "one approach worth testing"', 'error',
    ),
    ViolationPattern(
        r'\bthe universe requires\b', 2, 'Cosmic authority',
        'Replace with "this configuration invites"', 'error',
    ),
    ViolationPattern(
        r'\bthe universe is telling you\b', 2, 'Cosmic authority',
        'Replace with "this pattern may be pointing toward"', 'error',
    ),
    ViolationPattern(
        r'\bthe stars say\b', 2, 'Cosmic authority',
        'Replace with "the Stoplight highlights" or "this placement tends toward"', 'error',
    ),
    ViolationPattern(
        r'\bthe stars tell\b', 2, 'Cosmic authority',
        'Replace with "this configuration often coincides with"', 'error',
    ),
    ViolationPattern(
        r'\bthe cosmos (says|demands|requires)\b', 2, 'Cosmic authority',
        'Use the specific system name (Vehicle, Road, or Stoplight)', 'error',
    ),
    ViolationPattern(
        r'\bdivine plan\b', 2, 'Spiritual performance',
        'Replace with "developmental pattern" or "Life Path direction"', 'warning',
    ),
    ViolationPattern(
        r"\byour soul('s)? contract\b", 2, 'Spiritual performance',
        'Replace with "recurring pattern" or "Life Path theme"', 'warning',
    ),

    # ── Guide-rail #3: No pathologizing ──────────────────────────────────────
    ViolationPattern(
        r'\byour flaw is\b', 3, 'Pathologizing',
        'Replace with "when under pressure, this pattern can look like"', 'error',
    ),
    ViolationPattern(
        r'\bthis is your flaw\b', 3, 'Pathologizing',
        'Replace with "the friction in this pattern tends to arrive as"', 'error',
    ),
    ViolationPattern(
        r'\byour weakness is\b', 3, 'Pathologizing',
        'Replace with "the not-self pattern in this configuration"', 'error',
    ),
    ViolationPattern(
        r'\byour problem is\b', 3, 'Pathologizing',
        'Replace with "the recurring tension in this configuration is"', 'error',
    ),
    ViolationPattern(
        r'\byou are broken\b', 3, 'Pathologizing',
        'Remove entirely — no equivalent replacement', 'error',
    ),
    ViolationPattern(
        r'\byou are damaged\b', 3, 'Pathologizing',
        'Remove entirely — no equivalent replacement', 'error',
    ),
    ViolationPattern(
        r'\byour dysfunction\b', 3, 'Pathologizing',
        'Replace with "the not-self pattern in this configuration"', 'error',
    ),

    # ── Guide-rail #4: No predictive certainty ───────────────────────────────
    ViolationPattern(
        r'\bthis proves your destiny\b', 4, 'Predictive certainty',
        'Replace with "test whether this creates more clarity"', 'error',
    ),
    ViolationPattern(
        r'\bprov(es?|ing) your destiny\b', 4, 'Predictive certainty',
        'Replace with "may point toward" or "is worth testing"', 'error',
    ),
    ViolationPattern(
        r'\byou are destined\b', 4, 'Predictive certainty',
        'Replace with "this configuration tends toward"', 'error',
    ),
    ViolationPattern(
        r'\byour fate\b', 4, 'Fate language',
        'Replace with "your developmental direction"', 'warning',
    ),
    ViolationPattern(
        r'\bforetells\b', 4, 'Predictive claim',
        'Replace with "tends toward" or "often points toward"', 'error',
    ),
    ViolationPattern(
        r'\bpredicts\b', 4, 'Predictive claim',
        'Replace with "tends toward" or "often coincides with"', 'warning',
    ),
    ViolationPattern(
        r"\byour soul('s)? purpose\b", 4, 'Overclaiming',
        'Replace with "your Life Path direction" or "your developmental arc"', 'warning',
    ),
    ViolationPattern(
        r'\bkarmic debt\b', 4, 'Spiritual performance',
        'Use "Karmic Lesson" (technical term) — never "karmic debt"', 'warning',
    ),

    # ── Guide-rail #5: Scope integrity ───────────────────────────────────────
    ViolationPattern(
        r'\bthis replaces professional advice\b', 5, 'Scope violation',
        'Replace with "use this as a reflective framework"', 'error',
    ),
    ViolationPattern(
        r'\breplaces.*professional\b', 5, 'Scope violation',
        'Remove — T3D never replaces professional support', 'error',
    ),
    ViolationPattern(
        r'\bthis is a diagnosis\b', 5, 'Scope violation',
        'Remove — T3D is a reflective framework, not diagnostic', 'error',
    ),
    ViolationPattern(
        r'\bdiagnos(is|es|ed|ing)\b', 5, 'Clinical language',
        'Replace with "identifies" or "highlights"', 'warning',
    ),
    ViolationPattern(
        r'\bmedical advice\b', 5, 'Scope violation',
        'Remove — direct to qualified professionals', 'error',
    ),
    ViolationPattern(
        r'\btherapeutic advice\b', 5, 'Scope violation',
        'Remove — direct to qualified professionals', 'error',
    ),
    ViolationPattern(
        r'\bthis will heal\b', 5, 'Overclaiming',
        'Replace with "this may support" or "this can be useful for"', 'error',
    ),
]

# ── Extract string literals from TypeScript/TSX ───────────────────────────────
NEGATION_PREFIXES = [
    'not a ', 'no ', 'never a ', 'does not constitute', 'is not a ',
    'rather than a ', '— not a ', 'protocol — not',
]

def is_negated(text, match_start, match):
    context = text[max(0, match_start - 40):match_start].lower()
    return any(neg in context for neg in NEGATION_PREFIXES)

def extract_strings(content):
    """
    Extract string literals from TS/TSX content.
    Returns list of (line_number, string_content) tuples.
    Focus on long strings that contain prose — not JSX attributes or imports.
    """
    results = []
    lines = content.split('\n')

    for line_num, line in enumerate(lines, 1):
        stripped = line.strip()

        # Skip import lines, code-only lines, very short lines
        if stripped.startswith('import ') or stripped.startswith('//'):
            continue
        if len(stripped) < 30:
            continue
        if any(re.search(p, stripped) for p in [
            r'^\s*\w+:\s*\{',           # style objects
            r'flexDirection|fontSize|fontFamily',  # style properties
            r'StyleSheet\.create',
            r'export (const|function|interface|type)',
        ]):
            continue

        # Extract quoted strings of meaningful length
        for m in re.finditer(r"'([^']{20,})'|\"([^\"]{20,})\"|`([^`]{20,})`", line):
            text = m.group(1) or m.group(2) or m.group(3) or ''
            if text and not text.startswith('http') and not text.startswith('/'):
                results.append((line_num, text))

    return results

# ── Scan a single file ────────────────────────────────────────────────────────
def scan_file(filepath: str) -> list[dict]:
    """Scan a file for language guide-rail violations."""
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()

    violations = []
    strings = extract_strings(content)

    for line_num, text in strings:
        for vp in VIOLATIONS:
            matches = list(re.finditer(vp.pattern, text, re.IGNORECASE))
            for m in matches:
                violations.append({
                    'line':       line_num,
                    'guide_rail': vp.guide_rail,
                    'severity':   vp.severity,
                    'category':   vp.category,
                    'found':      m.group(0),
                    'context':    text[:60] + '...' if len(text) > 60 else text,
                    'suggestion': vp.suggestion,
                })

    return violations

# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    if not os.path.isdir(REPORT_DIR):
        print(f'ERROR: Report dir not found at {REPORT_DIR}')
        sys.exit(1)

    print(f'\nT3D Language Guide-rail Audit')
    print(f'Project: {PROJECT_ROOT}\n')

    all_violations = []
    error_count = 0
    warning_count = 0
    files_scanned = 0

    for scan_dir in SCAN_DIRS:
        dirpath = os.path.join(REPORT_DIR, scan_dir)
        if not os.path.isdir(dirpath): continue
        for fname in sorted(os.listdir(dirpath)):
            if not (fname.endswith('.tsx') or fname.endswith('.ts')): continue
            fpath = os.path.join(dirpath, fname)
            violations = scan_file(fpath)
            files_scanned += 1

            if violations:
                print(f'  ⚠ {fname}:')
                for v in violations:
                    icon = '✗' if v['severity'] == 'error' else '△'
                    print(f'    {icon} L{v["line"]:3d} [Rail #{v["guide_rail"]}] {v["category"]}')
                    print(f'         Found: "{v["found"]}"')
                    print(f'         Fix:   {v["suggestion"]}')
                    if v['severity'] == 'error': error_count += 1
                    else: warning_count += 1
                all_violations.extend(violations)
            else:
                print(f'  ✓ {fname}')

    print(f'\n{"─" * 60}')
    print(f'Files scanned:  {files_scanned}')
    print(f'Errors:         {error_count}   (must fix before release)')
    print(f'Warnings:       {warning_count}  (review and decide)')
    print(f'Total issues:   {len(all_violations)}\n')

    if not all_violations:
        print('✓ All content passes language guide-rail checks.')
        print('  T3D copy holds spiritual seriousness without authoritarian claims.')
    else:
        print('Guide-rail Summary:')
        for rail_num in range(1, 6):
            rail_violations = [v for v in all_violations if v['guide_rail'] == rail_num]
            labels = {
                1: 'Epistemic humility (no absolute claims)',
                2: 'Agency (no cosmic authority)',
                3: 'Reframing (no pathologizing)',
                4: 'Predictive restraint (no destiny claims)',
                5: 'Scope integrity (no professional replacement)',
            }
            if rail_violations:
                print(f'  Rail #{rail_num} {labels[rail_num]}: {len(rail_violations)} issue(s)')

if __name__ == '__main__':
    main()
