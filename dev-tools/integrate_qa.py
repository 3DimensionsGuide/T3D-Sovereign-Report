#!/usr/bin/env python3
"""
T3D QA Integration — patches route.ts to run QA before every PDF render.
Run from project root: python3 integrate_qa.py
"""
import os, sys

PROJECT_ROOT = sys.argv[1] if len(sys.argv) > 1 else os.path.expanduser(
    '~/Developer/3dimensions.guide'
)
route_path = os.path.join(
    PROJECT_ROOT, 'src', 'app', 'api', 'generate-report', 'route.ts'
)

with open(route_path, 'r') as f:
    content = f.read()

changed = False

# 1. Add import
if 'runQAChecklist' not in content:
    content = content.replace(
        "import { generateSynthesis }",
        "import { runQAChecklist, formatQAReport } from '@/lib/report/schema/qaChecklist';\nimport { generateSynthesis }",
    )
    changed = True

# 2. Add QA call after synthesis, before render
QA_CALL = """
    // ── 4. Run QA checklist ───────────────────────────────────────────────
    const qaReport = runQAChecklist(reportDataWithSynthesis as any);
    console.log(formatQAReport(qaReport));
    if (!qaReport.passed) {
      console.error('[QA] Critical failures detected — review before delivery');
      // Non-blocking in production: report generates with warnings logged
      // To block on failure, uncomment:
      // return NextResponse.json({ error: 'Report failed QA checks.', issues: qaReport.blockingIssues }, { status: 422 });
    }

"""

if 'runQAChecklist' in content and 'qaReport' not in content:
    content = content.replace(
        "    // ── 4. Render PDF",
        QA_CALL + "    // ── 5. Render PDF",
    )
    changed = True
elif 'qaReport' not in content:
    content = content.replace(
        "    // ── 4. Render PDF",
        QA_CALL + "    // ── 4. Render PDF",
    )
    changed = True

with open(route_path, 'w') as f:
    f.write(content)

if changed:
    print('✓ route.ts patched — QA checklist runs before every PDF render')
    print('  Results appear in your terminal (npm run dev) for each report generated')
else:
    print('— No changes needed (already patched or insertion points not found)')
EOF
