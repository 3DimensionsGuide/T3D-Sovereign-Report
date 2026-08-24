#!/usr/bin/env python3
"""Adds generateStoplightSynthesis to route.ts alongside generateSynthesis."""
import os, sys

PROJECT_ROOT = sys.argv[1] if len(sys.argv) > 1 else os.path.expanduser(
    '~/Developer/3dimensions.guide'
)
path = os.path.join(PROJECT_ROOT, 'src', 'app', 'api', 'generate-report', 'route.ts')
with open(path) as f: content = f.read()

# 1. Add import
if 'generateStoplightSynthesis' not in content:
    content = content.replace(
        "import { generateSynthesis }",
        "import { generateStoplightSynthesis } from '@/lib/report/schema/stoplightSynthesis';\nimport { generateSynthesis }"
    )

# 2. Add parallel call after synthesis, before QA
if 'stoplightSynthesis' not in content:
    content = content.replace(
        "    console.log(\n      `[Report ${leadId}] Synthesis:",
        """    // Generate Stoplight synthesis (parallel to main synthesis)
    const stoplightSynth = await generateStoplightSynthesis(
      reportDataWithSynthesis as Parameters<typeof generateStoplightSynthesis>[0]
    );

    console.log(
      `[Report ${leadId}] Synthesis:""",
    )

    # Add to the reportDataWithSynthesis object
    content = content.replace(
        "      synthesisSource:  synthesis.source,\n    };",
        "      synthesisSource:    synthesis.source,\n      stoplightSynthesis: stoplightSynth,\n    };"
    )

with open(path, 'w') as f: f.write(content)
print('✓ route.ts patched — stoplightSynthesis generated before render')
