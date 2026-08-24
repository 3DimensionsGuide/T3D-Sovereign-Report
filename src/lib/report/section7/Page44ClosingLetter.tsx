/**
 * Page 44 — Closing Letter / Back Cover
 *
 * Final personal note in Tyler's voice.
 * The report does not hand over sovereignty — it returns the reader to it.
 * Field Library link. Quiet 90-day invitation.
 * NOT a sales page. The reader has already converted.
 * No future offers in the printed report.
 */

import React from 'react';
import path from 'path';
import { Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer';
import { TechnicalLines } from '../shared/PageComponents';
import { C, F, PAGE } from '../tokens';
import type { ReportData } from '../tokens';

// Pre-processed background — darkened, desaturated, sized to page ratio.
// No runtime image manipulation; all styling is baked into the asset.
const BG_IMAGE_PATH = path.join(process.cwd(), 'src/lib/report/assets/page44-bg.jpg');

const S = StyleSheet.create({
  page: { backgroundColor: C.base, padding: 0, fontFamily: F.sans },

  // Full-bleed background image — pre-processed, sits behind all content
  bgImage: {
    position: 'absolute',
    top: 0, left: 0,
    width: PAGE.width, height: PAGE.height,
  },



  // Three bars at top — same as cover but inverted in spirit
  triBar: { flexDirection: 'row', width: PAGE.width },
  barA: { flex: 1, height: 2, backgroundColor: C.amber },
  barE: { flex: 1, height: 2, backgroundColor: C.emerald },
  barC: { flex: 1, height: 2, backgroundColor: C.crimson },

  content: {
    flex: 1, paddingHorizontal: PAGE.marginH,
    paddingTop: 48, paddingBottom: PAGE.marginV,
    justifyContent: 'center',
  },

  // Greeting
  greeting: {
    fontFamily: F.display, fontSize: 14, fontWeight: 400, fontStyle: 'italic',
    color: C.parchmentDim, marginBottom: 28, letterSpacing: 0.2,
  },

  // Letter body
  para: {
    fontFamily: F.sans, fontSize: 10.5, fontWeight: 300,
    color: C.parchment, lineHeight: 1.5, opacity: 0.85,
    marginBottom: 16, maxWidth: 460,
  },

  // Pull quote
  pullQuote: {
    fontFamily: F.display, fontSize: 13, fontWeight: 400, fontStyle: 'italic',
    color: C.parchment, lineHeight: 1.5, marginVertical: 24, maxWidth: 440,
    paddingLeft: 16,
    borderLeftWidth: 1.5, borderLeftColor: 'rgba(107,107,105,0.3)',
  },

  // Field library note
  libraryNote: {
    marginTop: 8, marginBottom: 28,
    flexDirection: 'row', gap: 6, alignItems: 'center',
  },
  libraryLabel: {
    fontFamily: F.sans, fontSize: 8, fontWeight: 500, letterSpacing: 1.5,
    textTransform: 'uppercase', color: C.parchmentFaint, opacity: 0.5,
  },
  libraryLink: {
    fontFamily: F.sans, fontSize: 8, fontWeight: 400, letterSpacing: 0.5,
    color: C.emerald,
  },

  // Closing verse
  verseBlock: {
    marginTop: 8, marginBottom: 28,
    paddingTop: 22,
    borderTopWidth: 0.5, borderTopColor: 'rgba(107,107,105,0.15)',
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
  signatureBlock: { gap: 4, marginTop: 4 },
  signatureDash: { fontFamily: F.sans, fontSize: 10.5, fontWeight: 300, color: C.parchmentFaint, opacity: 0.4, marginBottom: 4 },
  signatureName: { fontFamily: F.display, fontSize: 16, fontWeight: 400, fontStyle: 'italic', color: C.parchment },
  signatureTitle: { fontFamily: F.sans, fontSize: 8.5, fontWeight: 400, letterSpacing: 1.5, textTransform: 'uppercase', color: C.parchmentFaint, opacity: 0.5, marginTop: 2 },

  // Bottom bar — three colors again, subtle
  bottomBar: { flexDirection: 'row', width: PAGE.width },
  bottomBarInner: { flex: 1, height: 1.5, opacity: 0.4 },

  bottomStamp: {
    paddingHorizontal: PAGE.marginH, paddingVertical: 14,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  stampText: { fontFamily: F.sans, fontSize: 8, fontWeight: 400, letterSpacing: 1.5, textTransform: 'uppercase', color: C.parchmentFaint, opacity: 0.35 },
  pageNum: { fontFamily: F.sans, fontSize: 8, color: C.parchmentFaint, opacity: 0.35 },
});

interface Props { data: Pick<ReportData, 'firstName'>; }

export default function Page44ClosingLetter({ data }: Props) {
  return (
    <Page size="LETTER" style={S.page}>
      <Image src={BG_IMAGE_PATH} style={S.bgImage} />
      <TechnicalLines variant="dark" />

      <View style={S.triBar}>
        <View style={S.barA} /><View style={S.barE} /><View style={S.barC} />
      </View>

      <View style={S.content}>
        <Text style={S.greeting}>Dear {data.firstName},</Text>

        <Text style={S.para}>
          What you've just read was not written to tell you who you are. It was written to offer three lenses that might help you see yourself more clearly — and more charitably than you sometimes manage on your own.
        </Text>

        <Text style={S.para}>
          You came in knowing more about yourself than any report can hold. The chart descriptions, the numbers, the signs — they don't create your life. They name patterns that were already in motion. What you do with that naming is entirely yours.
        </Text>

        <Text style={S.para}>
          What I hope you take from this is simpler than anything in the preceding pages: trust your own signal. The Vehicle tells you how to make decisions. The Road shows you where you've been pointing. The Stoplight reads what the current conditions are asking for. But none of them outrank your own direct experience of being you.
        </Text>

        <Text style={S.pullQuote}>
          Keep the Navigation Card near your decisions. Return to this guide after ninety days — not because you have failed to understand yourself, but because a good map becomes more useful as you travel.
        </Text>

        <Text style={S.para}>
          What you couldn't hear in the first reading often arrives clearly in the third. The guide doesn't change. You do.
        </Text>

        {/* Field Library note */}
        <View style={S.libraryNote}>
          <Text style={S.libraryLabel}>Complete technical data →</Text>
          <Text style={S.libraryLink}>3dimensions.guide/library</Text>
        </View>

        <Text style={S.para}>
          This report doesn't hand over sovereignty. It returns you to it.
        </Text>

        {/* Closing verse */}
        <View style={S.verseBlock}>
          <Text style={S.verseText}>
            "And it shall come to pass in the last days, saith God, I will pour out of my Spirit upon all flesh: and your sons and your daughters shall prophesy, and your young men shall see visions, and your old men shall dream dreams."
          </Text>
          <Text style={S.verseCitation}>Acts 2:17</Text>
        </View>

        {/* Signature */}
        <View style={S.signatureBlock}>
          <Text style={S.signatureDash}>—</Text>
          <Text style={S.signatureName}>Tyler Henry</Text>
          <Text style={S.signatureTitle}>T3D Studio · 3dimensions.guide</Text>
        </View>
      </View>

      {/* Bottom bars */}
      <View style={S.bottomBar}>
        <View style={[S.bottomBarInner, { backgroundColor: C.amber }]} />
        <View style={[S.bottomBarInner, { backgroundColor: C.emerald }]} />
        <View style={[S.bottomBarInner, { backgroundColor: C.crimson }]} />
      </View>

      <View style={S.bottomStamp}>
        <Text style={S.stampText}>T3D Sovereign Report · 3dimensions.guide · privacy@3dimensions.guide</Text>
        <Text style={S.pageNum}>44</Text>
      </View>
    </Page>
  );
}
