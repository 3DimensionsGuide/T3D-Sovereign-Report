/**
 * Page 14 — Your Defined Strengths
 * 2–3 lived capacities from consistently defined centers/channels.
 * Organized by capacity, not by center list.
 */

import React from 'react';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { TechnicalLines } from '../shared/PageComponents';
import { C, F, PAGE } from '../tokens';
import { CENTER_CAPACITIES } from './hd-content';
import type { ReportData } from '../tokens';

const S14 = StyleSheet.create({
  page: { backgroundColor: '#F5F5F3', padding: 0, fontFamily: F.sans },
  amberLine: { width: PAGE.width, height: 1.5, backgroundColor: C.amber },
  content: { flex: 1, paddingHorizontal: PAGE.marginH, paddingTop: 40, paddingBottom: PAGE.marginV },
  sectionTag: {
    fontFamily: F.sans, fontSize: 8.5, fontWeight: 500,
    letterSpacing: 2.5, color: C.parchmentFaint, textTransform: 'uppercase', marginBottom: 8,
  },
  heading: {
    fontFamily: F.display, fontSize: 22, fontWeight: 400, color: C.base, lineHeight: 1.15, marginBottom: 8,
  },
  subheading: {
    fontFamily: F.sans, fontSize: 10.5, fontWeight: 300, color: C.parchmentFaint,
    lineHeight: 1.5, marginBottom: 20, maxWidth: 380,
  },
  headingRule: { width: PAGE.contentWidth, height: 0.5, backgroundColor: C.base, opacity: 0.1, marginBottom: 20 },

  // Capacity cards
  capacityList: { flexDirection: 'column', gap: 0 },
  capacityCard: {
    paddingVertical: 18, paddingHorizontal: 0,
    borderBottomWidth: 0.5, borderBottomColor: C.base, borderBottomStyle: 'solid',
    flexDirection: 'row', gap: 14,
  },
  capacityCardLast: {
    paddingVertical: 18, paddingHorizontal: 0, flexDirection: 'row', gap: 14,
  },
  capacityBar: { width: 2, flexShrink: 0, backgroundColor: C.amber, borderRadius: 1 },
  capacityBody: { flex: 1, gap: 6 },
  capacityTitle: {
    fontFamily: F.display, fontSize: 15, fontWeight: 400, color: C.base, lineHeight: 1.15,
  },
  capacityDesc: {
    fontFamily: F.sans, fontSize: 10.5, fontWeight: 300, color: C.base, lineHeight: 1.5, opacity: 0.85,
  },
  capacityCenters: {
    fontFamily: F.sans, fontSize: 7, fontWeight: 400, letterSpacing: 1.2,
    color: C.parchmentFaint, textTransform: 'uppercase', marginTop: 2,
  },

  // Note
  note: {
    marginTop: 20, paddingTop: 14,
    borderTopWidth: 0.5, borderTopColor: C.base, borderTopStyle: 'solid',
  },
  noteText: {
    fontFamily: F.display, fontSize: 10.5, fontWeight: 400, fontStyle: 'italic',
    color: C.base, lineHeight: 1.5, opacity: 0.65,
  },

  footer: {
    paddingHorizontal: PAGE.marginH, paddingBottom: 24,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  footerText: { fontFamily: F.sans, fontSize: 7, letterSpacing: 1.2, color: C.parchmentFaint, textTransform: 'uppercase' },
  pageNum: { fontFamily: F.sans, fontSize: 7, color: C.parchmentFaint },
});

const CENTER_DISPLAY: Record<string, string> = {
  head: 'Head', ajna: 'Ajna', throat: 'Throat', g_center: 'Identity',
  heart: 'Heart', sacral: 'Sacral', solar_plexus: 'Solar Plexus', spleen: 'Spleen', root: 'Root',
};

interface Page14Props {
  data: Pick<ReportData, 'hdDefinedCenters' | 'hdType'>;
}

export function Page14DefinedStrengths({ data }: Page14Props) {
  // Map defined centers to capacity objects — deduplicate and limit to 3
  const seen = new Set<string>();
  const capacities = data.hdDefinedCenters
    .map(center => ({ center, capacity: CENTER_CAPACITIES[center] }))
    .filter(({ capacity }) => {
      if (!capacity || seen.has(capacity.title)) return false;
      seen.add(capacity.title);
      return true;
    })
    .slice(0, 3)
    .map(({ center, capacity }) => ({
      ...capacity!,
      centerLabel: CENTER_DISPLAY[center] ?? center,
    }));

  // Fallback if no defined centers found
  if (capacities.length === 0) {
    capacities.push({
      title: 'Consistent Energy Configuration',
      description: 'Your defined centers provide you with a stable, reliable energy field in specific areas of life. These are places where you consistently show up in the same way — and where others can count on you.',
      centers: [],
      centerLabel: 'Defined',
    });
  }

  return (
    <Page size="LETTER" style={S14.page}>
      <TechnicalLines />

      <View style={S14.amberLine} />
      <View style={S14.content}>
        <Text style={S14.sectionTag}>Section 3 — The Vehicle</Text>
        <Text style={S14.heading}>Your Defined Strengths</Text>
        <Text style={S14.subheading}>
          These are your consistent capacities — what you reliably bring into every room, regardless of the environment or the people around you.
        </Text>
        <View style={S14.headingRule} />

        <View style={S14.capacityList}>
          {capacities.map((cap, i) => (
            <View key={cap.title} style={i === capacities.length - 1 ? S14.capacityCardLast : S14.capacityCard}>
              <View style={[S14.capacityBar, { height: 52 }]} />
              <View style={S14.capacityBody}>
                <Text style={S14.capacityTitle}>{cap.title}</Text>
                <Text style={S14.capacityDesc}>{cap.description}</Text>
                <Text style={S14.capacityCenters}>{cap.centerLabel} Center — Defined</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={S14.note}>
          <Text style={S14.noteText}>
            Defined centers are not achievements — they are your baseline. You don't have to try to express these qualities. They express themselves whether or not you intend them to.
          </Text>
        </View>
      </View>

      <View style={S14.footer}>
        <Text style={S14.footerText}>The Sovereign Report</Text>
        <Text style={S14.pageNum}>14</Text>
      </View>
    </Page>
  );
}
