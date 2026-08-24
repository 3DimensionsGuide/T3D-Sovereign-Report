#!/usr/bin/env python3
"""
T3D Page 44 — Closing Verse Patch
===================================
Adds Acts 2:17 as a quiet epigraph after the line:
  "This report doesn't hand over sovereignty. It returns you to it."
and before Tyler's signature.

Styled distinctly from the letter body — smaller, centered, italic,
with the citation set apart in tracked small caps — so it reads as
an intentional closing addition, not part of the letter's own voice.

Run from project root:
  python3 patch_page44_verse.py
"""

import os, sys

PROJECT_ROOT = sys.argv[1] if len(sys.argv) > 1 else os.path.expanduser(
    '~/Developer/3dimensions.guide'
)
path = os.path.join(
    PROJECT_ROOT, 'src', 'lib', 'report', 'section7', 'Page44ClosingLetter.tsx'
)

if not os.path.exists(path):
    print(f'ERROR: File not found at {path}')
    sys.exit(1)

with open(path, 'r') as f:
    content = f.read()

original = content

# ── 1. Add verse styles to the StyleSheet ─────────────────────────────────────
old_styles_anchor = "  // Signature\n  signatureBlock: { gap: 4, marginTop: 4 },"
new_styles = """  // Closing verse
  verseBlock: {
    marginTop: 8, marginBottom: 28,
    paddingTop: 22,
    borderTopWidth: 0.5, borderTopColor: C.parchmentFaint,
    borderTopStyle: 'solid', borderTopOpacity: 0.15,
    alignItems: 'center',
  },
  verseText: {
    fontFamily: F.display, fontSize: 10.5, fontWeight: 400, fontStyle: 'italic',
    color: C.parchmentDim, lineHeight: 1.65, textAlign: 'center',
    maxWidth: 380, opacity: 0.8,
  },
  verseCitation: {
    fontFamily: F.sans, fontSize: 7.5, fontWeight: 500, letterSpacing: 2,
    textTransform: 'uppercase', color: C.parchmentFaint, opacity: 0.5,
    marginTop: 10,
  },

  // Signature
  signatureBlock: { gap: 4, marginTop: 4 },"""

if old_styles_anchor in content:
    content = content.replace(old_styles_anchor, new_styles)
    print('✓ Verse styles added to StyleSheet')
else:
    print('✗ Style anchor not found — no changes to StyleSheet')

# ── 2. Insert the verse block after the sovereignty line, before signature ────
old_anchor = """        <Text style={S.para}>
          This report doesn't hand over sovereignty. It returns you to it.
        </Text>

        {/* Signature */}"""

new_block = """        <Text style={S.para}>
          This report doesn't hand over sovereignty. It returns you to it.
        </Text>

        {/* Closing verse */}
        <View style={S.verseBlock}>
          <Text style={S.verseText}>
            "And it shall come to pass in the last days, saith God, I will pour out of my Spirit upon all flesh: and your sons and your daughters shall prophesy, and your young men shall see visions, and your old men shall dream dreams."
          </Text>
          <Text style={S.verseCitation}>Acts 2:17</Text>
        </View>

        {/* Signature */}"""

if old_anchor in content:
    content = content.replace(old_anchor, new_block)
    print('✓ Verse inserted after sovereignty line, before signature')
else:
    print('✗ Insertion anchor not found — no changes made to letter body')

with open(path, 'w') as f:
    f.write(content)

print(f'\n{"─" * 56}')
if content == original:
    print('⚠ NO CHANGES WERE MADE — patterns did not match.')
else:
    print('✓ Page44ClosingLetter.tsx updated successfully')
    print('\nRestart: rm -rf .next && npm run dev')
