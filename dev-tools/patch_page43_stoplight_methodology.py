#!/usr/bin/env python3
"""
T3D Page 43 — Stoplight Methodology Patch
============================================
Adds three things to Page43DataNotes.tsx:

  1. Astrology Methodology block (left column, after Systems Included):
       — Astrology method: Tropical + Sidereal from same validated birth data
       — Sidereal reference: exact configured ayanamsha name
       — Birth-time status: Verified / Uncertain / Missing

  2. Exact scope language paragraph (right column, appended to Scope of This Report):
       "The Tropical and Sidereal readings in this report are complementary
       reflective lenses. They do not provide clinical, financial, legal,
       scientific, or deterministic guidance. Where birth time is uncertain,
       Ascendant-dependent material is limited rather than inferred."

  3. Field Library reference to the new entry:
       "Why Do My Tropical and Sidereal Placements Differ?"

  Also fixes a latent bug: S.headingRule was referenced but never defined
  in this file's StyleSheet — replaced with the existing S.rule style.

Run from project root:
  python3 patch_page43_stoplight_methodology.py
"""

import os, sys

PROJECT_ROOT = sys.argv[1] if len(sys.argv) > 1 else os.path.expanduser(
    '~/Developer/3dimensions.guide'
)
path = os.path.join(
    PROJECT_ROOT, 'src', 'lib', 'report', 'section7', 'Page43DataNotes.tsx'
)

if not os.path.exists(path):
    print(f'ERROR: File not found at {path}')
    sys.exit(1)

with open(path, 'r') as f:
    content = f.read()

original = content
changes = 0

# ── Fix 1: S.headingRule doesn't exist — replace with S.rule ─────────────────
old = "<View style={[S.headingRule, { marginTop: 16 }]} />"
new = "<View style={[S.rule, { marginTop: 16 }]} />"
if old in content:
    content = content.replace(old, new)
    print('✓ Fixed undefined S.headingRule → S.rule')
    changes += 1
else:
    print('— S.headingRule fix already applied or not found')

# ── Fix 2: Add astrologyMethodRows + birthTimeStatusLabel after systemsRows ───
old_systems_rows = """  const systemsRows = [
    { key: 'Human Design', val: 'Ra Uru Hu\\'s original system. Bodygraph calculated using Swiss Ephemeris at ±88 days from birth date.' },
    { key: 'Numerology',  val: 'Pythagorean method. Life Path, Expression, Soul Urge, Personality derived from birth date and full name.' },
    { key: 'Astrology',   val: 'Western Tropical with Whole Sign Houses. Calculations based on birth date, time, and coordinates.' },
    { key: 'House System', val: 'Whole Sign Houses. Each sign = one complete house, beginning at 0° of the Rising sign.' },
  ];"""

new_systems_rows = """  const systemsRows = [
    { key: 'Human Design', val: 'Ra Uru Hu\\'s original system. Bodygraph calculated using Swiss Ephemeris at ±88 days from birth date.' },
    { key: 'Numerology',  val: 'Pythagorean method. Life Path, Expression, Soul Urge, Personality derived from birth date and full name.' },
    { key: 'Astrology',   val: 'Western Tropical with Whole Sign Houses. Calculations based on birth date, time, and coordinates.' },
    { key: 'House System', val: 'Whole Sign Houses. Each sign = one complete house, beginning at 0° of the Rising sign.' },
  ];

  // Birth-time status label per spec (Verified / Uncertain / Missing)
  const birthTimeStatusLabel = (() => {
    const status = data.dataQuality?.birthTimeStatus;
    if (status === 'exact') return 'Verified';
    if (status === 'missing') return 'Missing';
    return 'Uncertain';   // 'approximate' or 'unknown'
  })();

  const astrologyMethodRows = [
    { key: 'Astrology method',
      val: 'Tropical zodiac and Sidereal zodiac calculated from the same validated birth data.' },
    { key: 'Sidereal reference',
      val: `${data.ayanamsha ?? 'Lahiri'} ayanamsha` },
    { key: 'Birth-time status',
      val: birthTimeStatusLabel },
  ];"""

if old_systems_rows in content:
    content = content.replace(old_systems_rows, new_systems_rows)
    print('✓ astrologyMethodRows + birthTimeStatusLabel added')
    changes += 1
else:
    print('✗ systemsRows block not matched — file may have been edited since')

# ── Fix 3: Insert Astrology Methodology section + Field Library reference ────
old_field_lib = """            {/* Field Library */}
            <View style={S.section}>
              <Text style={S.sectionLabel}>Field Library</Text>
              <Text style={S.bodyText}>
                Complete technical data — every planetary position, gate activation, Pinnacle calculation, and aspect — is available at:
              </Text>
              <Text style={[S.linkText, { marginTop: 4 }]}>3dimensions.guide/library</Text>
            </View>"""

new_field_lib = """            {/* Astrology Methodology — dual-zodiac note */}
            <View style={S.section}>
              <Text style={S.sectionLabel}>Astrology Methodology</Text>
              {astrologyMethodRows.map(r => (
                <View key={r.key} style={[S.dataRow, { alignItems: 'flex-start' }]}>
                  <Text style={[S.dataKey, { paddingTop: 1 }]}>{r.key}</Text>
                  <Text style={[S.dataVal, { fontSize: 7 }]}>{r.val}</Text>
                </View>
              ))}
            </View>

            {/* Field Library */}
            <View style={S.section}>
              <Text style={S.sectionLabel}>Field Library</Text>
              <Text style={S.bodyText}>
                Complete technical data — every planetary position, gate activation, Pinnacle calculation, and aspect — is available at:
              </Text>
              <Text style={[S.linkText, { marginTop: 4 }]}>3dimensions.guide/library</Text>
              <Text style={[S.smallText, { marginTop: 6 }]}>
                Includes: "Why Do My Tropical and Sidereal Placements Differ?" — a concise
                explanation of reference systems, ayanamsha, and birth-time sensitivity.
              </Text>
            </View>"""

if old_field_lib in content:
    content = content.replace(old_field_lib, new_field_lib)
    print('✓ Astrology Methodology section inserted; Field Library entry referenced')
    changes += 1
else:
    print('✗ Field Library section not matched — file may have been edited since')

# ── Fix 4: Add exact scope language to Scope of This Report ──────────────────
old_scope = """            {/* Scope */}
            <View style={S.section}>
              <Text style={S.sectionLabel}>Scope of This Report</Text>
              <Text style={S.bodyText}>
                This report presents a curated selection of placements — chosen for behavioral and navigational usefulness rather than exhaustive coverage. Gates, lines, incarnation cross, every individual planetary degree, full aspect tables, and twelve-house inventory are in the Field Library.
              </Text>
              <Text style={[S.bodyText, { marginTop: 6 }]}>
                This is a navigation guide, not a traditional birth-chart report with T3D branding.
              </Text>
            </View>"""

new_scope = """            {/* Scope */}
            <View style={S.section}>
              <Text style={S.sectionLabel}>Scope of This Report</Text>
              <Text style={S.bodyText}>
                This report presents a curated selection of placements — chosen for behavioral and navigational usefulness rather than exhaustive coverage. Gates, lines, incarnation cross, every individual planetary degree, full aspect tables, and twelve-house inventory are in the Field Library.
              </Text>
              <Text style={[S.bodyText, { marginTop: 6 }]}>
                This is a navigation guide, not a traditional birth-chart report with T3D branding.
              </Text>
              <Text style={[S.bodyText, { marginTop: 6 }]}>
                The Tropical and Sidereal readings in this report are complementary reflective lenses. They do not provide clinical, financial, legal, scientific, or deterministic guidance. Where birth time is uncertain, Ascendant-dependent material is limited rather than inferred.
              </Text>
            </View>"""

if old_scope in content:
    content = content.replace(old_scope, new_scope)
    print('✓ Scope language paragraph added')
    changes += 1
else:
    print('✗ Scope section not matched — file may have been edited since')

with open(path, 'w') as f:
    f.write(content)

print(f'\n{"─" * 56}')
if content == original:
    print('⚠ NO CHANGES WERE MADE — all patterns failed to match.')
    print('  Run: cat', path)
    print('  and paste the output for a manual fix.')
else:
    print(f'✓ File updated successfully ({changes}/4 patches applied)')
    print('\nRestart: rm -rf .next && npm run dev')
