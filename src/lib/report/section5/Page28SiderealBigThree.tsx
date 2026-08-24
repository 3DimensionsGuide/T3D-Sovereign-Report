/**
 * Page 28 — Your Sidereal Big Three
 *
 * Reader question: "What Does This Stellar-Reference Lens Invite Me To See?"
 *
 * Mirrors Page 27 so the reader immediately understands the two pages form
 * a paired set. Identical three-column structure, same role labels.
 *
 * Differentiators from Page 27:
 *   — Eyebrow: STOPLIGHT / SIDEREAL / STELLAR REFERENCE
 *   — System tag: SIDEREAL (Star Slate border, not crimson)
 *   — Panel top: dotted Star Slate line (not solid crimson)
 *   — Sign name color: Star Slate #6D7797
 *   — All 36 interpretations independently written for the sidereal lens
 *
 * The sidereal readings are not corrections of Page 27.
 * They are a distinct angle of reflection on the same person.
 */

import React from 'react';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { C, F, PAGE } from '../tokens';
import { TechnicalLines } from '../shared/PageComponents';
import type { ReportData } from '../tokens';

const STAR_SLATE = '#6D7797';

// ─── Content maps — independently written for sidereal lens ──────────────────

interface SignContent {
  plain:     string;   // 55–70 words
  recognize: string;   // 20–30 words
  question:  string;   // one concise field question
}

const SID_SUN: Record<string, SignContent> = {
  Aries: {
    plain:     'Through the stellar-reference lens, your Sun is in Aries — the sign of primary impulse and direct self-origination. This angle reveals a solar identity oriented toward beginning: generating first movement where others wait for permission. The sidereal lens asks a specific question of your Aries solar quality: Is the initiation coming from genuine readiness, or from pressure to move before something is actually called for? The distinction is subtle but significant.',
    recognize: 'There are times when your urgency feels like signal — and times when, in retrospect, it was pressure. Noticing the difference is the practice this lens asks for.',
    question:  'Where is the speed of your initiation actually informed — and where is it a way of getting ahead of something you have not yet looked at?',
  },
  Taurus: {
    plain:     'Through the stellar-reference lens, your Sun is in Taurus — the sign of embodied substance and long-term persistence. This angle reveals a solar quality oriented toward consolidation: gathering, holding, and deepening rather than expanding. The sidereal Taurus Sun asks what you are actually building — not as a project, but as a permanent orientation. Where the seasonal lens describes your pace, this lens asks what you are genuinely committed to sustaining.',
    recognize: 'You are more aware of what you are actually sustaining — in energy, attention, and time — than you typically make visible to others.',
    question:  'What are you sustaining that deserves to be sustained — and what have you been maintaining past the point when maintenance became its own form of avoidance?',
  },
  Gemini: {
    plain:     'Through the stellar-reference lens, your Sun is in Gemini — the sign of synthesis and perceptual agility. This angle reveals a solar quality oriented toward the thread between things others experience as separate. The sidereal Gemini Sun asks where your curiosity is in service of real understanding, as distinct from the pleasure of movement itself. There is a difference between linking ideas and following them — and this lens is asking which you are doing.',
    recognize: 'There is a quality of understanding available when you follow one thread deeply that is different in kind from what arrives through synthesis across many.',
    question:  'Which understanding would deepen if you stayed with it rather than moved through it?',
  },
  Cancer: {
    plain:     'Through the stellar-reference lens, your Sun is in Cancer — the sign of belonging, memory, and the long resonance of early formation. This angle reveals a solar quality that reads the room through feeling before it reads it through thought. The sidereal Cancer Sun asks what you are actually protecting, and whether what you are protecting is still what needs protecting. Care is a resource; the question is whether it is being used accurately.',
    recognize: 'The protection that once kept something important intact may now be the thing preventing something important from entering. Noticing which is which is the work.',
    question:  'What are you protecting that has already changed — and what does it cost you to keep protecting it?',
  },
  Leo: {
    plain:     'Through the stellar-reference lens, your Sun is in Leo — the sign of solar expression and the generous extension of presence. This angle reveals a solar quality oriented toward being genuinely seen rather than merely noticed. The sidereal Leo Sun asks whether the version of yourself you are currently expressing is the one that is actually yours, or the one that has learned to produce the response that recognition requires.',
    recognize: 'The version of yourself that gets the best response and the version that is most genuinely true are not always the same. The gap between them is worth examining.',
    question:  'Where is the version of you that gets the best response the same as the version that is most genuinely true?',
  },
  Virgo: {
    plain:     'Through the stellar-reference lens, your Sun is in Virgo — the sign of discernment, refinement, and integrity through precision. This angle reveals a solar quality oriented toward what genuinely works rather than what merely looks good. The sidereal Virgo Sun asks what you are most rigorously here to refine — not as a project of improvement, but as an act of care toward the people and work you have chosen to take seriously.',
    recognize: 'The refinement you are capable of is a form of devotion. The question is whether it is being offered to what is genuinely worth the care.',
    question:  'What is worth the quality of care and precision you are capable of — and are you currently giving it that?',
  },
  Libra: {
    plain:     'Through the stellar-reference lens, your Sun is in Libra — the sign of proportion, relationship, and the intelligence of beauty. This angle reveals a solar quality oriented toward what is genuinely fair rather than what is merely harmonious. The sidereal Libra Sun asks where you are holding the tension of competing considerations — not to resolve it prematurely, but to let it produce the understanding that comes only from sitting with real complexity.',
    recognize: 'You carry more of the relational complexity of your environment than others know. The question is whether that carrying is your choice or your default.',
    question:  'What position are you holding privately that deserves to be in the room?',
  },
  Scorpio: {
    plain:     'Through the stellar-reference lens, your Sun is in Scorpio — the sign of sustained depth and the capacity to remain present with what others withdraw from. This angle reveals a solar quality oriented toward what is actually true beneath the surface of appearances. The sidereal Scorpio Sun asks where you are applying that depth — and whether the intensity that makes you reliable in difficult moments is being offered or withheld.',
    recognize: 'You know things before you can say how you know them. The question is whether that knowledge is being used or held at a distance to avoid what it requires.',
    question:  'What do you know that you are not yet using?',
  },
  Sagittarius: {
    plain:     'Through the stellar-reference lens, your Sun is in Sagittarius — the sign of orientation toward meaning and the capacity to see the larger structure behind individual events. This angle reveals a solar quality searching for a principle, not just a direction. The sidereal Sagittarius Sun asks what you actually believe — not as philosophy, but as lived practice. What does the movement of your life reveal about what you think is true?',
    recognize: 'There are moments when meaning-making arrives before understanding does — when the story forms before the experience has been fully felt. This lens asks you to notice that.',
    question:  'Where is the larger meaning you carry serving genuine orientation — and where is it substituting for being fully present to what is?',
  },
  Capricorn: {
    plain:     'Through the stellar-reference lens, your Sun is in Capricorn — the sign of earned authority and the long relationship between discipline and integrity. This angle reveals a solar quality that takes time seriously — both as a resource and as the medium in which real things are built. The sidereal Capricorn Sun asks whether the structure you are currently maintaining is in service of something genuinely worth sustaining, or has become the point in itself.',
    recognize: 'The structure you are maintaining may be exactly what is needed — or it may have become the point in itself. The distinction is worth investigating from inside it.',
    question:  'What are you building that is worth the structure you are giving it?',
  },
  Aquarius: {
    plain:     'Through the stellar-reference lens, your Sun is in Aquarius — the sign of collective intelligence and the relationship between the individual and the systems that contain them. This angle reveals a solar quality oriented toward what could be rather than what currently is. The sidereal Aquarius Sun asks whether the independence you protect is in service of something larger than itself — or has become a form of self-isolation dressed as principle.',
    recognize: 'The principle you are protecting is real. The question is whether protecting it has become more important than the contact it was originally in service of.',
    question:  'What does the principle you are protecting want to serve — and is it still serving it?',
  },
  Pisces: {
    plain:     'Through the stellar-reference lens, your Sun is in Pisces — the sign of permeability and the dissolution of self-as-separate. This angle reveals a solar quality oriented toward what lies deeper than the surface distinctions most people use to navigate. The sidereal Pisces Sun asks where your capacity to feel the whole is functioning as compassionate intelligence — and where it is making it difficult to maintain the boundary that allows you to remain genuinely present.',
    recognize: 'Your empathy is one of your most significant capacities and one of your most significant vulnerabilities. The stellar lens asks you to notice the difference in a given moment.',
    question:  'Where is your permeability functioning as capacity — and where has it become something you have not chosen?',
  },
};

const SID_MOON: Record<string, SignContent> = {
  Aries: {
    plain:     'Through the stellar-reference lens, your Moon is in Aries. This angle reveals an emotional quality oriented toward meeting what comes directly — without mediation or prolonged preparation. The sidereal Aries Moon asks where your emotional directness is functioning as genuine responsiveness, and where it might be foreclosing on the slower-moving emotional information that sometimes requires more than one cycle to fully surface and be understood.',
    recognize: 'Your emotional responses arrive before your analysis of them does. The sidereal lens asks what is moving through before interpretation has a chance to modify it.',
    question:  'What emotional information is arriving before you have named it — and what would you understand if you let it land before responding?',
  },
  Taurus: {
    plain:     'Through the stellar-reference lens, your Moon is in Taurus. This angle reveals an emotional quality sustained by continuity and the sensory evidence that what matters is still present. The sidereal Taurus Moon asks what you are actually nourished by — not what you prefer, but what genuinely restores you at the level of the body. It also asks what you are holding past the point where holding it is still care rather than habit.',
    recognize: 'There are things that genuinely nourish you that you rarely name — and depletions you have learned to absorb silently rather than address.',
    question:  'What genuinely nourishes you — not as preference, but as what actually restores you at the level of the body?',
  },
  Gemini: {
    plain:     'Through the stellar-reference lens, your Moon is in Gemini. This angle reveals an emotional quality that processes experience through language and exchange. The sidereal Gemini Moon asks whether the movement between emotional states — which can feel like agility — sometimes bypasses the depth that particular feelings require before they are ready to be articulated. There is a meaningful difference between emotional fluency and emotional completion.',
    recognize: 'The emotional articulation you are capable of sometimes arrives before the emotional experience it is describing has fully landed. There is value in letting both breathe.',
    question:  'What would this feeling understand about itself if you stayed with it before speaking?',
  },
  Cancer: {
    plain:     'Through the stellar-reference lens, your Moon is in Cancer. This angle reveals an emotional quality deeply formed by memory, early experience, and the felt quality of belonging. The sidereal Cancer Moon asks what you are still carrying from conditions that have long since changed — and whether the protection you built in response to past experience is now the thing preventing the belonging you most genuinely want.',
    recognize: 'What you protect is not always what needs protecting, and what needs protection is not always what you have been protecting. The distinction is where the work lives.',
    question:  'What from an earlier chapter are you still responding to — and what is actually present in front of you right now?',
  },
  Leo: {
    plain:     'Through the stellar-reference lens, your Moon is in Leo. This angle reveals an emotional quality formed, in part, by how you are received. The sidereal Leo Moon asks where the need for recognition is being honored as real — and where it might be quietly running things beneath the surface. Acknowledging what you need to feel genuinely seen is not weakness; it is the accurate reading of what your emotional system actually requires.',
    recognize: 'Recognition functions differently when it is genuinely offered versus when it is performed in exchange for something else. The stellar lens helps you notice the difference.',
    question:  'Where are you giving recognition freely and receiving it with conditions?',
  },
  Virgo: {
    plain:     'Through the stellar-reference lens, your Moon is in Virgo. This angle reveals an emotional quality steadied by order and the sense that things are functioning correctly. The sidereal Virgo Moon asks whether the drive to fix, improve, or prepare is sometimes substituting for the more direct emotional expression a situation is actually calling for. Care expressed as competence is still care — the question is whether it is landing as such.',
    recognize: 'The drive to improve is real. The question is whether it is being applied to what needs refinement or to what is simply available to be worked on.',
    question:  'What would happen if you expressed this as feeling rather than as what needs to be fixed?',
  },
  Libra: {
    plain:     'Through the stellar-reference lens, your Moon is in Libra. This angle reveals an emotional quality deeply responsive to the quality of relational atmosphere. The sidereal Libra Moon asks how much of what you are carrying emotionally has been absorbed from the field around you rather than generated from within. The capacity to feel relational imbalance before it is named is a form of perception — the question is whether it is also your obligation to fix it.',
    recognize: 'You absorb the relational field around you more than others typically realize. Noticing what belongs to you and what you have absorbed is a practice this lens invites.',
    question:  'What are you carrying emotionally that originated elsewhere — and what would it mean to set it down?',
  },
  Scorpio: {
    plain:     'Through the stellar-reference lens, your Moon is in Scorpio. This angle reveals an emotional quality oriented toward depth, truth, and the long relationship between what is felt and what is eventually understood. The sidereal Scorpio Moon asks what you are still processing from experiences earlier than you think — and whether the intensity with which you hold certain emotional material is protective or has become the thing preventing its movement.',
    recognize: 'Feelings that are held rather than moved tend to become the lens through which everything else is filtered. The stellar lens asks what is still in process.',
    question:  'What is still in process — and what would move if you let it?',
  },
  Sagittarius: {
    plain:     'Through the stellar-reference lens, your Moon is in Sagittarius. This angle reveals an emotional quality nourished by meaning and the sense that things are pointing somewhere worthwhile. The sidereal Sagittarius Moon asks where the movement that feels like optimism is running away from something not yet fully felt — and where it is genuine forward orientation. Both are available; the distinction is worth knowing before you move.',
    recognize: 'The movement toward meaning can sometimes outpace the feeling it is moving away from. The stellar lens asks what is still present underneath the direction.',
    question:  'What feeling is underneath the movement toward meaning right now?',
  },
  Capricorn: {
    plain:     'Through the stellar-reference lens, your Moon is in Capricorn. This angle reveals an emotional quality that seeks stability through demonstrated competence and self-sufficiency. The sidereal Capricorn Moon asks what it would cost you to receive care without having earned it first — and whether the self-containment that feels protective has also been keeping out the warmth you actually need. Receiving is a skill that competence can make feel unnecessary.',
    recognize: 'Self-sufficiency is a strength and a defense simultaneously. Knowing which is running on a given day is what the stellar lens is asking for.',
    question:  'What would you allow yourself to receive if you did not require yourself to deserve it first?',
  },
  Aquarius: {
    plain:     'Through the stellar-reference lens, your Moon is in Aquarius. This angle reveals an emotional quality that maintains independence as a condition of functioning. The sidereal Aquarius Moon asks what the distance you keep is protecting — and whether that protection is still necessary. There is a quality of emotional contact available that does not require the dissolution of your independence, but it does require the willingness to be affected.',
    recognize: 'The distance that feels like independence is also a distance from what you want. The stellar lens asks what would become possible if you moved one degree closer.',
    question:  'What would become available if you moved one degree closer to what you actually feel?',
  },
  Pisces: {
    plain:     'Through the stellar-reference lens, your Moon is in Pisces. This angle reveals an emotional quality that is permeable, receptive, and deeply formed by what moves through rather than what is held. The sidereal Pisces Moon asks where the empathy that is one of your most significant capacities is being given to situations and people that cannot return it — and where it is functioning as genuine mutual recognition that sustains you both.',
    recognize: 'The empathy you extend to others is real. The question is whether it is being returned in kind — or whether you are primarily the one absorbing.',
    question:  'What is yours to feel right now — and what have you absorbed that belongs to someone else?',
  },
};

const SID_RISING: Record<string, SignContent> = {
  Aries: {
    plain:     'Through the stellar-reference lens, your Rising is Aries. This angle reveals an interface quality that is immediate — others encounter your first-response mode before anything else. The sidereal Aries Rising asks whether the directness that makes you legible to others is currently deployed in service of what you actually want, or as a habitual first defense that keeps others at precisely the distance you thought you wanted.',
    recognize: 'Others experience your immediacy before they experience you. The question is whether the first response is always the accurate one, or sometimes the fastest available.',
    question:  'Where is your first response accurate — and where is it the fastest available rather than the most true?',
  },
  Taurus: {
    plain:     'Through the stellar-reference lens, your Rising is Taurus. This angle reveals an interface quality that others experience as substantive — they sense something behind what you offer. The sidereal Taurus Rising asks whether the steadiness others borrow is currently sustained by genuine inner stability, or by a refusal to let the uncertainty you carry be visible. There is a difference between groundedness and the performance of it.',
    recognize: 'Others sense stability in you before you have offered it. The question is whether that stability is something you currently possess or something you are maintaining.',
    question:  'What is the stability you offer to others currently resting on?',
  },
  Gemini: {
    plain:     'Through the stellar-reference lens, your Rising is Gemini. This angle reveals an interface quality that meets others with adaptability and ease. The sidereal Gemini Rising asks which version of yourself gets shown most consistently — and whether the agility that makes you quickly approachable is also making it difficult for others to find you in the same place twice, which affects the quality of trust that becomes possible over time.',
    recognize: 'Others locate you quickly but sometimes find you in a different place than they left you. The stellar lens asks whether this is genuine range or genuine elusiveness.',
    question:  'What would someone encounter if they found you in the same place twice?',
  },
  Cancer: {
    plain:     'Through the stellar-reference lens, your Rising is Cancer. This angle reveals an interface quality that reads the emotional field before it reads the facts. The sidereal Cancer Rising asks whether the guardedness that protects your attunement is also preventing others from experiencing the warmth that is genuinely there beneath it — and whether who gets access to that warmth is still being decided by criteria that are serving you.',
    recognize: 'Others feel received by you before they have been admitted. The question is whether the guardedness that precedes reception is still calibrated to actual conditions.',
    question:  'Who currently has access to the warmth that is genuinely there — and is that the right list?',
  },
  Leo: {
    plain:     'Through the stellar-reference lens, your Rising is Leo. This angle reveals an interface quality that others register immediately, often as authority or significance. The sidereal Leo Rising asks whether the persona that precedes you into rooms is something you have chosen and are genuinely inhabiting — or something that formed before you had the agency to design it and has been running on its own terms since then.',
    recognize: 'Others register you before you have introduced yourself. The question is whether the presence that precedes you is one you have chosen and are currently inhabiting.',
    question:  'Which version of yourself are you currently presenting — and is it the one you chose?',
  },
  Virgo: {
    plain:     'Through the stellar-reference lens, your Rising is Virgo. This angle reveals an interface quality that others experience as careful and observant. The sidereal Virgo Rising asks whether the discernment that is one of your primary gifts is landing the way you intend — and whether the quality of attention you bring to encounters is being experienced as reassuring precision or as quiet evaluation that keeps others at arm\'s length.',
    recognize: 'Others sense that you are seeing more than you are saying. The question is whether what you are withholding is serving them — or primarily protecting you.',
    question:  'What is your precision currently in service of — and is it landing the way you intend?',
  },
  Libra: {
    plain:     'Through the stellar-reference lens, your Rising is Libra. This angle reveals an interface quality others experience as considered and easy to be with. The sidereal Libra Rising asks whether the graciousness that comes naturally is also functioning as social management — keeping the relational field smooth enough that your actual position rarely surfaces under conditions where it could be genuinely known.',
    recognize: 'Others feel at ease with you quickly. The question is whether the ease you create is leaving room for the contact that requires some discomfort to be genuine.',
    question:  'Where is your graciousness leaving room for your actual position to be known?',
  },
  Scorpio: {
    plain:     'Through the stellar-reference lens, your Rising is Scorpio. This angle reveals an interface quality others register as depth — or as a closed door, depending on where they are trying to go. The sidereal Scorpio Rising asks whether the guardedness that is one of your defining interface qualities is currently in accurate proportion to the actual threat present — or whether it is running on older information than the current situation requires.',
    recognize: 'Others sense depth before they have access to it. The question is whether the guardedness that makes you compelling is also the thing that makes you lonely.',
    question:  'Where is the guardedness in accurate proportion to what is actually present — and where is it running on older information?',
  },
  Sagittarius: {
    plain:     'Through the stellar-reference lens, your Rising is Sagittarius. This angle reveals an interface quality that opens conversations and enlarges what feels possible in a room. The sidereal Sagittarius Rising asks whether the directness that makes you easy to locate is accounting for the degree to which others need more context or pacing than your natural speed leaves room for — and whether what reads as confidence is sometimes foreclosing on what is offered quietly.',
    recognize: 'Others experience your directness as confidence. The question is whether it is also leaving room for what they want to offer before you have already moved ahead.',
    question:  'Where could you leave more room — before moving ahead — for what is being offered quietly?',
  },
  Capricorn: {
    plain:     'Through the stellar-reference lens, your Rising is Capricorn. This angle reveals an interface quality others often read as authority before you have said much. The sidereal Capricorn Rising asks whether the composure that makes you trustworthy under pressure is also the thing making warmth harder to offer and receive — and whether the formality that protects competence is keeping genuine connection at a manageable distance.',
    recognize: 'Others grant you authority before you have claimed it. The question is whether the composure that earns that trust is also what is keeping warmth at a distance.',
    question:  'What would warmth look like that does not require you to have earned the right to offer it first?',
  },
  Aquarius: {
    plain:     'Through the stellar-reference lens, your Rising is Aquarius. This angle reveals an interface quality others register as distinctive and slightly ahead of where the conversation currently is. The sidereal Aquarius Rising asks whether the independence that defines your interface is serving genuine self-determination — or whether it is a form of self-protection that has become its own kind of confinement, one that looks like freedom from the outside.',
    recognize: 'Others experience you as distinctive and slightly ahead. The question is whether that distance is something you are choosing or something that has been choosing for you.',
    question:  'What would change if you stayed close enough to be genuinely affected?',
  },
  Pisces: {
    plain:     'Through the stellar-reference lens, your Rising is Pisces. This angle reveals an interface quality others experience as gently open and receptive. The sidereal Pisces Rising asks whether the permeability that makes you genuinely available to others is also making it difficult to be distinctly located — to be found as a specific person with a specific position, rather than as a quality of presence that becomes whatever the encounter needs.',
    recognize: 'Others feel received by your presence before you have done much. The question is whether you are as clearly present to yourself as you are available to them.',
    question:  'How would you show up here if you were as clearly present to yourself as you are available to others?',
  },
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const S = StyleSheet.create({
  page:   { backgroundColor: '#F5F5F3', padding: 0, fontFamily: F.sans },
  triBar: { flexDirection: 'row', width: PAGE.width },
  barA:   { flex: 1, height: 1.5, backgroundColor: C.amber },
  barE:   { flex: 1, height: 1.5, backgroundColor: C.emerald },
  barC:   { flex: 1, height: 1.5, backgroundColor: C.crimson },

  content: {
    flex: 1,
    paddingHorizontal: PAGE.marginH,
    paddingTop: 36,
    paddingBottom: PAGE.marginV,
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
    color: C.parchmentFaint, lineHeight: 1.5,
    marginBottom: 16, maxWidth: 440,
  },
  rule: {
    width: PAGE.contentWidth, height: 0.5,
    backgroundColor: C.base, opacity: 0.1, marginBottom: 14,
  },

  columns: { flexDirection: 'row', gap: 14, flex: 1 },
  panel:   { flex: 1, flexDirection: 'column' },

  // Dotted Star Slate line at top of each panel
  dashedRow: {
    flexDirection: 'row',
    gap: 4,
    width: '100%',
    marginBottom: 10,
    alignItems: 'center',
  },
  dash: {
    height: 1.5,
    backgroundColor: STAR_SLATE,
    opacity: 0.7,
  },

  // SIDEREAL system tag
  siderealTag: {
    flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 5,
  },
  siderealBadge: {
    paddingHorizontal: 5, paddingVertical: 2,
    borderWidth: 0.75,
    borderColor: STAR_SLATE,
    borderStyle: 'solid',
  },
  siderealText: {
    fontFamily: F.sans, fontSize: 6, fontWeight: 700,
    letterSpacing: 1.8, textTransform: 'uppercase',
    color: STAR_SLATE,
  },

  roleLabel: {
    fontFamily: F.sans, fontSize: 7, fontWeight: 500,
    letterSpacing: 1.8, textTransform: 'uppercase',
    color: C.parchmentFaint, marginBottom: 8,
  },

  // Sign name in Star Slate (not crimson — key visual differentiator from Page 27)
  signName: {
    fontFamily: F.display, fontSize: 18, fontWeight: 400,
    color: STAR_SLATE, lineHeight: 1.0, marginBottom: 2,
  },
  degreeText: {
    fontFamily: F.sans, fontSize: 7.5, fontWeight: 300,
    color: C.parchmentFaint, letterSpacing: 0.5, marginBottom: 10,
  },
  panelDivider: {
    height: 0.5, backgroundColor: C.base, opacity: 0.1, marginBottom: 8,
  },

  sectionLabel: {
    fontFamily: F.sans, fontSize: 6.5, fontWeight: 500,
    letterSpacing: 1.8, textTransform: 'uppercase',
    color: C.parchmentFaint, marginBottom: 4,
  },
  bodyText: {
    fontFamily: F.sans, fontSize: 8.5, fontWeight: 300,
    color: C.base, lineHeight: 1.6, opacity: 0.88, marginBottom: 8,
  },
  recognizeText: {
    fontFamily: F.display, fontSize: 8.5, fontWeight: 400,
    fontStyle: 'italic', color: C.base, lineHeight: 1.5,
    opacity: 0.78, marginBottom: 8,
  },
  questionText: {
    fontFamily: F.sans, fontSize: 8.5, fontWeight: 500,
    color: C.base, lineHeight: 1.5, opacity: 0.85,
  },
  unknownText: {
    fontFamily: F.sans, fontSize: 8.5, fontWeight: 300,
    color: C.parchmentFaint, lineHeight: 1.5, fontStyle: 'italic', marginBottom: 8,
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

// ─── Dotted line for panel top ────────────────────────────────────────────────
// Panel width ≈ 154pt. Dash 7pt + gap 4pt = 11pt per unit → ~14 dashes.

function SideralPanelRule() {
  return (
    <View style={S.dashedRow}>
      {Array.from({ length: 14 }).map((_, i) => (
        <View key={i} style={[S.dash, { width: 7 }]} />
      ))}
    </View>
  );
}

// ─── Panel component ──────────────────────────────────────────────────────────

interface PanelProps {
  role:      string;
  sign:      string;
  formatted: string;
  content:   SignContent | null;
  isMissingDueToBirthTime?: boolean;
}

function Panel({ role, sign, formatted, content, isMissingDueToBirthTime }: PanelProps) {
  const isRising  = role.startsWith('Rising');
  const isMissing = sign === '—' || !sign || !content;

  return (
    <View style={S.panel}>
      {/* Dotted Star Slate rule — mandatory differentiator from Page 27 */}
      <SideralPanelRule />

      {/* SIDEREAL system tag — text label ensures non-color visibility */}
      <View style={S.siderealTag}>
        <View style={S.siderealBadge}>
          <Text style={S.siderealText}>Sidereal</Text>
        </View>
      </View>

      <Text style={S.roleLabel}>{role}</Text>

      {isMissing && isRising && isMissingDueToBirthTime ? (
        <>
          <Text style={S.unknownText}>
            The Sidereal Ascendant requires a confirmed birth time — same basis as the Tropical Rising.
          </Text>
          <View style={{
            padding: 8,
            backgroundColor: 'rgba(109,119,151,0.08)',
            borderLeftWidth: 2,
            borderLeftColor: STAR_SLATE,
            borderLeftStyle: 'solid',
            marginBottom: 8,
          }}>
            <Text style={{ fontFamily: F.sans, fontSize: 7, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: STAR_SLATE, marginBottom: 4 }}>
              Birth-Time Notice
            </Text>
            <Text style={{ fontFamily: F.sans, fontSize: 8, fontWeight: 300, color: C.base, lineHeight: 1.5 }}>
              The Ascendant shifts approximately every two hours. Both Tropical and Sidereal Rising share the same birth-time requirement.{'\n\n'}
              Add your birth time at:{'\n'}
              3dimensions.guide/update-time
            </Text>
          </View>
        </>
      ) : isMissing ? (
        <Text style={S.unknownText}>Data not available for this placement.</Text>
      ) : (
        <>
          <Text style={S.signName}>{sign}</Text>
          {formatted && formatted !== '—' && (
            <Text style={S.degreeText}>{formatted}</Text>
          )}

          <View style={S.panelDivider} />

          <Text style={S.sectionLabel}>In Plain Language</Text>
          <Text style={S.bodyText}>{content!.plain}</Text>

          <Text style={S.sectionLabel}>You may recognize this when…</Text>
          <Text style={S.recognizeText}>{content!.recognize}</Text>

          <Text style={S.sectionLabel}>Field Question</Text>
          <Text style={S.questionText}>{content!.question}</Text>
        </>
      )}
    </View>
  );
}

// ─── Page component ───────────────────────────────────────────────────────────

interface Props {
  data: ReportData & {
    siderealMoon?: string;
    dataQuality?: { birthTimeSensitive?: boolean; birthTimeStatus?: string };
  };
}

export default function Page28SiderealBigThree({ data }: Props) {
  const birthTimeUncertain = data.dataQuality?.birthTimeSensitive ?? false;

  const getSign = (formatted: string) => {
    if (!formatted || formatted === '—') return '—';
    const parts = formatted.trim().split(' ');
    return parts[parts.length - 1] ?? '—';
  };

  const sidSun    = getSign(data.siderealSun);
  const sidMoon   = data.siderealMoon ? getSign(data.siderealMoon) : '—';
  const sidRising = getSign(data.siderealAsc);

  const panels = [
    {
      role:      'Sun — Core Orientation',
      sign:      sidSun,
      formatted: data.siderealSun,
      content:   SID_SUN[sidSun] ?? null,
    },
    {
      role:      'Moon — Emotional Needs',
      sign:      sidMoon,
      formatted: data.siderealMoon ?? '—',
      content:   SID_MOON[sidMoon] ?? null,
    },
    {
      role:     'Rising — Interface With Life',
      sign:      sidRising,
      formatted: data.siderealAsc,
      content:   SID_RISING[sidRising] ?? null,
      isMissingDueToBirthTime: birthTimeUncertain,
    },
  ];

  return (
    <Page size="LETTER" style={S.page}>
      <TechnicalLines />

      <View style={S.triBar}>
        <View style={S.barA} /><View style={S.barE} /><View style={S.barC} />
      </View>

      <View style={S.content}>
        <Text style={S.eyebrow}>
          Stoplight  ·  Sidereal  ·  Stellar Reference
        </Text>
        <Text style={S.heading}>Your Sidereal Big Three</Text>
        <Text style={S.sub}>
          What does this stellar-reference lens invite me to see?
        </Text>
        <View style={S.rule} />

        <View style={S.columns}>
          {panels.map(p => (
            <Panel
              key={p.role}
              role={p.role}
              sign={p.sign}
              formatted={p.formatted}
              content={p.content}
              isMissingDueToBirthTime={p.isMissingDueToBirthTime}
            />
          ))}
        </View>
      </View>

      <View style={S.footer}>
        <Text style={S.footerText}>The Sovereign Report</Text>
        <Text style={S.pageNum}>28</Text>
      </View>
    </Page>
  );
}
