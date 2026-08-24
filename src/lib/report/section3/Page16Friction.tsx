/**
 * Page 16 — Vehicle Friction & Recalibration
 * "When this vehicle is forced, it sounds like..."
 * Not-Self voice pattern, authority distortion, one reset practice.
 */

import React from 'react';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { TechnicalLines } from '../shared/PageComponents';
import { C, F, PAGE } from '../tokens';
import { NOT_SELF_VOICE, AUTHORITY_DISTORTION, AUTHORITY_CONTENT } from './hd-content';
import type { ReportData } from '../tokens';

const S = StyleSheet.create({
  page: { backgroundColor: '#F5F5F3', padding: 0, fontFamily: F.sans },
  amberLine: { width: PAGE.width, height: 1.5, backgroundColor: C.amber },
  content: { flex: 1, paddingHorizontal: PAGE.marginH, paddingTop: 40, paddingBottom: PAGE.marginV },

  sectionTag: {
    fontFamily: F.sans, fontSize: 8.5, fontWeight: 500,
    letterSpacing: 2.5, color: C.parchmentFaint, textTransform: 'uppercase', marginBottom: 8,
  },
  heading: { fontFamily: F.display, fontSize: 22, fontWeight: 400, color: C.base, lineHeight: 1.15, marginBottom: 20 },
  headingRule: { width: PAGE.contentWidth, height: 0.5, backgroundColor: C.base, opacity: 0.1, marginBottom: 20 },

  // "When the vehicle is forced" section
  forcedLabel: {
    fontFamily: F.sans, fontSize: 8.5, fontWeight: 500,
    letterSpacing: 2.2, textTransform: 'uppercase', color: C.crimson,
    marginBottom: 10,
  },
  forcedIntro: {
    fontFamily: F.display, fontSize: 12, fontWeight: 400, fontStyle: 'italic',
    color: C.base, lineHeight: 1.4, marginBottom: 14, opacity: 0.8,
  },

  // Voice examples
  voiceList: { gap: 8, marginBottom: 20 },
  voiceItem: {
    padding: '10 14',
    backgroundColor: '#FBF0EE',
    borderLeftWidth: 2, borderLeftColor: C.crimson, borderLeftStyle: 'solid',
  },
  voiceText: {
    fontFamily: F.display, fontSize: 11, fontWeight: 400, fontStyle: 'italic',
    color: C.base, lineHeight: 1.4,
  },

  // Authority distortion block
  distortionBlock: {
    padding: 14,
    backgroundColor: '#F5F2EC',
    borderLeftWidth: 2, borderLeftColor: C.amberDim, borderLeftStyle: 'solid',
    marginBottom: 20,
    gap: 5,
  },
  distortionLabel: {
    fontFamily: F.sans, fontSize: 8, fontWeight: 500,
    letterSpacing: 2, textTransform: 'uppercase', color: C.amberDim,
  },
  distortionTitle: {
    fontFamily: F.display, fontSize: 12, fontWeight: 400, color: C.base,
  },
  distortionText: {
    fontFamily: F.sans, fontSize: 10.5, fontWeight: 300,
    color: C.base, lineHeight: 1.5, opacity: 0.85,
  },

  // Reset block
  resetBlock: {
    padding: 16, backgroundColor: C.base, gap: 6,
  },
  resetLabel: {
    fontFamily: F.sans, fontSize: 8, fontWeight: 500,
    letterSpacing: 2, textTransform: 'uppercase', color: C.amber, opacity: 0.8,
  },
  resetTitle: { fontFamily: F.display, fontSize: 12, fontWeight: 400, color: C.parchment },
  resetText: {
    fontFamily: F.sans, fontSize: 10.5, fontWeight: 300,
    color: C.parchment, lineHeight: 1.5, opacity: 0.75,
  },

  footer: {
    paddingHorizontal: PAGE.marginH, paddingBottom: 24,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  footerText: { fontFamily: F.sans, fontSize: 7, letterSpacing: 1.2, color: C.parchmentFaint, textTransform: 'uppercase' },
  pageNum: { fontFamily: F.sans, fontSize: 7, color: C.parchmentFaint },
});

interface Props {
  data: Pick<ReportData, 'hdType' | 'hdAuthority' | 'hdNotSelf'>;
}

export default function Page16Friction({ data }: Props) {
  const voices = NOT_SELF_VOICE[data.hdType] ?? NOT_SELF_VOICE['Generator']!;

  const authorityKey = Object.keys(AUTHORITY_DISTORTION).find(k =>
    data.hdAuthority.toLowerCase().includes(k.toLowerCase())
  ) ?? 'Sacral';
  const distortionText = AUTHORITY_DISTORTION[authorityKey] ?? AUTHORITY_DISTORTION['Sacral']!;

  const authorityKey2 = Object.keys(AUTHORITY_CONTENT).find(k =>
    data.hdAuthority.toLowerCase().includes(k.toLowerCase())
  ) ?? 'Sacral';
  const ac = AUTHORITY_CONTENT[authorityKey2] ?? AUTHORITY_CONTENT['Sacral']!;

  return (
    <Page size="LETTER" style={S.page}>
      <TechnicalLines />

      <View style={S.amberLine} />
      <View style={S.content}>
        <Text style={S.sectionTag}>Section 3 — The Vehicle</Text>
        <Text style={S.heading}>Vehicle Friction & Recalibration</Text>
        <View style={S.headingRule} />

        {/* Not-Self voice */}
        <Text style={S.forcedLabel}>When This Vehicle Is Forced, It Sounds Like…</Text>
        <Text style={S.forcedIntro}>
          The {data.hdNotSelf || 'Not-Self'} theme has a voice. These are the sentences it uses — the ones that feel like reasoning but are actually signals that you\'ve moved outside your design.
        </Text>

        <View style={S.voiceList}>
          {voices.map((voice, i) => (
            <View key={i} style={S.voiceItem}>
              <Text style={S.voiceText}>{voice}</Text>
            </View>
          ))}
        </View>

        {/* Authority distortion */}
        <View style={S.distortionBlock}>
          <Text style={S.distortionLabel}>{data.hdAuthority} Authority — When Distorted</Text>
          <Text style={S.distortionText}>{distortionText}</Text>
        </View>

        {/* Reset */}
        <View style={S.resetBlock}>
          <Text style={S.resetLabel}>Recalibration Practice</Text>
          <Text style={S.resetTitle}>{ac.reset.title}</Text>
          <Text style={S.resetText}>{ac.reset.instruction}</Text>
        </View>
      </View>

      <View style={S.footer}>
        <Text style={S.footerText}>The Sovereign Report</Text>
        <Text style={S.pageNum}>16</Text>
      </View>
    </Page>
  );
}
