#!/usr/bin/env python3
"""
T3D Page 44 — Background Image Patch
=======================================
Adds the pre-processed crystal image as a full-bleed background behind
the closing letter. The image is already darkened, desaturated, and
overlaid at production values — no runtime image processing needed.

Assumes patch_page44_verse.py has already been applied (adds the
Acts 2:17 verse block this background sits behind).

Run from project root, AFTER copying page44-bg.jpg into place:
  mkdir -p src/lib/report/assets
  cp ~/Downloads/page44-bg.jpg src/lib/report/assets/page44-bg.jpg
  python3 patch_page44_bg_image.py
"""

import os, sys

PROJECT_ROOT = sys.argv[1] if len(sys.argv) > 1 else os.path.expanduser(
    '~/Developer/3dimensions.guide'
)
path = os.path.join(
    PROJECT_ROOT, 'src', 'lib', 'report', 'section7', 'Page44ClosingLetter.tsx'
)
asset_path = os.path.join(
    PROJECT_ROOT, 'src', 'lib', 'report', 'assets', 'page44-bg.jpg'
)

if not os.path.exists(path):
    print(f'ERROR: File not found at {path}')
    sys.exit(1)

if not os.path.exists(asset_path):
    print(f'WARNING: Background image not found at {asset_path}')
    print('  Copy page44-bg.jpg there first, then re-run this script.')
    sys.exit(1)

with open(path, 'r') as f:
    content = f.read()

original = content
changes = 0

# ── 1. Add Image import + path module ─────────────────────────────────────────
old_imports = """import React from 'react';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { TechnicalLines } from '../shared/PageComponents';
import { C, F, PAGE } from '../tokens';
import type { ReportData } from '../tokens';"""

new_imports = """import React from 'react';
import path from 'path';
import { Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer';
import { TechnicalLines } from '../shared/PageComponents';
import { C, F, PAGE } from '../tokens';
import type { ReportData } from '../tokens';

// Pre-processed background — darkened, desaturated, sized to page ratio.
// No runtime image manipulation; all styling is baked into the asset.
const BG_IMAGE_PATH = path.join(process.cwd(), 'src/lib/report/assets/page44-bg.jpg');"""

if old_imports in content:
    content = content.replace(old_imports, new_imports)
    print('✓ Image import + background path added')
    changes += 1
else:
    print('✗ Import block not matched — check file header')

# ── 2. Add background image style ─────────────────────────────────────────────
old_page_style = """const S = StyleSheet.create({
  page: { backgroundColor: C.base, padding: 0, fontFamily: F.sans },"""

new_page_style = """const S = StyleSheet.create({
  page: { backgroundColor: C.base, padding: 0, fontFamily: F.sans },

  // Full-bleed background image — pre-processed, sits behind all content
  bgImage: {
    position: 'absolute',
    top: 0, left: 0,
    width: PAGE.width, height: PAGE.height,
  },"""

if old_page_style in content:
    content = content.replace(old_page_style, new_page_style)
    print('✓ bgImage style added')
    changes += 1
else:
    print('✗ page style block not matched')

# ── 3. Insert <Image> as first child, before TechnicalLines ───────────────────
old_render_start = """    <Page size="LETTER" style={S.page}>
      <TechnicalLines variant="dark" />"""

new_render_start = """    <Page size="LETTER" style={S.page}>
      <Image src={BG_IMAGE_PATH} style={S.bgImage} />
      <TechnicalLines variant="dark" />"""

if old_render_start in content:
    content = content.replace(old_render_start, new_render_start)
    print('✓ Background Image placed behind all content')
    changes += 1
else:
    print('✗ Render start not matched')

with open(path, 'w') as f:
    f.write(content)

print(f'\n{"─" * 56}')
if content == original:
    print('⚠ NO CHANGES WERE MADE — patterns did not match.')
else:
    print(f'✓ Page44ClosingLetter.tsx updated ({changes}/3 patches applied)')
    print('\nRestart: rm -rf .next && npm run dev')
