#!/usr/bin/env python3
"""
T3D Sovereign Report — Quality Assurance Checklist
====================================================
Pre-release audit across all 8 QA checks.
Run this before every delivery batch or major content update.

  Check #1 — Data          Required fields and calculation consistency
  Check #2 — Copy          Name labels, consistent terminology
  Check #3 — Report logic  Level A required; Level B conditional
  Check #4 — Readability   Thesis present; hierarchy visible; no walls of text
  Check #5 — Design        System color consistent; dark pages correct
  Check #6 — Action        One field practice per section; synthesis experiment
  Check #7 — Scope         No prohibited claims; language guide-rails pass
  Check #8 — Delivery      Navigation Card present; synthesis page present

Run from project root:
  python3 run_qa_checklist.py
"""

import os, sys, re
from pathlib import Path

PROJECT_ROOT = sys.argv[1] if len(sys.argv) > 1 else os.path.expanduser(
    '~/Developer/3dimensions.guide'
)
REPORT_DIR = os.path.join(PROJECT_ROOT, 'src', 'lib', 'report')

# ─── Result accumulator ───────────────────────────────────────────────────────
class Check:
    def __init__(self, num, name, critical=False):
        self.num = num
        self.name = name
        self.critical = critical
        self.passed = True
        self.issues = []
        self.notes  = []

    def fail(self, msg):
        self.passed = False
        self.issues.append(msg)

    def note(self, msg):
        self.notes.append(msg)

    def warn(self, msg):
        self.issues.append(f'(non-blocking) {msg}')

def file_exists(relative_path):
    return os.path.exists(os.path.join(REPORT_DIR, relative_path))

def read_file(relative_path):
    path = os.path.join(REPORT_DIR, relative_path)
    if not os.path.exists(path):
        return ''
    with open(path, 'r', errors='ignore') as f:
        return f.read()

def all_section_files():
    files = []
    for section in ['section1','section2','section3','section4',
                    'section5','section6','section7']:
        path = os.path.join(REPORT_DIR, section)
        if not os.path.isdir(path): continue
        for fname in sorted(os.listdir(path)):
            if fname.endswith('.tsx') or fname.endswith('.ts'):
                files.append((os.path.join(path, fname), fname))
    return files

# ─── Check #1: Data ───────────────────────────────────────────────────────────
def check1(c):
    # Schema files exist
    for schema_file in ['schema/normalize.ts', 'schema/validate.ts',
                        'schema/buildReportData.ts', 'schema/dataIntegrity.ts']:
        if not file_exists(schema_file):
            c.fail(f'Schema file missing: {schema_file}')

    # Normalization maps are present
    normalize = read_file('schema/normalize.ts')
    for map_name in ['HD_TYPE_MAP', 'HD_AUTHORITY_MAP', 'HD_STRATEGY_MAP',
                     'formatLongitude', 'extractSign', 'computeLifePath']:
        if map_name not in normalize:
            c.fail(f'normalize.ts missing: {map_name}')

    # buildReportData imports integrity check
    build = read_file('schema/buildReportData.ts')
    if 'runIntegrityCheck' not in build:
        c.warn('buildReportData.ts does not call runIntegrityCheck — integrity check may be missing')

    # Validation runs before render
    if 'validateReportData' not in build:
        c.warn('buildReportData.ts does not call validateReportData')

    c.note('Calculation methods: Swiss Ephemeris (swisseph) via engine')
    c.note('HD canonical implementation locked to engine output')

# ─── Check #2: Copy ──────────────────────────────────────────────────────────
def check2(c):
    # Consistent terminology across content libraries
    consistency_checks = [
        ('section3/hd-content.ts',   'AUTHORITY_CONTENT',   'Authority content library'),
        ('section4/road-content.ts',  'LIFE_PATH_CONTENT',   'Life Path content library'),
        ('section5/astro-content.ts', 'SUN_SIGN_CONTENT',    'Sun sign content library'),
    ]
    for filepath, symbol, desc in consistency_checks:
        content = read_file(filepath)
        if not content:
            c.fail(f'{desc} file not found: {filepath}')
        elif symbol not in content:
            c.fail(f'{desc} missing: {symbol} in {filepath}')

    # Compound number display is consistent
    tokens = read_file('tokens.ts')
    if 'lifePathDisplay' not in tokens:
        c.fail('tokens.ts: lifePathDisplay field not defined')
    if 'birthdayDisplay' not in tokens:
        c.fail('tokens.ts: birthdayDisplay field not defined')

    # Consent and hasFullName fields present
    for field in ['hasFullName', 'consent']:
        if field not in tokens:
            c.warn(f'tokens.ts: {field} field may be missing from ReportData')

    c.note('Pronouns: report uses first name only — no gendered pronouns')

# ─── Check #3: Report logic ───────────────────────────────────────────────────
def check3(c):
    sovereign = read_file('SovereignReport.tsx')
    if not sovereign:
        c.fail('SovereignReport.tsx not found')
        return

    # Level A pages — always required
    level_a_required = [
        ('Page1Cover',          'Cover page'),
        ('Page5Dashboard',      'Coordinates dashboard'),
        ('Page7DecisionProtocol','Decision protocol'),
        ('Page11TypeStrategy',  'Type and Strategy'),
        ('Page12Authority',     'Authority (most important Vehicle page)'),
        ('Page19LifePath',      'Life Path'),
        ('Page27BigThree',      'Big Three'),
        ('Page35Decisions',     'Decision tree'),
        ('Page40NavigationCard','Navigation Card'),
        ('Page44ClosingLetter', 'Closing Letter'),
    ]
    for component, desc in level_a_required:
        if component not in sovereign:
            c.fail(f'Level A page missing from SovereignReport: {component} ({desc})')

    # Synthesis page present
    if 'PageSynthesis' not in sovereign and 'synthesis' not in sovereign.lower():
        c.warn('Synthesis page (PageSynthesis) not found in SovereignReport.tsx')

    # Level B conditional: hasFullName gate
    page21 = read_file('section4/Page21InnerDrivers.tsx')
    if page21 and 'hasFullName' not in page21:
        c.fail('Page21InnerDrivers.tsx: not gated on hasFullName — name data may show unconditionally')

    # Content module system present
    if not file_exists('schema/contentModules.ts'):
        c.warn('schema/contentModules.ts not found — content level system not implemented')
    else:
        c.note('Content module system: Level A/B/C defined in contentModules.ts')

# ─── Check #4: Readability ────────────────────────────────────────────────────
def check4(c):
    missing_thesis = []
    dark_page_violations = []

    DARK_PAGES = {
        'Page1Cover.tsx', 'Page10VehicleDivider.tsx', 'Page18RoadDivider.tsx',
        'Page26StoplightDivider.tsx', 'Page34SOSDivider.tsx', 'Page44ClosingLetter.tsx',
    }

    for filepath, fname in all_section_files():
        with open(filepath, errors='ignore') as f:
            content = f.read()

        # Thesis check (sub/subheading present on content pages)
        if fname not in DARK_PAGES and 'SovereignReport' not in fname:
            has_heading = bool(re.search(r'S\.(heading|head)\b|BASE\.heading', content))
            has_sub = bool(re.search(r'S\.sub(?:heading)?\b|BASE\.sub\b', content))
            if has_heading and not has_sub:
                missing_thesis.append(fname)

        # Dark page violation check (page background is dark but not in allowed list)
        if fname not in DARK_PAGES:
            page_style = re.search(
                r'page:\s*\{[^}]*?backgroundColor:\s*(C\.base|\'#0D0D0E\')', content
            )
            if page_style:
                dark_page_violations.append(fname)

    if missing_thesis:
        for fname in missing_thesis:
            c.warn(f'Missing thesis/subheading: {fname}')
    else:
        c.note('All content pages have thesis sentences ✓')

    if dark_page_violations:
        for fname in dark_page_violations:
            c.fail(f'Dark page violation: {fname} uses dark background outside spec')
    else:
        c.note('Dark pages: cover + 4 dividers + close only ✓')

    # Typography check
    tokens = read_file('tokens.ts')
    c.note('Typography: DM Sans body at 10.5pt — verify via visual inspection')

# ─── Check #5: Design ────────────────────────────────────────────────────────
def check5(c):
    # System color consistency
    color_rules = [
        ('section3', 'C.amber',   'Vehicle/HD pages should use amber'),
        ('section4', 'C.emerald', 'Road/Numerology pages should use emerald'),
        ('section5', 'C.crimson', 'Stoplight/Astrology pages should use crimson'),
    ]
    for section, color, desc in color_rules:
        section_path = os.path.join(REPORT_DIR, section)
        if not os.path.isdir(section_path):
            c.warn(f'{section}/ not found')
            continue
        files = [f for f in os.listdir(section_path) if f.endswith('.tsx')]
        uses_color = any(
            color in open(os.path.join(section_path, f), errors='ignore').read()
            for f in files
        )
        if not uses_color:
            c.warn(f'{desc}: color {color} not found in {section}/')
        else:
            c.note(f'{desc}: {color} present ✓')

    # Technical lines applied (visual texture)
    shared = read_file('shared/PageComponents.tsx')
    if 'TechnicalLines' not in shared:
        c.warn('shared/PageComponents.tsx: TechnicalLines component not found')
    else:
        c.note('Technical line system: TechnicalLines defined in PageComponents.tsx ✓')

    # Birth-time sensitivity component exists
    if not file_exists('shared/BirthTimeSensitivity.tsx'):
        c.warn('shared/BirthTimeSensitivity.tsx not found — birth-time notices not available')
    else:
        c.note('Birth-time sensitivity: BirthTimeSensitivity.tsx present ✓')

# ─── Check #6: Action ────────────────────────────────────────────────────────
def check6(c):
    # Field practice pages
    practice_pages = [
        ('section3/Page17VehiclePractice.tsx', 'Vehicle field practice (amber footer)'),
        ('section4/Pages23to25.tsx',           'Road field practice (emerald footer)'),
        ('section5/Pages29to33.tsx',           'Stoplight field practice (crimson footer)'),
        ('section6/Pages36to39.tsx',           'SOS 7-day integrated experiment'),
    ]
    for filepath, desc in practice_pages:
        content = read_file(filepath)
        if not content:
            c.fail(f'Field practice page not found: {filepath} ({desc})')
        else:
            has_practice = any(kw in content.lower() for kw in
                ['experiment', 'practice', 'seven', '7-day', 'daily'])
            if not has_practice:
                c.warn(f'{desc}: practice/experiment language not detected')
            else:
                c.note(f'{desc}: present ✓')

    # Synthesis experiment
    synth = read_file('schema/synthesisEngine.ts')
    if synth and 'seven' in synth.lower() and 'experiment' in synth.lower():
        c.note('Synthesis engine: experiment language in system prompt ✓')
    elif synth:
        c.warn('synthesisEngine.ts: experiment language not detected in system prompt')

# ─── Check #7: Scope ─────────────────────────────────────────────────────────
def check7(c):
    # Language guide-rail files exist
    for fname in ['schema/languageGuide.ts', 'schema/synthesisEngine.ts']:
        if not file_exists(fname):
            c.fail(f'Scope enforcement file not found: {fname}')

    # Ethical scope note on Page 43
    page43 = read_file('section7/Page43DataNotes.tsx')
    if 'Ethical Scope Note' not in page43:
        c.fail('Page43DataNotes.tsx: Ethical Scope Note block is missing')
    else:
        c.note('Ethical Scope Note present on Page 43 ✓')

    # Verbatim scope statement
    scope_phrases = [
        'reflective tools for self-inquiry',
        'does not diagnose conditions',
        'retain your own judgment',
    ]
    for phrase in scope_phrases:
        if phrase not in page43:
            c.warn(f'Page 43: scope statement may be incomplete — "{phrase}" not found')
        else:
            c.note(f'Scope statement: "{phrase[:40]}..." present ✓')

    # SCOPE_STATEMENT in languageGuide
    guide = read_file('schema/languageGuide.ts')
    if 'SCOPE_STATEMENT' not in guide:
        c.warn('languageGuide.ts: SCOPE_STATEMENT constant not defined')

    c.note('Full language guide-rail audit: run python3 audit_language_guide.py')

# ─── Check #8: Delivery ──────────────────────────────────────────────────────
def check8(c):
    # Navigation Card
    nav_card = read_file('section7/Page40NavigationCard.tsx')
    if not nav_card:
        c.fail('Page40NavigationCard.tsx not found — Navigation Card missing')
    elif 'backgroundColor: \'#F5F5F3\'' in nav_card or 'backgroundColor: "#F5F5F3"' in nav_card:
        c.note('Navigation Card: light background (correct) ✓')
    else:
        c.warn('Navigation Card: verify background is light parchment (#F5F5F3), not dark')

    # Synthesis page
    sovereign = read_file('SovereignReport.tsx')
    if 'PageSynthesis' in sovereign:
        c.note('Synthesis page: present in SovereignReport.tsx ✓')
    else:
        c.warn('Synthesis page (PageSynthesis): not found in SovereignReport.tsx')

    # Route.ts has synthesis call
    route = read_file('../app/api/generate-report/route.ts')
    if 'generateSynthesis' in route:
        c.note('Route: generateSynthesis() called before render ✓')
    else:
        c.warn('Route: generateSynthesis() not found — synthesis may not be generated')

    # QA checklist wired into route
    if 'runQAChecklist' in route:
        c.note('Route: runQAChecklist() wired in ✓')
    else:
        c.warn('Route: runQAChecklist() not called — add to route.ts after synthesis generation')

    # Delivery headers
    if 'Content-Disposition' in route:
        c.note('Route: Content-Disposition header present ✓')

    c.note('Manual checks required:')
    c.note('  — PDF downloads on mobile (iOS Safari, Android Chrome)')
    c.note('  — Navigation Card screenshot is legible at phone size')
    c.note('  — Integration email sequence triggers after purchase')

# ─── Runner ───────────────────────────────────────────────────────────────────
def main():
    checks = [
        Check(1, 'Data Integrity',    critical=True),
        Check(2, 'Copy Consistency',  critical=False),
        Check(3, 'Report Logic',      critical=False),
        Check(4, 'Readability',       critical=False),
        Check(5, 'Design Consistency',critical=False),
        Check(6, 'Action Integrity',  critical=False),
        Check(7, 'Scope Integrity',   critical=True),
        Check(8, 'Delivery',          critical=False),
    ]

    runners = [check1, check2, check3, check4, check5, check6, check7, check8]

    print(f'\nT3D Quality Assurance Checklist')
    print(f'Project: {PROJECT_ROOT}\n')

    for check, runner in zip(checks, runners):
        runner(check)

    # Print results
    all_passed = True
    total_issues = 0
    for c in checks:
        icon = '✓' if c.passed else ('✗' if c.critical else '△')
        label = ' [CRITICAL]' if c.critical and not c.passed else ''
        print(f'  {icon}  Check #{c.num}: {c.name}{label}')
        for issue in c.issues:
            print(f'       ISSUE: {issue}')
            total_issues += 1
        for note in c.notes:
            print(f'       note:  {note}')
        if not c.passed:
            all_passed = False

    passed_count = sum(1 for c in checks if c.passed)
    score = round(passed_count / len(checks) * 100)

    print(f'\n{"─" * 60}')
    print(f'Score: {score}/100 ({passed_count}/{len(checks)} checks passed)')
    print(f'Total issues: {total_issues}')
    print(f'Status: {"✓ READY FOR DELIVERY" if all_passed else "△ REVIEW REQUIRED"}')

    critical_failures = [c for c in checks if c.critical and not c.passed]
    if critical_failures:
        print(f'\nBLOCKING (fix before delivery):')
        for c in critical_failures:
            for issue in c.issues:
                print(f'  ✗ Check #{c.num}: {issue}')

    print()

if __name__ == '__main__':
    main()
