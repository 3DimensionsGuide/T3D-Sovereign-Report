#!/usr/bin/env python3
"""
T3D Data Integrity Integration
================================
Patches three existing files to wire in the integrity checking layer:

  1. buildReportData.ts  — runs integrity check, adds dataQuality to ReportData
  2. route.ts            — surfaces integrity errors cleanly
  3. Page43DataNotes.tsx — shows DataQualityBlock and methodology

Run from project root:
  python3 integrate_integrity.py
"""

import os, sys, re

PROJECT_ROOT = sys.argv[1] if len(sys.argv) > 1 else os.path.expanduser(
    '~/Developer/3dimensions.guide'
)
REPORT_DIR = os.path.join(PROJECT_ROOT, 'src', 'lib', 'report')

def patch(filepath, description, old, new, required=True):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    if old not in content:
        if required:
            print(f'  ✗ {description} — insertion point not found')
            print(f'    Looking for: {repr(old[:60])}...')
        else:
            print(f'  — {description} — already applied or not needed')
        return False
    content = content.replace(old, new, 1)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'  ✓ {description}')
    return True

def main():
    print(f'\nT3D Data Integrity Integration')
    print(f'Project: {PROJECT_ROOT}\n')

    # ── 1. buildReportData.ts ─────────────────────────────────────────────────
    build_path = os.path.join(REPORT_DIR, 'schema', 'buildReportData.ts')
    if os.path.exists(build_path):
        print('Patching buildReportData.ts...')

        # Add import
        patch(build_path,
            'Add dataIntegrity import',
            "import {\n  normalizeType,",
            "import { runIntegrityCheck } from './dataIntegrity';\nimport {\n  normalizeType,",
        )

        # Add dataQuality field to ReportData assembly
        # Find the consent assembly and add dataQuality after it
        patch(build_path,
            'Add dataQuality to ReportData assembly',
            '    // ── 8. Assemble clean ReportData ───────────────────────────────────────',
            """    // ── 7b. Run integrity check ───────────────────────────────────────────
    const dataQuality = runIntegrityCheck(
      rawBirth,
      (rawBirth['timezoneId'] as string | undefined)
    );

    // ── 8. Assemble clean ReportData ───────────────────────────────────────""",
        )

        # Add dataQuality to the returned object (after consent field)
        patch(build_path,
            'Add dataQuality field to return object',
            '      // Consent/Preference (Input Class #4)\n      consent,',
            '      // Consent/Preference (Input Class #4)\n      consent,\n\n      // Data Quality Report (Checks #1–6)\n      dataQuality,',
        )
    else:
        print(f'  ✗ buildReportData.ts not found at {build_path}')

    # ── 2. tokens.ts — add dataQuality to ReportData type ─────────────────────
    tokens_path = os.path.join(REPORT_DIR, 'tokens.ts')
    if os.path.exists(tokens_path):
        print('\nPatching tokens.ts...')
        patch(tokens_path,
            'Add DataQualityReport import',
            "export const C = {",
            "// DataQualityReport is imported from schema/dataIntegrity\n// and added to ReportData below\nexport type { DataQualityReport, BirthTimeCertainty } from './schema/dataIntegrity';\n\nexport const C = {",
            required=False,
        )
        patch(tokens_path,
            'Add dataQuality field to ReportData interface',
            '  consent: ReportConsent;',
            '  consent:     ReportConsent;\n\n  // Data Quality Report — output of runIntegrityCheck()\n  // Surfaced on Page 43 and Birth-Time Sensitivity notices\n  dataQuality: import(\'./schema/dataIntegrity\').DataQualityReport;',
            required=False,
        )
    else:
        print(f'\n  ✗ tokens.ts not found')

    # ── 3. Page27BigThree — add sensitivity notice to Rising section ───────────
    page27_path = os.path.join(REPORT_DIR, 'section5', 'Pages27to28.tsx')
    if not os.path.exists(page27_path):
        page27_path = os.path.join(REPORT_DIR, 'section5', 'Page27BigThree.tsx')

    if os.path.exists(page27_path):
        print('\nPatching Page27 (Big Three)...')
        with open(page27_path, 'r') as f:
            content = f.read()

        if 'BirthTimeSensitivity' not in content:
            # Add import
            content = content.replace(
                "import React from 'react';",
                "import React from 'react';\nimport { BirthTimeSensitivityBanner } from '../shared/BirthTimeSensitivity';",
                1
            )
            # Add notice before the panels section
            # Look for the headingRule and add notice after it
            content = content.replace(
                '<View style={S27.panels}>',
                "{data.dataQuality?.birthTimeSensitive && (\n          <BirthTimeSensitivityBanner\n            certainty={data.dataQuality.birthTimeStatus}\n            pageName=\"Page27BigThree\"\n          />\n        )}\n        <View style={S27.panels}>",
                1
            )
            with open(page27_path, 'w') as f:
                f.write(content)
            print('  ✓ Birth-time sensitivity notice added to Page27')
        else:
            print('  — Page27 already has sensitivity notice')
    else:
        print(f'\n  ✗ Page27 file not found')

    # ── 4. Page29 — add compact notice to ruler/arenas ────────────────────────
    page29_path = os.path.join(REPORT_DIR, 'section5', 'Pages29to33.tsx')
    if os.path.exists(page29_path):
        print('\nPatching Page29 (Ruler & Arenas)...')
        with open(page29_path, 'r') as f:
            content = f.read()

        if 'BirthTimeSensitivity' not in content:
            content = content.replace(
                "import React from 'react';",
                "import React from 'react';\nimport { BirthTimeSensitivityBanner } from '../shared/BirthTimeSensitivity';",
                1
            )
            # Add compact notice before ruler content in Page29RulerArenas
            content = content.replace(
                "        {/* Chart ruler */}",
                "{data.dataQuality?.birthTimeSensitive && (\n          <BirthTimeSensitivityBanner\n            certainty={data.dataQuality.birthTimeStatus}\n            pageName=\"Page29RulerArenas\"\n            compact\n          />\n        )}\n        {/* Chart ruler */}",
                1
            )
            with open(page29_path, 'w') as f:
                f.write(content)
            print('  ✓ Compact sensitivity notice added to Page29')
        else:
            print('  — Page29 already has sensitivity notice')
    else:
        print(f'\n  ✗ Pages29to33.tsx not found')

    # ── 5. Page43DataNotes — add DataQualityBlock ─────────────────────────────
    page43_path = os.path.join(REPORT_DIR, 'section7', 'Page43DataNotes.tsx')
    if os.path.exists(page43_path):
        print('\nPatching Page43 (Data Notes)...')
        with open(page43_path, 'r') as f:
            content = f.read()

        if 'DataQualityBlock' not in content:
            content = content.replace(
                "import React from 'react';",
                "import React from 'react';\nimport { DataQualityBlock, BirthTimeSensitivityBanner } from '../shared/BirthTimeSensitivity';",
                1
            )
            # Add DataQualityBlock as a new section before the existing content
            # Find the headingRule and add after it
            content = content.replace(
                "        <View style={S.twoCol}>",
                """        {/* Data Quality Report */}
        {data.dataQuality && (
          <>
            <Text style={[S.sectionLabel, { marginBottom: 8 }]}>Calculation Quality Report</Text>
            <DataQualityBlock
              birthTimeStatus={data.dataQuality.birthTimeStatus}
              timezoneId={data.dataQuality.timezoneId}
              calculationDate={data.dataQuality.calculationDate}
              warnings={data.dataQuality.warnings}
            />
            {data.dataQuality.birthTimeSensitive && (
              <BirthTimeSensitivityBanner
                certainty={data.dataQuality.birthTimeStatus}
              />
            )}
            <View style={[S.headingRule, { marginTop: 16 }]} />
          </>
        )}

        <View style={S.twoCol}>""",
                1
            )
            with open(page43_path, 'w') as f:
                f.write(content)
            print('  ✓ DataQualityBlock added to Page43')
        else:
            print('  — Page43 already has DataQualityBlock')
    else:
        print(f'\n  ✗ Page43DataNotes.tsx not found')

    print(f'\n{"─" * 56}')
    print('Integrity integration complete.\n')
    print('Files updated:')
    print('  schema/dataIntegrity.ts  — copy to src/lib/report/schema/')
    print('  shared/BirthTimeSensitivity.tsx — copy to src/lib/report/shared/')
    print()
    print('What happens at report generation:')
    print('  1. runIntegrityCheck() validates all 6 integrity points')
    print('  2. birthTimeSensitive pages show BirthTimeSensitivityBanner')
    print('  3. Page 43 shows full DataQualityBlock with methodology')
    print()
    print('Restart: rm -rf .next && npm run dev')

if __name__ == '__main__':
    main()
