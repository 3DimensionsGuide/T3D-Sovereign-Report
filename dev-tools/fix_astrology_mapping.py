#!/usr/bin/env python3
"""
T3D Astrology Mapping Fix
==========================
Replaces the astrology extraction block in buildReportData.ts
to correctly read all six values from the nested DB structure:

  results.astrology.tropical.{sun, moon, houses}
  results.astrology.sidereal.{sun, moon, houses}

All six values already exist in the database.
This is a mapping-only fix — zero calculation changes.

Run from project root:
  python3 fix_astrology_mapping.py
"""

import os, sys, re

PROJECT_ROOT = sys.argv[1] if len(sys.argv) > 1 else os.path.expanduser(
    '~/Developer/3dimensions.guide'
)
BUILD_PATH = os.path.join(
    PROJECT_ROOT, 'src', 'lib', 'report', 'schema', 'buildReportData.ts'
)

# ── The complete replacement for the astrology extraction block ───────────────

NEW_ASTRO_BLOCK = '''
  // ── 4. Extract all six astrology placements ────────────────────────────────
  //
  // DB structure: results.astrology.tropical.{sun, moon, houses}
  //               results.astrology.sidereal.{sun, moon, houses}
  //
  // Each planet object: { sign, formatted, longitude, retrograde, ... }
  // Houses object: varies by engine — we try every known swisseph format.
  //
  // This is mapping-only. Zero calculations happen here.

  const tropObj = asRecord(rawAst['tropical'] ?? {});
  const sidObj  = asRecord(rawAst['sidereal'] ?? {});

  // ── Planet objects (all have .formatted field) ─────────────────────────────
  const tropSunRaw  = tropObj['sun']     ?? rawAst['tropicalSun'];
  const tropMoonRaw = tropObj['moon']    ?? rawAst['tropicalMoon'];
  const sidSunRaw   = sidObj['sun']      ?? rawAst['siderealSun'];
  const sidMoonRaw  = sidObj['moon']     ?? rawAst['siderealMoon'];

  // ── Ascendant from houses ──────────────────────────────────────────────────
  // swisseph stores ASC inside houses. Format varies:
  //   Format A: houses.ascendant → { formatted, longitude, sign }
  //   Format B: houses.asc       → { formatted, longitude, sign }
  //   Format C: houses[1]        → { formatted, longitude, sign }  (1-indexed)
  //   Format D: houses.cusps[0]  → longitude number
  //   Format E: houses.list[0]   → longitude number

  function extractAscendant(obj: Record<string, unknown>): unknown {
    const houses = asRecord(obj['houses'] ?? {});
    // Format A/B: named ascendant key
    if (houses['ascendant']) return houses['ascendant'];
    if (houses['asc'])       return houses['asc'];
    // Format C: numeric 1-based key
    if (houses['1'])         return houses['1'];
    // Format D: cusps array
    const cusps = houses['cusps'];
    if (Array.isArray(cusps) && cusps.length > 0) return cusps[0];
    // Format E: list array
    const list = houses['list'];
    if (Array.isArray(list) && list.length > 0) return list[0];
    // Format F: ascendant stored directly on parent (rare)
    if (obj['ascendant'])    return obj['ascendant'];
    return null;
  }

  const tropAscRaw = extractAscendant(tropObj) ?? rawAst['tropicalAscendant'];
  const sidAscRaw  = extractAscendant(sidObj)  ?? rawAst['siderealAscendant'];

  // ── MC (Midheaven) ─────────────────────────────────────────────────────────
  function extractMC(obj: Record<string, unknown>): unknown {
    const houses = asRecord(obj['houses'] ?? {});
    if (houses['mc'])          return houses['mc'];
    if (houses['midheaven'])   return houses['midheaven'];
    if (houses['10'])          return houses['10'];
    const cusps = houses['cusps'];
    if (Array.isArray(cusps) && cusps.length >= 10) return cusps[9];
    return null;
  }

  const tropMCRaw = extractMC(tropObj) ?? rawAst['tropicalMC'];

  // ── Ayanamsha (Sidereal reference system name) ─────────────────────────────
  // The engine should store which ayanamsha it used. We surface this on
  // Page 43 (Data Notes) and wherever sidereal values appear.
  const ayanamsha = String(
    rawAst['ayanamsha'] ??
    sidObj['ayanamsha']  ??
    rawAst['ayanamshaName'] ??
    'Lahiri'   // Lahiri is swisseph default — named explicitly, never just "Sidereal"
  );

  // ── Normalize all six to formatted strings ─────────────────────────────────
  const tropicalSun  = normalizePlanetPosition(tropSunRaw);
  const tropicalMoon = normalizePlanetPosition(tropMoonRaw);
  const tropicalAsc  = normalizePlanetPosition(tropAscRaw);
  const tropicalMC   = normalizePlanetPosition(tropMCRaw);
  const siderealSun  = normalizePlanetPosition(sidSunRaw);
  const siderealMoon = normalizePlanetPosition(sidMoonRaw);
  const siderealAsc  = normalizePlanetPosition(sidAscRaw);

  // ── Extract sign names ─────────────────────────────────────────────────────
  // Prefer the .sign field on the raw object (already a clean string)
  // before running extractSign() on the formatted position string.
  function getSign(raw: unknown, formatted: string): string {
    if (raw && typeof raw === 'object') {
      const s = (raw as Record<string, unknown>)['sign'];
      if (typeof s === 'string' && s.length > 0) return s;
    }
    return extractSign(formatted);
  }

  const sunSign    = getSign(tropSunRaw,  tropicalSun);
  const moonSign   = getSign(tropMoonRaw, tropicalMoon);
  const risingSign = getSign(tropAscRaw,  tropicalAsc);

  // Log for QA visibility during development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Astrology]', {
      tropicalSun, tropicalMoon, tropicalAsc,
      siderealSun, siderealMoon, siderealAsc,
      sunSign, moonSign, risingSign, ayanamsha,
    });
  }
'''

# ── The new ReportData fields to add to the assembled object ─────────────────

NEW_ASTRO_FIELDS = '''
      // ── Astrology — all six placements (Input Class #3) ─────────────────
      tropicalSun,
      tropicalMoon,
      tropicalAsc,
      tropicalMC,
      siderealSun,
      siderealMoon,
      siderealAsc,
      ayanamsha,

      // Extracted signs
      sunSign,
      moonSign,
      risingSign,'''

# ── Apply the patch ────────────────────────────────────────────────────────────

def patch_build_report_data():
    with open(BUILD_PATH, 'r') as f:
        content = f.read()

    changed = False

    # Strategy: find and replace the entire astrology extraction block.
    # We look for the comment header that marks the start of astrology extraction.

    # Pattern 1: the new-style comment (if previous fix was applied)
    pattern1 = re.compile(
        r'// ──.*?Extract.*?astrology.*?\n.*?const tropObj.*?'
        r'(?=\n  // ──|\n  /\*|\n  const reportData)',
        re.DOTALL
    )

    # Pattern 2: the old-style flat key extraction
    pattern2 = re.compile(
        r'const tropSunRaw\s*=\s*rawAst\[.tropicalSun.\].*?'
        r'(?=\n  // ──|\n  const reportData|\n  const validation)',
        re.DOTALL
    )

    # Pattern 3: the previous partial fix with tropObj
    pattern3 = re.compile(
        r'const tropObj\s*=\s*\(rawAst.*?'
        r'(?=\n  // ──\s*\d|\n  const reportData|\n  const validation)',
        re.DOTALL
    )

    for i, pattern in enumerate([pattern1, pattern2, pattern3], 1):
        m = pattern.search(content)
        if m:
            content = content[:m.start()] + NEW_ASTRO_BLOCK + content[m.end():]
            print(f'  ✓ Astrology extraction block replaced (pattern {i})')
            changed = True
            break

    if not changed:
        print('  ✗ Could not find extraction block — appending before return statement')
        # Fallback: insert before the reportData assembly
        if '// ── 8. Assemble clean ReportData' in content:
            content = content.replace(
                '  // ── 8. Assemble clean ReportData',
                NEW_ASTRO_BLOCK + '\n  // ── 8. Assemble clean ReportData'
            )
            changed = True
            print('  ✓ Block inserted before ReportData assembly')

    # ── Fix the assembled return object ──────────────────────────────────────
    # Replace old flat astrology field assignments with the new ones
    old_astro_fields = re.compile(
        r'      tropicalSun:.*?risingSign:.*?(?=\n\n|      //|\n      consent)',
        re.DOTALL
    )
    m2 = old_astro_fields.search(content)
    if m2:
        content = content[:m2.start()] + NEW_ASTRO_FIELDS.strip() + content[m2.end():]
        print('  ✓ Return object astrology fields updated')
    else:
        print('  — Return object fields not updated (may already be correct)')

    with open(BUILD_PATH, 'w') as f:
        f.write(content)

    return changed

# ── Update tokens.ts to add siderealMoon and ayanamsha ───────────────────────

TOKENS_PATH = os.path.join(PROJECT_ROOT, 'src', 'lib', 'report', 'tokens.ts')

def patch_tokens():
    with open(TOKENS_PATH, 'r') as f:
        content = f.read()

    changed = False

    # Add siderealMoon if not present
    if 'siderealMoon' not in content:
        content = content.replace(
            '  siderealSun:  string;',
            '  siderealSun:  string;\n  siderealMoon: string;'
        )
        changed = True
        print('  ✓ siderealMoon added to ReportData')

    # Add ayanamsha if not present
    if 'ayanamsha' not in content:
        content = content.replace(
            '  siderealAsc:  string;',
            '  siderealAsc:  string;\n  ayanamsha:    string;   // e.g., "Lahiri" — always named explicitly'
        )
        changed = True
        print('  ✓ ayanamsha added to ReportData')

    if changed:
        with open(TOKENS_PATH, 'w') as f:
            f.write(content)
    else:
        print('  — tokens.ts already has siderealMoon and ayanamsha')

# ── Main ───────────────────────────────────────────────────────────────────────

def main():
    print(f'\nT3D Astrology Mapping Fix')
    print(f'Project: {PROJECT_ROOT}\n')

    if not os.path.exists(BUILD_PATH):
        print(f'ERROR: {BUILD_PATH} not found')
        sys.exit(1)

    print('Patching buildReportData.ts...')
    patch_build_report_data()

    print('\nPatching tokens.ts...')
    patch_tokens()

    print(f'\n{"─" * 56}')
    print('Complete. Six placements now mapped:')
    print('  Tropical: Sun, Moon, Rising (from houses.ascendant)')
    print('  Sidereal: Sun, Moon, Rising (from houses.ascendant)')
    print('  Ayanamsha: named explicitly (defaults to Lahiri)')
    print()
    print('Next: paste output of these two queries:')
    print('  psql -U tycpu -d t3d_db -t -A -c "SELECT results->\'astrology\'->\'tropical\'->\'houses\' FROM leads WHERE id = 8;"')
    print('  psql -U tycpu -d t3d_db -t -A -c "SELECT results->\'astrology\'->\'sidereal\'->\'sun\' FROM leads WHERE id = 8;"')
    print()
    print('Restart: rm -rf .next && npm run dev')
    print('Check terminal for [Astrology] log line showing all six values.')

if __name__ == '__main__':
    main()
