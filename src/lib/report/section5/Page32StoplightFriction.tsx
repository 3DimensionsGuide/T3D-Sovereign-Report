/**
 * Page 32 — Stoplight Friction & Recalibration
 *
 * Reader question: "What happens when I confuse mood, context,
 * or identity for instruction?"
 *
 * Central message: Neither a transit, a mood, a sign label, nor a compelling
 * interpretation is an instruction to act.
 *
 * Structure:
 *   1. Central principle (full-width, Playfair italic)
 *   2. Personalized friction pattern (from Moon sign — primary emotional weather)
 *   3. PAUSE / LOCATE / RETURN reset sequence (three horizontal panels)
 *   4. One regulating practice (from Moon sign)
 */

import React from 'react';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { C, F, PAGE } from '../tokens';
import { TechnicalLines } from '../shared/PageComponents';
import type { ReportData } from '../tokens';

// ─── Content maps — Moon sign driven ─────────────────────────────────────────

interface FrictionContent {
  frictionPattern: string;   // 60–80 words: what the friction looks like
  pauseNote:       string;   // what's loud right now
  locateNote:      string;   // which lens, which placement
  practice:        string;   // one small regulating practice
}

const MOON_FRICTION: Record<string, FrictionContent> = {
  Aries: {
    frictionPattern:
      'The Aries Moon produces urgency that feels indistinguishable from signal. When a fast emotional response arrives — heat, enthusiasm, frustration — it can present itself as the Sacral\'s yes. The friction is acting from that heat before checking whether it is genuine readiness or simply the first feeling available. Urgency is a condition this Moon creates reliably. It is not the same as confirmed direction.',
    pauseNote:
      'The urgency. The heat of immediate response. The sense that something needs to happen now — notice that you are feeling it before you decide it is instruction.',
    locateNote:
      'Your Moon is in Aries (Tropical). Urgency and heat are conditions this placement reliably produces. Name it: "I am feeling Aries urgency right now." That naming creates the distance between the condition and the choice.',
    practice:
      'The Three-Second Check: When urgency arrives, pause three seconds before speaking or committing. In those three seconds, ask your Sacral a yes/no question. Notice what moves in your body — not what you think about what moved.',
  },
  Taurus: {
    frictionPattern:
      'The Taurus Moon produces resistance that can feel like discernment. When something disrupts what you\'ve built — a relationship, a structure, a routine — the discomfort reads as the system saying no. The friction is treating the Taurus Moon\'s stability instinct as a navigational decision, when it may simply be the friction of genuine change arriving at an inconvenient time.',
    pauseNote:
      'The resistance. The discomfort of disruption to what you\'ve built. Notice the pull to hold position before naming it as signal.',
    locateNote:
      'Your Moon is in Taurus (Tropical). Resistance to disruption is a condition this placement reliably produces. Name it: "I am feeling Taurus resistance." That naming creates space between the discomfort and the response.',
    practice:
      'The Disruption Question: When resistance arrives, ask one question before deciding: Is this a genuine no from my Authority — or is this the friction of something real changing? That question usually reveals itself within a few minutes of honest attention.',
  },
  Gemini: {
    frictionPattern:
      'The Gemini Moon processes emotion through thought — which means the thinking loop can become the decision. When feeling runs high, the mental activity that follows can look like clarity: ideas generating, connections forming, conclusions arriving. The friction is mistaking the conclusion of that loop for Authority-confirmed direction, when the loop was emotional processing dressed as reasoning.',
    pauseNote:
      'The mental loop. The analysis circling. The thought that has been running for the past hour. Notice it is running before you treat the conclusion as signal.',
    locateNote:
      'Your Moon is in Gemini (Tropical). The processing loop is a condition this placement reliably produces when feeling runs high. Name it: "I am in Gemini processing mode." That naming creates space.',
    practice:
      'The Articulation Pause: When the loop starts, write the feeling in one sentence. Not the thoughts about the feeling — the feeling itself. "I feel..." not "I think that..." That one sentence often ends the loop.',
  },
  Cancer: {
    frictionPattern:
      'The Cancer Moon reads emotional safety constantly. When something feels unsafe — even slightly — the protective response arrives quickly, and it can feel like a clear navigational signal. The friction is treating the Cancer Moon\'s protective instinct as Authority, when the instinct is responding to a condition and the condition may be temporary, partial, or absorbed from someone else entirely.',
    pauseNote:
      'The protective feeling. The sense that something needs to be secured or someone needs to be held. Notice whether that instinct is responding to present reality or to pattern.',
    locateNote:
      'Your Moon is in Cancer (Tropical). Protective urgency is a condition this placement produces reliably when safety feels uncertain. Name it: "I am feeling Cancer protection." That naming creates perspective.',
    practice:
      'The Belonging Check: When the protective impulse arrives, ask: Am I protecting something real and present — or something that has already changed? Thirty seconds of honest attention usually clarifies which situation you are in.',
  },
  Leo: {
    frictionPattern:
      'The Leo Moon tracks recognition. When it has been absent for a period, the resulting wound can feel like directional signal — a sense that something is fundamentally wrong with the current situation that needs addressing. The friction is acting from recognition deficit and calling it discernment. The Moon\'s need is real. It is not the same as a decision that has been confirmed.',
    pauseNote:
      'The wound. The sense of not being seen or recognized for what you\'ve offered. Notice it has arrived before you decide what it is instructing you to do.',
    locateNote:
      'Your Moon is in Leo (Tropical). Recognition need running loudly is a condition this placement produces when visibility has been absent. Name it: "I am feeling Leo recognition hunger." That naming creates choice.',
    practice:
      'The Recognition Inventory: When this feeling is loud, ask: Is this about this situation specifically — or am I carrying a recognition deficit that has accumulated over time? That question separates present signal from accumulated need.',
  },
  Virgo: {
    frictionPattern:
      'The Virgo Moon evaluates constantly — which means the list of what is not yet right can feel like a map for action. The friction is acting from the analytical loop: identifying what needs fixing, then treating that identification as a directive. What the Virgo Moon produces is awareness of refinement available, not a confirmed instruction to act on all of it simultaneously.',
    pauseNote:
      'The list of what is wrong. The itemized awareness of what isn\'t functioning correctly. Notice the list before you treat it as a to-do.',
    locateNote:
      'Your Moon is in Virgo (Tropical). The analytical evaluation loop is a condition this placement reliably produces when something feels wrong. Name it: "I am in Virgo refinement mode." That naming creates space.',
    practice:
      'The Good-Enough Test: When the refinement loop runs, ask: Is this not good enough — or am I using improvement as a way to not release something? One honest answer usually tells the difference.',
  },
  Libra: {
    frictionPattern:
      'The Libra Moon reads the relational field continuously. When something is imbalanced in that field, the impulse to restore harmony arrives quickly — and it can feel like a clear instruction. The friction is treating the Libra Moon\'s relational weather sensitivity as a decision directive. The sensing is accurate. Whether it falls to you to act on it is a separate question.',
    pauseNote:
      'The relational tension. The sense of something out of proportion in the field around you. Notice the tension before naming it as your obligation to fix.',
    locateNote:
      'Your Moon is in Libra (Tropical). Relational weather sensitivity is a condition this placement reliably produces when the field is imbalanced. Name it: "I am feeling Libra relational dissonance." That naming creates distance.',
    practice:
      'The Ownership Question: When relational dissonance is present, ask: Is this my dissonance to address right now — or am I feeling something from the field that belongs to someone else? The distinction determines whether action is appropriate.',
  },
  Scorpio: {
    frictionPattern:
      'The Scorpio Moon reads beneath the surface of situations, and what it detects can arrive with such certainty that it functions as instruction before being examined. The friction is treating the depth signal as confirmed truth rather than as an opening for investigation. What the Scorpio Moon senses is often accurate. Whether the timing is now, and whether the action called for is immediate, is a different question.',
    pauseNote:
      'The depth signal. The something-is-wrong sensation that arrived before you could explain it. Notice that it has fired before you decide what it is telling you to do.',
    locateNote:
      'Your Moon is in Scorpio (Tropical). Depth-signal intensity is a condition this placement produces reliably when something beneath the surface has been detected. Name it: "I am in Scorpio depth-reading mode." That naming creates choice.',
    practice:
      'The Timing Check: When the depth signal fires, ask: Is this about something happening now — or am I reading a pattern from the past? The Scorpio Moon reads both with equal conviction. They feel identical until you ask.',
  },
  Sagittarius: {
    frictionPattern:
      'The Sagittarius Moon produces restlessness when meaning is absent or stagnation arrives. That restlessness can feel like a directional signal — the system asking to move. The friction is treating the Sagittarius Moon\'s appetite for expansion as confirmed instruction, when the restlessness is a condition produced by the placement and may be pointing at an emotional need rather than an external move.',
    pauseNote:
      'The restlessness. The urge to move, to find something larger, to not be where you currently are. Notice it has arrived before you treat it as direction.',
    locateNote:
      'Your Moon is in Sagittarius (Tropical). Meaning-seeking restlessness is a condition this placement reliably produces when stagnation arrives. Name it: "I am feeling Sagittarius restlessness." That naming creates space.',
    practice:
      'The Direction Test: When restlessness arrives, ask: Am I moving toward something real — or away from something I haven\'t yet faced? Genuine forward movement feels like opening. Avoidance feels like escape.',
  },
  Capricorn: {
    frictionPattern:
      'The Capricorn Moon seeks stability through competence and structure. When something feels uncertain, the impulse to manage it arrives quickly — and it can feel like clear-sighted leadership. The friction is acting from control need and calling it decisive. The Capricorn Moon\'s response to instability is consistent and strong. It is not the same as the Authority\'s confirmed yes.',
    pauseNote:
      'The control impulse. The need to get things structured before the instability compounds. Notice it has arrived before you decide whether action is actually what\'s being asked for.',
    locateNote:
      'Your Moon is in Capricorn (Tropical). Control impulse under uncertainty is a condition this placement reliably produces when stability feels threatened. Name it: "I am feeling Capricorn control pressure." That naming creates distance.',
    practice:
      'The Control Question: When the management impulse arrives, ask: Am I doing this because it genuinely needs doing — or because uncertainty is uncomfortable? That question usually reveals whether the action is useful or self-regulating.',
  },
  Aquarius: {
    frictionPattern:
      'The Aquarius Moon pulls back when emotion runs high, which can feel like perspective. The detachment that arrives in emotionally charged situations can present itself as neutral, clear-eyed assessment. The friction is treating emotional distancing as discernment. What the Aquarius Moon produces is a quality of watching from a remove — useful as observation, not the same as Authority-confirmed clarity.',
    pauseNote:
      'The detachment. The quality of watching from a distance that feels like neutrality. Notice the pulling-back before you name it as clarity.',
    locateNote:
      'Your Moon is in Aquarius (Tropical). Emotional distancing is a condition this placement reliably produces when the emotional field runs high. Name it: "I am in Aquarius detachment mode." That naming creates choice.',
    practice:
      'The Return Check: When detachment kicks in, ask: Am I getting perspective — or am I leaving? The difference is whether you intend to return to full presence. Name which one is happening before you act on the conclusion.',
  },
  Pisces: {
    frictionPattern:
      'The Pisces Moon absorbs the emotional field of every environment. The friction is treating absorbed feeling as personal signal — acting on what you\'re carrying without first checking whether it originated inside you or arrived from someone else\'s field. What the Pisces Moon produces is an exquisitely calibrated emotional receiver. The receiver does not always know where the signal originated.',
    pauseNote:
      'The feeling itself — whatever it is. Notice it arrived before you determine whether it originated inside you or was absorbed from the environment you have been in.',
    locateNote:
      'Your Moon is in Pisces (Tropical). Environmental absorption is a condition this placement reliably produces in any emotionally charged space. Name it: "I may be carrying someone else\'s weather right now." That naming creates space.',
    practice:
      'The Origin Check: Before acting on a strong feeling, briefly leave the current environment — physically, if possible — and notice whether the feeling shifts. Absorbed feelings typically reduce in intensity when the source is removed. Genuine internal signal tends to remain.',
  },
};

// Authority-specific RETURN note
const RETURN_BY_AUTHORITY: Record<string, string> = {
  Sacral:
    'Ask your Sacral a yes/no question — not the reasoning, the body. The Sacral yes is lift, warmth, or pull. The Sacral no is flatness or contraction. That signal exists beneath the emotional weather. Trust what moves, not what you think about what moves.',
  Emotional:
    'Wait. Not because you lack information — because your Emotional Authority\'s clarity comes over time, not in the heat of the wave. The wave will move. The decision can wait until it does. This is not avoidance. This is the mechanism working correctly.',
  Splenic:
    'Go back to the first moment — before the Moon\'s condition arrived and before the interpretation began. The Splenic signal was there before the feeling that followed. That first impression is what you are returning to.',
  'Self-Projected':
    'Speak the decision aloud to someone who will not give advice. The clarity comes from hearing yourself, not from analyzing the feeling. The Moon\'s condition is the starting point, not the signal.',
  Ego:
    'Ask honestly — not what seems like the right decision, but what you actually want. The Ego Authority is about genuine desire, not strategic positioning. Set the emotional weather aside long enough to answer honestly.',
  None:
    'Remove yourself from the current environment briefly. Your configuration is deeply responsive to conditions — the Moon\'s weather amplifies this. A short break from the current field often changes what seems certain.',
  Lunar:
    'Wait for the full lunar cycle. The Lunar Authority is the most susceptible to Moon-driven conditions, which means patience here is not optional. The current feeling will shift. Let it complete before deciding.',
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  page:   { backgroundColor: '#F5F5F3', padding: 0, fontFamily: F.sans },
  triBar: { flexDirection: 'row', width: PAGE.width },
  barA:   { flex: 1, height: 1.5, backgroundColor: C.amber },
  barE:   { flex: 1, height: 1.5, backgroundColor: C.emerald },
  barC:   { flex: 1, height: 1.5, backgroundColor: C.crimson },

  content: {
    flex: 1, paddingHorizontal: PAGE.marginH,
    paddingTop: 36, paddingBottom: PAGE.marginV,
  },
  eyebrow: {
    fontFamily: F.sans, fontSize: 7, fontWeight: 500,
    letterSpacing: 2.5, color: C.parchmentFaint,
    textTransform: 'uppercase', marginBottom: 6,
  },
  heading: {
    fontFamily: F.display, fontSize: 20, fontWeight: 400,
    color: C.base, lineHeight: 1.1, marginBottom: 4,
  },
  sub: {
    fontFamily: F.sans, fontSize: 9, fontWeight: 300,
    color: C.parchmentFaint, lineHeight: 1.5, marginBottom: 14, maxWidth: 440,
  },
  pageRule: {
    width: PAGE.contentWidth, height: 0.5,
    backgroundColor: C.base, opacity: 0.1, marginBottom: 14,
  },

  // ── Central principle ─────────────────────────────────────────────────────
  principle: {
    fontFamily: F.display, fontSize: 12, fontWeight: 400,
    fontStyle: 'italic', color: C.base, lineHeight: 1.6,
    opacity: 0.82, marginBottom: 14, maxWidth: PAGE.contentWidth,
  },
  principleRule: {
    height: 0.5, backgroundColor: C.base, opacity: 0.1, marginBottom: 14,
  },

  // ── Friction pattern block ────────────────────────────────────────────────
  frictionLabel: {
    fontFamily: F.sans, fontSize: 6.5, fontWeight: 500,
    letterSpacing: 2, textTransform: 'uppercase',
    color: C.parchmentFaint, marginBottom: 6,
  },
  frictionText: {
    fontFamily: F.sans, fontSize: 10.5, fontWeight: 300,
    color: C.base, lineHeight: 1.65, opacity: 0.88,
    marginBottom: 16, maxWidth: PAGE.contentWidth,
  },

  // ── PAUSE / LOCATE / RETURN steps ────────────────────────────────────────
  stepsLabel: {
    fontFamily: F.sans, fontSize: 6.5, fontWeight: 500,
    letterSpacing: 2, textTransform: 'uppercase',
    color: C.parchmentFaint, marginBottom: 8,
  },
  stepsRow: {
    flexDirection: 'row', gap: 12, marginBottom: 14,
  },
  step: {
    flex: 1, padding: 11, gap: 4,
    borderTopWidth: 2, borderTopStyle: 'solid',
    backgroundColor: 'rgba(13,13,14,0.025)',
  },
  stepNum: {
    fontFamily: F.sans, fontSize: 6.5, fontWeight: 400,
    color: C.parchmentFaint, letterSpacing: 1, marginBottom: 2,
  },
  stepLabel: {
    fontFamily: F.sans, fontSize: 9, fontWeight: 700,
    letterSpacing: 2.5, textTransform: 'uppercase', marginBottom: 5,
  },
  stepQuestion: {
    fontFamily: F.display, fontSize: 8.5, fontWeight: 400,
    fontStyle: 'italic', color: C.base, lineHeight: 1.5,
    marginBottom: 5, opacity: 0.7,
  },
  stepNote: {
    fontFamily: F.sans, fontSize: 8, fontWeight: 300,
    color: C.base, lineHeight: 1.55, opacity: 0.82,
  },

  // ── Regulating practice ───────────────────────────────────────────────────
  practiceBlock: {
    padding: 12, gap: 5,
    borderWidth: 0.5, borderColor: 'rgba(13,13,14,0.12)',
  },
  practiceLabel: {
    fontFamily: F.sans, fontSize: 6.5, fontWeight: 500,
    letterSpacing: 2, textTransform: 'uppercase',
    color: C.parchmentFaint,
  },
  practiceText: {
    fontFamily: F.sans, fontSize: 9.5, fontWeight: 300,
    color: C.base, lineHeight: 1.6, opacity: 0.85,
  },

  footer: {
    paddingHorizontal: PAGE.marginH, paddingBottom: 22,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  footerText: {
    fontFamily: F.sans, fontSize: 7, letterSpacing: 1.2,
    color: C.parchmentFaint, textTransform: 'uppercase',
  },
  pageNum: { fontFamily: F.sans, fontSize: 7, color: C.parchmentFaint },
});

// ─── Page component ───────────────────────────────────────────────────────────

interface Props { data: ReportData; }

export default function Page32StoplightFriction({ data }: Props) {
  const fc = MOON_FRICTION[data.moonSign] ?? MOON_FRICTION['Aries']!;
  const returnNote = RETURN_BY_AUTHORITY[data.hdAuthority]
    ?? RETURN_BY_AUTHORITY['Sacral']!;

  const steps = [
    {
      label:    'PAUSE',
      color:    C.crimson,
      question: '"What feeling, environment, or identity story is loud right now?"',
      note:     fc.pauseNote,
    },
    {
      label:    'LOCATE',
      color:    '#6D7797',
      question: '"Which Stoplight lens helps me name the context without becoming it?"',
      note:     fc.locateNote,
    },
    {
      label:    'RETURN',
      color:    C.amber,
      question: '"What does my Vehicle / Authority actually need before I respond?"',
      note:     returnNote,
    },
  ];

  return (
    <Page size="LETTER" style={S.page}>
      <TechnicalLines />
      <View style={S.triBar}>
        <View style={S.barA} /><View style={S.barE} /><View style={S.barC} />
      </View>

      <View style={S.content}>
        <Text style={S.eyebrow}>Stoplight · Friction & Recalibration</Text>
        <Text style={S.heading}>Stoplight Friction & Recalibration</Text>
        <Text style={S.sub}>
          What happens when I confuse mood, context, or identity for instruction?
        </Text>
        <View style={S.pageRule} />

        {/* Central principle */}
        <Text style={S.principle}>
          Neither a transit, a mood, a sign label, nor a compelling interpretation is an instruction to act.
          The Stoplight helps you notice conditions. Your Vehicle answers what to do with them.
        </Text>
        <View style={S.principleRule} />

        {/* Personalized friction pattern */}
        <Text style={S.frictionLabel}>
          Your Pattern · {data.moonSign} Moon · Tropical Reference
        </Text>
        <Text style={S.frictionText}>{fc.frictionPattern}</Text>

        {/* PAUSE / LOCATE / RETURN */}
        <Text style={S.stepsLabel}>Reset Sequence — Run In Order</Text>
        <View style={S.stepsRow}>
          {steps.map((step, i) => (
            <View key={step.label} style={[S.step, { borderTopColor: step.color }]}>
              <Text style={S.stepNum}>{i + 1} of 3</Text>
              <Text style={[S.stepLabel, { color: step.color }]}>{step.label}</Text>
              <Text style={S.stepQuestion}>{step.question}</Text>
              <Text style={S.stepNote}>{step.note}</Text>
            </View>
          ))}
        </View>

        {/* Regulating practice */}
        <View style={S.practiceBlock}>
          <Text style={S.practiceLabel}>
            Regulating Practice · {data.moonSign} Moon
          </Text>
          <Text style={S.practiceText}>{fc.practice}</Text>
        </View>
      </View>

      <View style={S.footer}>
        <Text style={S.footerText}>The Sovereign Report</Text>
        <Text style={S.pageNum}>32</Text>
      </View>
    </Page>
  );
}
