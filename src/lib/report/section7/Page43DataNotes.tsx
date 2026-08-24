/**
 * Page 43 — Data, Scope, and Reference Notes
 *
 * Birth data used, calculation date, systems included,
 * Field Library link, reflective-framework disclaimer,
 * privacy and data-removal information.
 */

import React from 'react';
import { DataQualityBlock, BirthTimeSensitivityBanner } from '../shared/BirthTimeSensitivity';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { TechnicalLines } from '../shared/PageComponents';
import { C, F, PAGE } from '../tokens';
import type { ReportData } from '../tokens';

const S = StyleSheet.create({
  page: { backgroundColor: '#F5F5F3', padding: 0, fontFamily: F.sans },
  triBar: { flexDirection: 'row', width: PAGE.width },
  barA: { flex: 1, height: 1.5, backgroundColor: C.amber },
  barE: { flex: 1, height: 1.5, backgroundColor: C.emerald },
  barC: { flex: 1, height: 1.5, backgroundColor: C.crimson },
  content: { flex: 1, paddingHorizontal: PAGE.marginH, paddingTop: 40, paddingBottom: PAGE.marginV },
  tag: { fontFamily: F.sans, fontSize: 8.5, fontWeight: 500, letterSpacing: 2.5, color: C.parchmentFaint, textTransform: 'uppercase', marginBottom: 8 },
  heading: { fontFamily: F.display, fontSize: 20, fontWeight: 400, color: C.base, lineHeight: 1.15, marginBottom: 20 },
  rule: { width: PAGE.contentWidth, height: 0.5, backgroundColor: C.base, opacity: 0.1, marginBottom: 20 },

  // Two-column layout
  twoCol: { flexDirection: 'row', gap: 24 },
  col: { flex: 1, flexDirection: 'column', gap: 0 },

  section: { marginBottom: 16 },
  sectionLabel: {
    fontFamily: F.sans, fontSize: 8, fontWeight: 500, letterSpacing: 2,
    textTransform: 'uppercase', color: C.parchmentFaint, marginBottom: 6,
    paddingBottom: 4, borderBottomWidth: 0.5, borderBottomColor: 'rgba(13,13,14,0.1)',
  },
  dataRow: { flexDirection: 'row', gap: 8, paddingVertical: 3 },
  dataKey: { fontFamily: F.sans, fontSize: 8.5, fontWeight: 500, color: C.parchmentFaint, width: 88, flexShrink: 0 },
  dataVal: { flex: 1, fontFamily: F.sans, fontSize: 8.5, fontWeight: 300, color: C.base, lineHeight: 1.5 },

  bodyText: { fontFamily: F.sans, fontSize: 8.5, fontWeight: 300, color: C.base, lineHeight: 1.5, opacity: 0.82 },
  linkText: { fontFamily: F.sans, fontSize: 8.5, fontWeight: 400, color: C.emerald, lineHeight: 1.5 },
  smallText: { fontFamily: F.sans, fontSize: 8.5, fontWeight: 300, color: C.parchmentFaint, lineHeight: 1.5, opacity: 0.8 },

  footer: { paddingHorizontal: PAGE.marginH, paddingBottom: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  footerT: { fontFamily: F.sans, fontSize: 7, letterSpacing: 1.2, color: C.parchmentFaint, textTransform: 'uppercase' },
  pageNum: { fontFamily: F.sans, fontSize: 7, color: C.parchmentFaint },
});

interface Props { data: ReportData; }

export default function Page43DataNotes({ data }: Props) {
  const genDate = new Date(data.generatedAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  // Format birth date for display
  const birthParts = data.birthDate.split('-');
  // Parse birth date as local date to avoid UTC timezone shift (e.g., Sept 30 → Sept 29)
  const birthDateFormatted = (() => {
    if (!data.birthDate) return '—';
    const [y, m, d] = data.birthDate.split('-').map(Number);
    const months = ['January','February','March','April','May','June',
                    'July','August','September','October','November','December'];
    return `${months[(m ?? 1) - 1]} ${d}, ${y}`;
  })();

  const birthDataRows = [
    { key: 'Full Name',    val: `${data.firstName} ${data.lastName}` },
    { key: 'Date of Birth', val: birthDateFormatted },
    { key: 'Report Generated', val: genDate },
    { key: 'Email',        val: data.email },
  ];

  const systemsRows = [
    { key: 'Human Design', val: 'Ra Uru Hu\'s original system. Bodygraph calculated using Swiss Ephemeris at ±88 days from birth date.' },
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
  ];

  return (
    <Page size="LETTER" style={S.page}>
      <TechnicalLines />

      <View style={S.triBar}><View style={S.barA} /><View style={S.barE} /><View style={S.barC} /></View>
      <View style={S.content}>
        <Text style={S.tag}>Section 7 — Integration & Close</Text>
        <Text style={S.heading}>Data, Scope & Reference Notes</Text>
        <View style={S.rule} />

        {/* ── Ethical Scope Note ───────────────────────────────────────── */}
        <View style={{
          padding: 16,
          backgroundColor: C.base,
          marginBottom: 20,
          gap: 6,
        }}>
          <Text style={{
            fontFamily: F.sans,
            fontSize: 7,
            fontWeight: 700,
            letterSpacing: 2.5,
            textTransform: 'uppercase',
            color: C.amber,
            opacity: 0.85,
            marginBottom: 4,
          }}>
            Ethical Scope Note
          </Text>
          <Text style={{
            fontFamily: F.sans,
            fontSize: 10.5,
            fontWeight: 300,
            color: C.parchment,
            lineHeight: 1.6,
            maxWidth: 460,
          }}>
            The Sovereign Report combines interpretive traditions—Human Design, Numerology, and
            Astrology—as reflective tools for self-inquiry. It is not medical, psychological,
            legal, financial, or scientific advice; it does not diagnose conditions, predict
            guaranteed outcomes, or replace qualified professional support. Keep what is useful,
            test it in your lived experience, and retain your own judgment.
          </Text>
        </View>


        {/* Data Quality Report */}
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
            <View style={[S.rule, { marginTop: 16 }]} />
          </>
        )}

        <View style={S.twoCol}>
          {/* Left column */}
          <View style={S.col}>
            {/* Birth data */}
            <View style={S.section}>
              <Text style={S.sectionLabel}>Birth Data Used</Text>
              {birthDataRows.map(r => (
                <View key={r.key} style={S.dataRow}>
                  <Text style={S.dataKey}>{r.key}</Text>
                  <Text style={S.dataVal}>{r.val}</Text>
                </View>
              ))}
            </View>

            {/* Systems */}
            <View style={S.section}>
              <Text style={S.sectionLabel}>Systems Included</Text>
              {systemsRows.map(r => (
                <View key={r.key} style={[S.dataRow, { alignItems: 'flex-start' }]}>
                  <Text style={[S.dataKey, { paddingTop: 1 }]}>{r.key}</Text>
                  <Text style={[S.dataVal, { fontSize: 7 }]}>{r.val}</Text>
                </View>
              ))}
            </View>

            {/* Astrology Methodology — dual-zodiac note */}
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
            </View>
          </View>

          {/* Right column */}
          <View style={S.col}>
            {/* Scope */}
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
            </View>

            {/* Disclaimer */}
            <View style={S.section}>
              <Text style={S.sectionLabel}>Reflective Framework Disclaimer</Text>
              <Text style={S.bodyText}>
                This report is a reflective tool built from three symbolic systems. It is not a substitute for medical, psychological, legal, or financial advice. No interpretation in this report constitutes a diagnosis, prediction, or professional consultation.
              </Text>
              <Text style={[S.bodyText, { marginTop: 6 }]}>
                You are the authority on your own experience. This report offers lenses — not verdicts.
              </Text>
            </View>

            {/* Privacy */}
            <View style={S.section}>
              <Text style={S.sectionLabel}>Privacy & Data Removal</Text>
              <Text style={S.smallText}>
                Your birth data is used exclusively to generate this report and is retained only as described in the T3D Privacy Policy at 3dimensions.guide/privacy.
              </Text>
              <Text style={[S.smallText, { marginTop: 5 }]}>
                To request removal of your data from T3D systems, email: privacy@3dimensions.guide
              </Text>
            </View>
          </View>
        </View>
      </View>
      <View style={S.footer}>
        <Text style={S.footerT}>The Sovereign Report</Text>
        <Text style={S.pageNum}>43</Text>
      </View>
    </Page>
  );
}
