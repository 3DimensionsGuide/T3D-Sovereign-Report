/**
 * Pages 36–39
 * 36: How You Create & Work — Creative compass
 * 37: How You Relate — Relational compass (non-clinical)
 * 38: Your Recalibration Sequence — Protocol for frustrated/stuck/depleted/confused
 * 39: Your 7-Day Sovereignty Experiment — Integrated experiment
 */

import React from 'react';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { TechnicalLines } from '../shared/PageComponents';
import { C, F, PAGE } from '../tokens';
import { AUTHORITY_PROTOCOL, TYPE_EXPERIMENT, PERSONAL_YEAR_THEMES } from '../tokens';
import { SIGN_ELEMENT, MOON_SIGN_CONTENT } from '../section5/astro-content';
import type { ReportData } from '../tokens';

// ── Shared styles ────────────────────────────────────────────────────────────
const BASE = StyleSheet.create({
  page:     { backgroundColor: '#F5F5F3', padding: 0, fontFamily: F.sans },
  triBar:   { flexDirection: 'row', width: PAGE.width },
  barA:     { flex: 1, height: 1.5, backgroundColor: C.amber },
  barE:     { flex: 1, height: 1.5, backgroundColor: C.emerald },
  barC:     { flex: 1, height: 1.5, backgroundColor: C.crimson },
  content:  { flex: 1, paddingHorizontal: PAGE.marginH, paddingTop: 38, paddingBottom: PAGE.marginV },
  tag:      { fontFamily: F.sans, fontSize: 8.5, fontWeight: 500, letterSpacing: 2.5, color: C.parchmentFaint, textTransform: 'uppercase', marginBottom: 8 },
  heading:  { fontFamily: F.display, fontSize: 22, fontWeight: 400, color: C.base, lineHeight: 1.15, marginBottom: 6 },
  sub:      { fontFamily: F.sans, fontSize: 10.5, fontWeight: 300, color: C.parchmentFaint, lineHeight: 1.5, marginBottom: 18, maxWidth: 440 },
  rule:     { width: PAGE.contentWidth, height: 0.5, backgroundColor: C.base, opacity: 0.1, marginBottom: 18 },
  label:    { fontFamily: F.sans, fontSize: 8, fontWeight: 500, letterSpacing: 2, textTransform: 'uppercase' },
  body:     { fontFamily: F.sans, fontSize: 10.5, fontWeight: 300, color: C.base, lineHeight: 1.5, opacity: 0.85 },
  italic:   { fontFamily: F.display, fontSize: 10.5, fontWeight: 400, fontStyle: 'italic', color: C.base, lineHeight: 1.5, opacity: 0.7 },
  footer:   { paddingHorizontal: PAGE.marginH, paddingBottom: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  footerT:  { fontFamily: F.sans, fontSize: 7, letterSpacing: 1.2, color: C.parchmentFaint, textTransform: 'uppercase' },
  pageNum:  { fontFamily: F.sans, fontSize: 7, color: C.parchmentFaint },
  block:    { padding: 14, gap: 5, marginBottom: 12 },
  darkBlock:{ padding: 14, backgroundColor: C.base, gap: 5, marginBottom: 12 },
  noteLine: { width: PAGE.contentWidth, height: 0.5, backgroundColor: C.base, opacity: 0.12 },
});

// ─── CREATIVE CADENCE BY TYPE ─────────────────────────────────────────────────
const CREATIVE_CADENCE: Record<string, string> = {
  'Manifesting Generator': 'Burst-sprint-pivot. You generate across multiple threads rather than one sustained line. Follow the gut-yes without pre-planning the full sequence — the path becomes visible through movement, not before it.',
  'Generator':             'Sustained engagement when the work is genuinely lit up. Your creative energy is renewable — but only for work that passes the Sacral check. The cadence is long and deep when the response is real, and short and flat when it isn\'t.',
  'Projector':             'Concentrated bursts followed by genuine rest. You work best in focused, invitation-rich contexts. The quality of your output depends on honoring the recovery between sessions — which is not optional, it\'s the mechanism.',
  'Manifestor':            'Initiation-heavy, front-loaded. You generate the opening movement and then hand off or inform. The cadence moves in waves of creative heat followed by periods of genuine disengagement that others may misread as withdrawal.',
  'Reflector':             'Cyclical and environment-dependent. Your creative capacity varies significantly with the quality of the environment and the lunar cycle. The right context doubles what\'s possible; the wrong one reduces everything to maintenance.',
};

// ─── FULFILLMENT PATTERN BY LIFE PATH ────────────────────────────────────────
const FULFILLMENT_PATTERN: Record<number, string> = {
  1: 'Work that lets you originate — lead, define, and build something distinctly yours. Borrowed projects, collaborative decision-making without authority, or undefined scope produce a frustration that eventually ends the engagement.',
  2: 'Work that involves genuine partnership and contribution to something larger. You are most productive when cooperating — and most depleted when working in complete isolation without feedback or exchange.',
  3: 'Work that involves expression, communication, and creation. When you can put what you know or feel into a form that others receive, the work sustains itself. When you can\'t express, the work stalls.',
  4: 'Work that produces something durable and real. Building, systems design, and methodical mastery sustain you. Work without tangible output or measurable progress produces a specific low-grade dissatisfaction.',
  5: 'Work that changes — in form, context, or audience. Variety isn\'t preference; for you it\'s sustainability. Repetition without evolution produces a restlessness that eventually expresses as departure.',
  6: 'Work that serves something or someone real. When the purpose is clear and the people are genuine, you sustain effort at unusual depth. When the purpose is abstract or the people are disengaged, the work loses its fuel.',
  7: 'Work that investigates, questions, or moves below the surface. Depth is your natural operating zone. Work that requires speed over quality, or performance over understanding, produces a quiet inner resistance that compounds over time.',
  8: 'Work at scale — or work building toward scale. You need to see the larger game you\'re playing. Small stakes or undefined scope produce an ambition that has nowhere to go, which tends to come out as impatience or over-management.',
  9: 'Work that contributes to something larger than yourself or completes what others have left unfinished. When you can see the larger purpose, your capacity to give is remarkable. When the purpose is absent, the work feels hollow.',
  11: 'Work that carries meaning — that elevates or illuminates rather than simply produces. Your creative output is connected to something beyond the task itself. Without that connection, the work produces output but not satisfaction.',
  22: 'Work that builds lasting structure — at unusual scale. The right project for you has a scope that others might find overwhelming. Small work for a 22 Life Path produces a persistent sense of operating below the level your design is built for.',
  33: 'Work that serves through genuine creative mastery and compassionate expression. Teaching, creating, healing — when these channels are open, your output carries unusual weight. When they\'re blocked, no amount of productivity resolves the resulting depletion.',
};

// ─── VISIBILITY/ENVIRONMENT BY ELEMENT ───────────────────────────────────────
const ENVIRONMENT_PATTERN: Record<string, string> = {
  Fire:  'You work best in environments with movement, possibility, and visible impact. Too much stillness or constraint fragments the initiating energy that drives your best output. You need to see things moving in order to keep moving.',
  Earth: 'You work best in stable, consistent environments that allow incremental construction. Chaos and frequent disruption fragment the sustained effort that produces your most durable work. You need ground under you.',
  Air:   'You work best in intellectually stimulating environments with access to conversation, exchange, and ideas. Prolonged isolation from intellectual contact reduces output significantly. You need the field of other minds.',
  Water: 'You work best in quiet, emotionally safe environments where you can move at your own rhythm. Pressured or emotionally turbulent environments drain the sensitivity that produces your deepest and most resonant work.',
};

// ─── DECISION PACE BY AUTHORITY ──────────────────────────────────────────────
const DECISION_PACE: Record<string, string> = {
  'Sacral':          'Immediate and pre-verbal. In relationships, the gut speaks before the mind explains. Honor the first response — don\'t argue yourself out of it or into it.',
  'Emotional':       'Across cycles. You need time at different emotional states before genuine relational commitment is available. Deciding at the peak of connection or the depth of disappointment produces regret more reliably than anything else.',
  'Splenic':         'First moment. The body\'s initial sense of a person carries significant information. Retrieve that signal before analysis overlaid it — it knew before you did.',
  'Self-Projected':  'Through speaking. Talk the relationship through out loud with someone who will listen without advising. What you hear yourself say is the data — not what you planned to say.',
  'Ego':             'Through honest desire. Ask: do I actually want this relationship, or do I think I should? The distinction between genuine desire and obligation determines the quality of what follows.',
  'None':            'Through environmental exposure over time. How you feel about this person across different contexts and moments is the data — not a single encounter, however compelling.',
};

// ─── RECALIBRATION STATES ────────────────────────────────────────────────────
const RECALIBRATION = [
  {
    state:    'FRUSTRATED',
    color:    C.amber,
    check:    'Check the Vehicle first',
    signal:   'Frustration is the signal that your Vehicle\'s strategy or authority isn\'t being honored. This is HD\'s native not-self signal for Generators and Manifesting Generators — and a near-universal indicator that the decision mechanism was bypassed.',
    protocol: 'Return to your Authority. Ask one yes/no question of your correct mechanism. Don\'t explain — just check.',
    question: 'Am I acting from my correct decision process — or from what I thought I should do?',
  },
  {
    state:    'STUCK',
    color:    C.emerald,
    check:    'Check the Road second',
    signal:   'Stuck often means you\'re at a developmental crossroads — a Pinnacle transition, or a Life Path moment where the old approach no longer works but the new one isn\'t yet visible. The Road provides context.',
    protocol: 'Ask: am I stuck, or am I in the pause between one developmental phase and the next? Name your current Pinnacle. Ask what this phase is designed to teach.',
    question: 'Is this stuck-ness a problem to solve — or a passage to move through?',
  },
  {
    state:    'DEPLETED',
    color:    C.crimson,
    check:    'Check the Stoplight third',
    signal:   'Depletion often comes from absorbing environmental or emotional conditions that aren\'t yours — or from operating against the seasonal flow. The Stoplight asks: whose energy are you running on?',
    protocol: 'Ask: is this depletion mine, or have I been carrying something from the environment? Remove yourself briefly from the conditions and notice if the depletion shifts.',
    question: 'Is this feeling coming from inside my own system — or am I running someone else\'s weather?',
  },
  {
    state:    'CONFUSED',
    color:    C.parchmentDim,
    check:    'Run all three in sequence',
    signal:   'Confusion usually means the wrong instrument is being used for the question at hand. The three systems answer different questions — running them simultaneously produces noise.',
    protocol: 'Slow down. Run Vehicle → Road → Stoplight in order. Each one answers a distinct question: the how, the why and pattern, and the when and conditions.',
    question: 'Which question am I actually asking — and which instrument is designed to answer it?',
  },
];

// ─── PAGE 36 ─────────────────────────────────────────────────────────────────
interface P36Props { data: Pick<ReportData, 'hdType' | 'lifePath' | 'sunSign' | 'risingSign'>; }

export function Page36CreativeWork({ data }: P36Props) {
  const cadence     = CREATIVE_CADENCE[data.hdType]    ?? CREATIVE_CADENCE['Generator']!;
  const fulfillment = FULFILLMENT_PATTERN[data.lifePath] ?? 'Work aligned with your Life Path direction produces sustainable energy; work against it depletes faster than the output justifies.';
  const sunEl       = SIGN_ELEMENT[data.sunSign] ?? 'Fire';
  const environment = ENVIRONMENT_PATTERN[sunEl] ?? ENVIRONMENT_PATTERN['Fire']!;

  const compass = [
    { label: 'Energy Cadence', system: 'Vehicle · Human Design', color: C.amber, value: data.hdType, text: cadence },
    { label: 'Fulfillment Pattern', system: 'Road · Life Path', color: C.emerald, value: `Life Path ${data.lifePath}`, text: fulfillment },
    { label: 'Visibility & Environment', system: 'Stoplight · Astrology', color: C.crimson, value: `${data.sunSign} Sun · ${sunEl} Element`, text: environment },
  ];

  return (
    <Page size="LETTER" style={BASE.page}>
      <TechnicalLines />

      <View style={BASE.triBar}><View style={BASE.barA} /><View style={BASE.barE} /><View style={BASE.barC} /></View>
      <View style={BASE.content}>
        <Text style={BASE.tag}>Section 6 — The Sovereign Operating System</Text>
        <Text style={BASE.heading}>How You Create & Work</Text>
        <Text style={BASE.sub}>Your creative compass — three dimensions of how your best work actually happens.</Text>
        <View style={BASE.rule} />

        {compass.map((c, i) => (
          <View key={c.label} style={{
            flexDirection: 'row', gap: 14,
            paddingVertical: 16,
            borderBottomWidth: i < compass.length - 1 ? 0.5 : 0,
            borderBottomColor: 'rgba(13,13,14,0.1)',
          }}>
            <View style={{ width: 2, flexShrink: 0, backgroundColor: c.color, borderRadius: 1, height: 64 }} />
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={[BASE.label, { color: c.color }]}>{c.label} · {c.system}</Text>
              <Text style={{ fontFamily: F.display, fontSize: 13, fontWeight: 400, color: C.base, lineHeight: 1.2 }}>{c.value}</Text>
              <Text style={BASE.body}>{c.text}</Text>
            </View>
          </View>
        ))}

        <View style={[BASE.block, { backgroundColor: '#F0EEE9', marginTop: 8 }]}>
          <Text style={BASE.italic}>
            When these three elements align — the right cadence, the right kind of work, the right environment — you are not trying to be productive. The output arrives because the conditions are correct.
          </Text>
        </View>
      </View>
      <View style={BASE.footer}><Text style={BASE.footerT}>The Sovereign Report</Text><Text style={BASE.pageNum}>36</Text></View>
    </Page>
  );
}

// ─── PAGE 37 ─────────────────────────────────────────────────────────────────
interface P37Props { data: Pick<ReportData, 'hdAuthority' | 'hdType' | 'hdNotSelf' | 'moonSign' | 'sunSign'>; }

export function Page37Relate({ data }: P37Props) {
  const authorityKey = Object.keys(DECISION_PACE).find(k =>
    data.hdAuthority.toLowerCase().includes(k.toLowerCase())
  ) ?? 'Sacral';
  const pace = DECISION_PACE[authorityKey] ?? DECISION_PACE['Sacral']!;
  const moonNeeds = MOON_SIGN_CONTENT[data.moonSign] ?? `Your ${data.moonSign} Moon shapes what you need to feel emotionally safe in close relationships.`;
  const sunEl = SIGN_ELEMENT[data.sunSign] ?? 'Fire';

  const notSelfPatterns: Record<string, string> = {
    'Frustration': 'Your relational not-self pattern is over-adapting — accommodating others\' expectations rather than staying in your correct response. The question is: are you genuinely responding to this person, or managing them?',
    'Bitterness':  'Your relational not-self pattern is guiding before being recognized. In relationships, this arrives as unsolicited advice, unacknowledged effort, or the exhaustion of steering something that didn\'t ask for your input.',
    'Anger':       'Your relational not-self pattern is moving without informing — which creates the resistance you then spend energy managing. The fix is almost always the conversation that comes before the action.',
    'Disappointment': 'Your relational not-self pattern is shaped by environment. The relationships that most deplete you are often symptoms of a larger environmental mismatch — not a relational failure alone.',
  };

  const projectionByElement: Record<string, string> = {
    Fire:  'You tend to project energy, enthusiasm, and urgency onto others — expecting them to match your pace or share your fire. When they don\'t, it can read as disinterest when it\'s actually a different cadence.',
    Earth: 'You tend to project stability and reliability expectations onto others — expecting them to be as consistent and grounded as you are. Unpredictability in others can feel like unreliability even when it isn\'t.',
    Air:   'You tend to project intellectual reciprocity — expecting conversations to meet you at the level you bring. When they don\'t, it can register as disengagement when it\'s simply a different way of processing.',
    Water: 'You tend to over-adapt emotionally — absorbing what others are feeling and responding to that rather than to your own experience. The pattern is giving others the emotional space you\'d like for yourself.',
  };

  const relationalBlocks = [
    { label: 'Decision Pace', color: C.amber, system: 'Vehicle · Authority', text: pace },
    { label: 'What You Need', color: C.emerald, system: 'Stoplight · Moon', text: moonNeeds },
    { label: 'Boundary Pattern', color: C.amber, system: `Vehicle · ${data.hdNotSelf || 'Not-Self'}`, text: notSelfPatterns[data.hdNotSelf ?? ''] ?? notSelfPatterns['Frustration']! },
    { label: 'Over-Adaptation Tendency', color: C.crimson, system: `Stoplight · ${data.sunSign} Sun`, text: projectionByElement[sunEl] ?? projectionByElement['Air']! },
  ];

  return (
    <Page size="LETTER" style={BASE.page}>
      <TechnicalLines />

      <View style={BASE.triBar}><View style={BASE.barA} /><View style={BASE.barE} /><View style={BASE.barC} /></View>
      <View style={BASE.content}>
        <Text style={BASE.tag}>Section 6 — The Sovereign Operating System</Text>
        <Text style={BASE.heading}>How You Relate</Text>
        <Text style={BASE.sub}>Your relational compass — decision pace, needs, boundaries, and patterns. Not diagnostic — navigational.</Text>
        <View style={BASE.rule} />

        {relationalBlocks.map((b, i) => (
          <View key={b.label} style={{
            flexDirection: 'row', gap: 14,
            paddingVertical: 12,
            borderBottomWidth: i < relationalBlocks.length - 1 ? 0.5 : 0,
            borderBottomColor: 'rgba(13,13,14,0.1)',
          }}>
            <View style={{ width: 2, flexShrink: 0, backgroundColor: b.color, borderRadius: 1, height: 44 }} />
            <View style={{ flex: 1, gap: 3 }}>
              <Text style={[BASE.label, { color: b.color }]}>{b.label} · {b.system}</Text>
              <Text style={BASE.body}>{b.text}</Text>
            </View>
          </View>
        ))}

        <View style={[BASE.block, { backgroundColor: '#F0EEE9', marginTop: 12 }]}>
          <Text style={BASE.italic}>
            The most useful relational insight from the T3D system: your Vehicle tells you how to make decisions about relationships, your Moon tells you what you need inside them, and your Sun tells you where you tend to project or over-adapt. These are patterns — not verdicts about what\'s possible.
          </Text>
        </View>
      </View>
      <View style={BASE.footer}><Text style={BASE.footerT}>The Sovereign Report</Text><Text style={BASE.pageNum}>37</Text></View>
    </Page>
  );
}

// ─── PAGE 38 ─────────────────────────────────────────────────────────────────
interface P38Props { data: Pick<ReportData, 'hdType' | 'hdAuthority' | 'lifePath' | 'personalYear'>; }

export function Page38Recalibration({ data }: P38Props) {
  return (
    <Page size="LETTER" style={BASE.page}>
      <TechnicalLines />

      <View style={BASE.triBar}><View style={BASE.barA} /><View style={BASE.barE} /><View style={BASE.barC} /></View>
      <View style={BASE.content}>
        <Text style={BASE.tag}>Section 6 — The Sovereign Operating System</Text>
        <Text style={BASE.heading}>Your Recalibration Sequence</Text>
        <Text style={BASE.sub}>
          What to do when you are frustrated, stuck, depleted, or confused. A practical protocol — not a diagnosis.
        </Text>
        <View style={BASE.rule} />

        {RECALIBRATION.map((r, i) => (
          <View key={r.state} style={{
            paddingVertical: 12, flexDirection: 'row', gap: 12,
            borderBottomWidth: i < RECALIBRATION.length - 1 ? 0.5 : 0,
            borderBottomColor: 'rgba(13,13,14,0.1)',
          }}>
            {/* State badge */}
            <View style={{ width: 52, flexShrink: 0, alignItems: 'center', gap: 4, paddingTop: 2 }}>
              <View style={{ width: 44, height: 24, backgroundColor: r.color, justifyContent: 'center', alignItems: 'center', opacity: r.state === 'CONFUSED' ? 0.35 : 1 }}>
                <Text style={{ fontFamily: F.sans, fontSize: 5.5, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: C.parchment }}>
                  {r.state}
                </Text>
              </View>
              <Text style={[BASE.label, { color: r.color, fontSize: 5.5, textAlign: 'center', letterSpacing: 1, opacity: 0.75 }]}>
                {r.check.split(' ')[1]}
              </Text>
            </View>

            {/* Content */}
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={[BASE.label, { color: r.color }]}>{r.check}</Text>
              <Text style={BASE.body}>{r.signal}</Text>
              <Text style={[BASE.body, { fontStyle: 'italic', opacity: 0.7 }]}>{r.protocol}</Text>
              <View style={{ padding: '6 10', backgroundColor: '#F5F3EE', marginTop: 2 }}>
                <Text style={{ fontFamily: F.display, fontSize: 10.5, fontWeight: 400, fontStyle: 'italic', color: C.base, lineHeight: 1.4, opacity: 0.8 }}>
                  "{r.question}"
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>
      <View style={BASE.footer}><Text style={BASE.footerT}>The Sovereign Report</Text><Text style={BASE.pageNum}>38</Text></View>
    </Page>
  );
}

// ─── PAGE 39 ─────────────────────────────────────────────────────────────────
interface P39Props { data: Pick<ReportData, 'hdType' | 'hdAuthority' | 'lifePath' | 'personalYear' | 'sunSign' | 'firstName'>; }

const SEVEN_DAYS = [
  { num: '01', focus: 'Vehicle',     color: C.amber,   title: 'Authority Only', instruction: 'Make one real decision today using only your Authority mechanism. Before acting, return to your correct process. Notice what the Authority says before your reasoning begins. Log one word for what it produced.' },
  { num: '02', focus: 'Road',        color: C.emerald, title: 'Pattern Check',  instruction: 'Identify one thing you\'re currently doing that feels aligned with your Life Path — and one that doesn\'t. Name both without fixing either. Notice the difference in how they sit in your body.' },
  { num: '03', focus: 'Stoplight',   color: C.crimson, title: 'Conditions',     instruction: 'Before one significant action, check conditions: what season am I in? What is the emotional weather around this? What does the environment signal? Act only when you\'ve heard all three.' },
  { num: '04', focus: 'Synthesis',   color: C.parchmentDim, title: 'Full Sequence', instruction: 'Use the decision tree on page 35 on one real pending choice. Vehicle first. Road second. Stoplight third. Note where they aligned and where they created tension — and what you did with it.' },
  { num: '05', focus: 'Recalibration', color: C.parchmentDim, title: 'Protocol Practice', instruction: 'At some point today you\'ll feel frustrated, stuck, depleted, or confused. When it arrives, use the sequence on page 38. Notice which state it was, which instrument it returned you to, and what shifted.' },
  { num: '06', focus: 'Creation',    color: C.amber,   title: 'Creative Compass', instruction: 'Apply your creative compass (page 36) to one task or project today. Is your cadence right? Is the work the right kind? Is the environment supporting or depleting? Adjust one thing and observe the result.' },
  { num: '07', focus: 'Integration', color: C.emerald, title: 'Reflection',     instruction: 'Look back at six days. Which instrument gave you the most useful information? Where did you use the sequence correctly? Where did you default to something else? What do you want to carry forward?' },
];

export function Page39SevenDay({ data }: P39Props) {
  return (
    <Page size="LETTER" style={BASE.page}>
      <TechnicalLines />

      <View style={BASE.triBar}><View style={BASE.barA} /><View style={BASE.barE} /><View style={BASE.barC} /></View>
      <View style={BASE.content}>
        <Text style={BASE.tag}>Section 6 — The Sovereign Operating System</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <Text style={{ fontFamily: F.sans, fontSize: 10.5, fontWeight: 400, color: C.parchmentFaint }}>Integrated</Text>
          <Text style={{ fontFamily: F.sans, fontSize: 10.5, opacity: 0.3, color: C.parchmentFaint }}>·</Text>
          <Text style={{ fontFamily: F.display, fontSize: 20, fontWeight: 400, color: C.base, lineHeight: 1.15 }}>Your 7-Day Sovereignty Experiment</Text>
        </View>
        <Text style={BASE.sub}>
          One experiment, seven days, three instruments. Each day foregrounds one dimension — then integrates.
        </Text>
        <View style={BASE.rule} />

        {/* 7-day grid */}
        <View style={{ flexDirection: 'column', gap: 0 }}>
          {SEVEN_DAYS.map((day, i) => (
            <View key={day.num} style={{
              flexDirection: 'row', gap: 10,
              paddingVertical: 9,
              borderBottomWidth: i < SEVEN_DAYS.length - 1 ? 0.5 : 0,
              borderBottomColor: 'rgba(13,13,14,0.08)',
            }}>
              {/* Day badge */}
              <View style={{ width: 28, height: 28, borderWidth: 0.5, borderColor: day.color, borderStyle: 'solid', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>
                <Text style={{ fontFamily: F.sans, fontSize: 7, fontWeight: 500, color: day.color }}>{day.num}</Text>
              </View>
              {/* Content */}
              <View style={{ flex: 1, gap: 2 }}>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
                  <Text style={[BASE.label, { color: day.color }]}>{day.title}</Text>
                  <Text style={{ fontFamily: F.sans, fontSize: 6, letterSpacing: 1, color: C.parchmentFaint, textTransform: 'uppercase' }}>{day.focus}</Text>
                </View>
                <Text style={{ fontFamily: F.sans, fontSize: 8.5, fontWeight: 300, color: C.base, lineHeight: 1.55, opacity: 0.82 }}>{day.instruction}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Tri-color footer band */}
      <View style={{ flexDirection: 'row' }}>
        <View style={{ flex: 1, backgroundColor: C.amber, paddingVertical: 12, paddingHorizontal: 16, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontFamily: F.sans, fontSize: 8, fontWeight: 500, letterSpacing: 1.5, textTransform: 'uppercase', color: C.base, opacity: 0.7 }}>Vehicle</Text>
        </View>
        <View style={{ flex: 1, backgroundColor: C.emerald, paddingVertical: 12, paddingHorizontal: 16, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontFamily: F.sans, fontSize: 8, fontWeight: 500, letterSpacing: 1.5, textTransform: 'uppercase', color: C.parchment, opacity: 0.8 }}>Section VI Complete</Text>
        </View>
        <View style={{ flex: 1, backgroundColor: C.crimson, paddingVertical: 12, paddingHorizontal: 16, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontFamily: F.sans, fontSize: 8, fontWeight: 500, letterSpacing: 1.5, textTransform: 'uppercase', color: C.parchment, opacity: 0.7 }}>Stoplight</Text>
        </View>
      </View>
      <View style={{ paddingHorizontal: PAGE.marginH, paddingBottom: 10, paddingTop: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={BASE.footerT}>The Sovereign Report</Text>
        <Text style={BASE.pageNum}>39</Text>
      </View>
    </Page>
  );
}
