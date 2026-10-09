#!/usr/bin/env python3
"""
T3D App Language Audit
======================
Runs the same guide-rail patterns as audit_language_guide.py over everything
a reader of the APP can see: the server-side app content (src/lib/app,
src/app/api/app), every screen and component in mobile/src, and the shared
report content the app reuses (src/lib/report outside the section folders).

Differences from the report audit:
  - scans every line of prose, including JSX text and multi-line strings
    (the report audit only looks at quoted strings of 20+ characters);
  - skips comments;
  - adds advisory checks for directive wording ("you must", "you need to")
    because the app's Triad and Practice features promise to frame, not instruct.
("always" and "never" are not flagged on their own: the report audit's absolute-claim
patterns already catch "will always" and "will never", and the rest are descriptions.)

Run from the project root:
  python3 dev-tools/audit_app_strings.py
Exit code is 1 when there is at least one error.
"""

import importlib.util
import os
import re
import sys

ROOT = sys.argv[1] if len(sys.argv) > 1 else os.getcwd()

spec = importlib.util.spec_from_file_location(
    'report_audit', os.path.join(ROOT, 'dev-tools', 'audit_language_guide.py'))
report_audit = importlib.util.module_from_spec(spec)
spec.loader.exec_module(report_audit)
VIOLATIONS = report_audit.VIOLATIONS
is_negated = report_audit.is_negated

# Advisory only: directive wording. Not part of the five guide-rails.
ADVISORY = [
    (r"\byou (must|have to|need to)\b", 'Directive wording', 'Prefer "it can help to" or "one option is"'),
    (r"\byou should(n't| not)?\b", 'Directive wording', 'Prefer "it can help to" or "worth considering"'),
]

SCAN = [
    ('src/lib/app', False),
    ('src/app/api/app', False),
    ('mobile/src', False),
    ('src/lib/report/advanced', True),
    ('src/lib/report/shared', True),
]
# Report files that only define the rules, so scanning them is circular.
EXCLUDED = {'languageGuide.ts', 'synthesisEngine.ts', 'contentModules.ts', 'qaChecklist.ts'}

def source_files():
    for base, shared in SCAN:
        top = os.path.join(ROOT, base)
        for dirpath, dirnames, filenames in os.walk(top):
            dirnames[:] = [d for d in dirnames if d not in ('node_modules', '.expo', 'assets')]
            for name in sorted(filenames):
                if name.endswith(('.ts', '.tsx')) and name not in EXCLUDED:
                    yield os.path.join(dirpath, name), shared

def prose_lines(text):
    in_block = False
    for number, line in enumerate(text.split('\n'), 1):
        s = line.strip()
        if in_block:
            if '*/' in s:
                in_block = False
            continue
        if s.startswith('/*'):
            if '*/' not in s:
                in_block = True
            continue
        if not s or s.startswith('//') or s.startswith('*') or s.startswith('import '):
            continue
        yield number, line

def main():
    files = errors = warnings = advisories = skipped = 0
    shared_issues = 0
    out = []
    for path, shared in source_files():
        with open(path, encoding='utf-8', errors='ignore') as f:
            text = f.read()
        files += 1
        rel = os.path.relpath(path, ROOT)
        found = []
        for number, line in prose_lines(text):
            for vp in VIOLATIONS:
                for m in re.finditer(vp.pattern, line, re.IGNORECASE):
                    if is_negated(line, m.start(), m):
                        skipped += 1
                        continue
                    found.append((number, vp.severity, f'Rail #{vp.guide_rail} {vp.category}', m.group(0), vp.suggestion, line.strip()))
            for pattern, label, suggestion in ADVISORY:
                for m in re.finditer(pattern, line, re.IGNORECASE):
                    found.append((number, 'advisory', label, m.group(0), suggestion, line.strip()))
        if found:
            out.append(f'\n{rel}' + ('  (shared with the report)' if shared else ''))
            for number, severity, label, word, suggestion, context in found:
                icon = {'error': '✗', 'warning': '△', 'advisory': '·'}[severity]
                out.append(f'  {icon} L{number:<4} {label}: "{word}"')
                out.append(f'        {context[:110]}')
                out.append(f'        Fix: {suggestion}')
                if severity == 'error': errors += 1
                elif severity == 'warning': warnings += 1
                else: advisories += 1
                if shared: shared_issues += 1
    print('\nT3D App Language Audit')
    print('\n'.join(out))
    print('\n' + '─' * 60)
    print(f'Files scanned:        {files}')
    print(f'Errors:               {errors}   (fix before release)')
    print(f'Warnings:             {warnings}   (review and decide)')
    print(f'Advisories:           {advisories}   (directive wording; review)')
    print(f'Skipped as negated:   {skipped}')
    print(f'In report-shared files: {shared_issues}')
    sys.exit(1 if errors else 0)

if __name__ == '__main__':
    main()
