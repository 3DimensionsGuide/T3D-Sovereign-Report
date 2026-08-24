/**
 * Page 27 — Your Tropical Big Three
 *
 * Reader question: "How Do I Recognize This Lens In My Lived Experience?"
 *
 * Three-column composition: Sun · Moon · Rising
 * Each panel:
 *   — Thin solid Crimson rule at top of panel
 *   — "TROPICAL" system tag (visible in all color modes and print)
 *   — Role label: SUN — CORE ORIENTATION / MOON — EMOTIONAL NEEDS / RISING — INTERFACE WITH LIFE
 *   — Calculated placement (sign + formatted degree)
 *   — 55–70 word In Plain Language interpretation
 *   — 20–30 word You may recognize this when… cue
 *   — One concise Field Question
 *
 * Rising panel: if birth time is uncertain or missing, renders BirthTimeSensitivityBanner.
 * The Rising panel is NEVER silently omitted — it is always rendered in some form.
 */

import React from 'react';
import { Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { C, F, PAGE } from '../tokens';
import { TechnicalLines } from '../shared/PageComponents';
import { BirthTimeSensitivityBanner } from '../shared/BirthTimeSensitivity';
import type { ReportData } from '../tokens';

// ─── Content maps ─────────────────────────────────────────────────────────────

interface SignContent {
  plain:    string;   // 55–70 words
  recognize: string;  // 20–30 words
  question:  string;  // one concise field question
}

const SUN_CONTENT: Record<string, SignContent> = {
  Aries: {
    plain:     'Your Sun is in Aries — the sign of initiation and self-definition. Your orientation is forward: you are built to begin and to move first, bringing initiating energy into situations that have grown static. At your best, you model the courage to start before anyone else has a plan. The friction arrives when speed outpaces the wisdom needed to choose which direction is actually worth moving in.',
    recognize: 'You feel most alive at the beginning of something, before it becomes routine. Waiting for consensus produces a specific internal pressure that leads you to move anyway.',
    question:  'Where could you slow the initiation by one breath — without losing the momentum that makes you useful?',
  },
  Taurus: {
    plain:     'Your Sun is in Taurus — the sign of substance and endurance. Your orientation is toward what lasts: quality, rootedness, and the satisfaction of building something real. You read situations for their durability rather than their novelty. At your best, you are the steadying presence others organize around. The friction arrives when what is stable has become what is stagnant, and you mistake the two.',
    recognize: 'You invest deeply in what you care about and expect that investment to compound. Disruption of what you have built lands harder than others anticipate.',
    question:  'What are you maintaining out of genuine commitment — and what are you holding past its useful life?',
  },
  Gemini: {
    plain:     'Your Sun is in Gemini — the sign of synthesis and connection. Your orientation is toward ideas, exchange, and building bridges between things others have not yet linked. You think best in conversation. At your best, you make complexity navigable and the isolated feel included. The friction arrives when scattered attention replaces the depth a situation is actually asking for.',
    recognize: 'You find yourself most energized when multiple things are in motion at once. Boredom is a signal, not a character flaw — you are genuinely wired for variety.',
    question:  'Which current thread, if you followed it deeper rather than wider, would teach you something the others cannot?',
  },
  Cancer: {
    plain:     'Your Sun is in Cancer — the sign of belonging and protection. Your orientation is toward what matters: home, emotional safety, and the preservation of what you love. You read the emotional temperature of a room faster than most people know there is one. At your best, you create conditions where people feel genuinely held. The friction arrives when you protect what needs to change.',
    recognize: 'You sense what someone needs before they say it, and feel the weight of whether to offer it. Home — as a feeling, not a location — is foundational to how you function.',
    question:  'Where are you protecting something — a person, a relationship, a version of yourself — that is ready to be released?',
  },
  Leo: {
    plain:     'Your Sun is in Leo — the sign of presence and self-expression. Your orientation is toward visibility, warmth, and the generous extension of both. You understand that being seen is a gift you can offer others, not just a need you carry. At your best, you make the people around you feel more alive. The friction arrives when you perform the version of yourself that gets the best response rather than the one that is actually true.',
    recognize: 'You have had moments where the room changed when you entered. Recognition matters to you more than you always admit — its absence lands harder than it should have to.',
    question:  'Where are you managing your presence for others rather than inhabiting it for yourself?',
  },
  Virgo: {
    plain:     'Your Sun is in Virgo — the sign of discernment and usefulness. Your orientation is toward what works: precision, refinement, and the satisfaction of making things function better than you found them. You notice what others miss and improve what others accept. At your best, you offer what is genuinely needed rather than what is merely impressive. The friction arrives when perfectionism stops things from being finished or shared.',
    recognize: 'You notice errors and inefficiencies that are obvious to you but invisible to others — not because you are looking for them, but because they simply are.',
    question:  'What are you withholding because it is not yet perfect — when what is needed is useful, not flawless?',
  },
  Libra: {
    plain:     'Your Sun is in Libra — the sign of balance and aesthetic intelligence. Your orientation is toward harmony: the quality of how things are, not just what they accomplish. You sense what is aesthetically or relationally out of proportion before you can explain why. At your best, you restore balance where others created imbalance. The friction arrives when maintaining harmony means silencing what you actually think.',
    recognize: 'You sense what is aesthetically or relationally off before you can name it. Conflict is genuinely painful — not merely uncomfortable — which sometimes leads you to carry it alone.',
    question:  'Where are you maintaining the appearance of harmony while carrying the actual imbalance yourself?',
  },
  Scorpio: {
    plain:     'Your Sun is in Scorpio — the sign of depth and transformation. Your orientation is toward what is actually true rather than what appears to be. You move below the surface of situations and people before others have registered that a surface exists. At your best, you hold what others need to examine without flinching. The friction arrives when intensity keeps others at a distance when intimacy is what you actually want.',
    recognize: 'You read beneath the surface of situations before you have words for what you have sensed. Trust is not given easily, and once genuinely broken, is rarely fully restored.',
    question:  'Where is your depth functioning as armor rather than as the genuine presence it is built to be?',
  },
  Sagittarius: {
    plain:     'Your Sun is in Sagittarius — the sign of expansion and meaning. Your orientation is toward the larger picture: what enlarges rather than confines, what is possible rather than merely present. You help others see a version of what is available that they could not see from where they were standing. At your best, you carry genuine optimism rather than performed enthusiasm. The friction arrives when movement substitutes for the depth the current situation is asking for.',
    recognize: 'You are most energized when you can see the larger meaning behind what you are doing. Confinement — physical, philosophical, or institutional — builds into a specific frustration quickly.',
    question:  'What would it mean to go deeper into what is already here rather than moving toward what is not yet arrived?',
  },
  Capricorn: {
    plain:     'Your Sun is in Capricorn — the sign of mastery and structure. Your orientation is toward the long game: building carefully, establishing authority through demonstrated competence, and earning what others claim. You think naturally in terms of decades rather than quarters. At your best, you provide the framework that allows other people\'s gifts to function. The friction arrives when seriousness forecloses on rest and relationship as though they were distractions.',
    recognize: 'You think naturally in terms of milestones and outcomes that are years away. Your standards are high enough that few people — including yourself — consistently meet them.',
    question:  'What would you allow yourself if you treated rest and connection as conditions of the work rather than rewards for it?',
  },
  Aquarius: {
    plain:     'Your Sun is in Aquarius — the sign of collective intelligence and the future. Your orientation is toward what could be rather than what currently is. You carry an awareness of systems and patterns that others are often not yet ready for. At your best, you advance what needs to advance. The friction arrives when being ahead of the room costs you meaningful contact with the people in it.',
    recognize: 'You have understood something — about a situation, a direction, a system — before others could articulate the problem. Belonging to conventional structures tends to produce a persistent sense of not quite fitting.',
    question:  'Where could you slow down enough to let the room catch up — without compromising what you can see from here?',
  },
  Pisces: {
    plain:     'Your Sun is in Pisces — the sign of depth and dissolution. Your orientation is toward what lies beneath: feeling, imagination, and the dissolving of separation. You absorb the emotional environment of rooms you enter and can hold what others need witnessed without judgment. At your best, you offer a quality of presence that makes people feel genuinely understood. The friction arrives when permeability makes it difficult to locate where you end and others begin.',
    recognize: 'You absorb the emotional environment of any space you enter — often before you know you have done it. Solitude and imagination are maintenance, not luxury.',
    question:  'What is yours to carry right now — and what have you absorbed from someone else that you could set down?',
  },
};

const MOON_CONTENT: Record<string, SignContent> = {
  Aries: {
    plain:     'Your Moon is in Aries — you need directness and the freedom to respond immediately. Your emotional needs are clear: capability, mobility, and the ability to act without prolonged mediation. Delayed decisions and extended ambiguity are genuinely draining rather than merely inconvenient. At your best, you bring an honest emotional directness that others experience as refreshingly uncomplicated. The cost is that your first response often arrives before the moment is ready to receive it.',
    recognize: 'Frustration surfaces quickly when you can see what needs to happen but are expected to wait, process, or moderate before responding. Emotional patience is a skill that requires active effort.',
    question:  'Where is your emotional directness an asset — and where does it arrive before the room is ready for it?',
  },
  Taurus: {
    plain:     'Your Moon is in Taurus — you need stability, sensory comfort, and the reassurance that what you have built is secure. You process emotion slowly and deeply; what you feel becomes clear over time rather than instantly. Abrupt change and persistent instability are genuinely destabilizing in ways that others underestimate. At your best, you are the calm that others borrow when they cannot find their own. Your need for continuity is not rigidity — it is how you stay intact.',
    recognize: 'You invest emotionally in relationships and environments deeply and need that investment to be reliable. Sudden shifts in what you counted on land harder than others expect.',
    question:  'What would it cost you to release one thing you are holding for stability that has already outlasted its usefulness?',
  },
  Gemini: {
    plain:     'Your Moon is in Gemini — you need to talk through what you feel in order to understand it. Emotional processing is partly intellectual for you: you make sense of feelings by articulating them to someone who will listen. Isolation from conversation produces an anxiety that looks like restlessness but is actually a search for the contact that generates clarity. At your best, you can speak about difficult emotional material with precision that others find clarifying.',
    recognize: 'You find that speaking about something — even to yourself — produces more understanding than thinking about it alone. Prolonged silence from people you trust is more unsettling than most.',
    question:  'Who in your life can hold your emotional processing without trying to fix or redirect it?',
  },
  Cancer: {
    plain:     'Your Moon is in Cancer — you need to feel emotionally safe before you can be fully present. Home, familiar environments, and trusted relationships are not preferences but conditions. When those conditions are absent, you withdraw; when they are present, you offer a depth of care that others rarely experience elsewhere. At your best, you create belonging for others because you understand viscerally what it costs to be without it.',
    recognize: 'You know within minutes whether a space or a person feels safe. Home — as a quality of feeling rather than a physical location — shapes your capacity to function in everything else.',
    question:  'What would it take to carry a quality of home inside you rather than needing to find it in the environment?',
  },
  Leo: {
    plain:     'Your Moon is in Leo — you need to feel genuinely seen and appreciated, not performed at but actually noticed. You give warmth generously and need it returned with comparable directness. When recognition is absent for extended periods, the emotional temperature in your life drops noticeably. At your best, you bring a quality of emotional warmth that makes others feel significant. The cost is that approval-seeking can make it difficult to distinguish genuine appreciation from the performance of it.',
    recognize: 'You give warmth freely and need it returned in kind. The absence of recognition lands harder and longer than you usually let others know.',
    question:  'Where are you performing warmth in order to earn recognition rather than expressing it because it is genuinely what you feel?',
  },
  Virgo: {
    plain:     'Your Moon is in Virgo — you need order, usefulness, and the sense that things are functioning correctly in order to feel emotionally settled. Emotional distress frequently arrives through the body or through heightened focus on what needs fixing. You process by doing: service, organization, and the satisfaction of making something work better are genuinely restorative. Rest is difficult because it requires justification that should not be necessary.',
    recognize: 'When something feels emotionally off, your first response is often to find something useful to do. Anxiety tends to arrive as an itemized list of what is not yet right.',
    question:  'What would happen if you treated rest as a form of usefulness rather than as the suspension of it?',
  },
  Libra: {
    plain:     'Your Moon is in Libra — you need relational harmony and aesthetic coherence in your environment in order to feel emotionally grounded. Conflict and dissonance are genuinely painful rather than merely uncomfortable, which can lead you to suppress your own needs to maintain peace. At your best, you create environments where people feel balanced and considered. The cost is carrying more dissonance than you show, for longer than is sustainable.',
    recognize: 'You notice when a relationship or environment is out of balance before anyone else has named it. Conflict activates a specific internal discomfort that you often absorb rather than surface.',
    question:  'What are you carrying emotionally in the name of keeping the peace that actually belongs to someone else?',
  },
  Scorpio: {
    plain:     'Your Moon is in Scorpio — you need depth, honesty, and unconditional trust from the people you allow close. You feel intensely, hold emotion for a long time, and are acutely sensitive to any breach of what was promised. At your best, you offer a quality of emotional presence that can hold the heaviest material without recoiling. The friction is the wall between you and the intimacy you most deeply want.',
    recognize: 'You feel things completely and hold them for a long time. Betrayal — of any kind — is not forgotten easily, even when it is formally forgiven.',
    question:  'Where is the wall you built to protect yourself preventing the intimacy you are actually trying to find?',
  },
  Sagittarius: {
    plain:     'Your Moon is in Sagittarius — you need freedom, meaning, and the sense that you are moving toward something larger than the present situation. Confinement, obligation without purpose, or loss of hope produces a restlessness that looks like avoidance but is actually a need for genuine forward movement. At your best, you lift the emotional temperature of situations by connecting others to what is possible rather than what is merely present.',
    recognize: 'You are emotionally most stable when you can see the larger meaning of what you are doing. Confinement — emotional or circumstantial — builds into a particular restlessness quickly.',
    question:  'What meaning are you telling yourself this situation does not have — that might actually be available if you looked for it?',
  },
  Capricorn: {
    plain:     'Your Moon is in Capricorn — you need to feel competent and in control of your circumstances in order to feel emotionally stable. Vulnerability is genuinely uncomfortable; you tend to process through structure and action rather than through expression. At your best, you offer emotional steadiness when others are destabilized. The cost is a difficulty receiving care that mirrors what you are capable of giving.',
    recognize: 'You default to doing when things feel emotionally difficult. Expressing what you feel directly — rather than through action or competence — often feels like a risk without clear reward.',
    question:  'What would it look like to receive the quality of care you offer others, without redirecting it or earning it first?',
  },
  Aquarius: {
    plain:     'Your Moon is in Aquarius — you need intellectual space and emotional room to process in your own time and on your own terms. Too much emotional intensity or expectation of immediate responsiveness can lead to withdrawal. You process feelings analytically and may need time alone to locate what you actually feel before you can speak to it. At your best, you bring non-judgmental calm to emotionally charged situations.',
    recognize: 'When emotion runs high in your environment, your instinct is often to step back rather than into it. You may need to locate what you feel before you can say it.',
    question:  'Where is your need for emotional space keeping you safe — and where is it keeping you from what you want?',
  },
  Pisces: {
    plain:     'Your Moon is in Pisces — you need gentleness, beauty, and the space to dissolve into feeling and imagination without being questioned. Your emotional sensitivity is exquisitely calibrated; you absorb the emotional field of every room you enter and can feel what others are carrying before they know they are carrying it. At your best, you offer empathy so complete that people feel genuinely understood. The cost is losing the thread back to your own experience.',
    recognize: 'You feel what others are carrying before they name it. Harsh or emotionally turbulent environments do not merely feel uncomfortable — they actively deplete you.',
    question:  'Whose emotional state are you carrying right now that is not actually yours to process?',
  },
};

const RISING_CONTENT: Record<string, SignContent> = {
  Aries: {
    plain:     'Your Rising is Aries — others encounter you as direct, energetic, and already in motion. Your interface with life is heat: you arrive with initiating presence that others experience as either galvanizing or pressure, depending on what the moment requires. People tend to know immediately where you stand. At your best, you move things that have been stuck. The friction is when your natural urgency arrives before the context can receive it.',
    recognize: 'People tend to know your position on things quickly, often before you have said much. Your energy is one of the first things others register about you.',
    question:  'Where is your natural urgency serving the situation — and where is it shortcutting something that needed more time?',
  },
  Taurus: {
    plain:     'Your Rising is Taurus — others encounter you as grounded, steady, and unhurried. Your interface with life is substance: people sense that what you offer has weight behind it and has been thought through. Your presence tends to slow situations down, which is frequently the exact thing they need. At your best, you make staying feel worthwhile. The friction is when your natural pace reads as resistance to movement that is genuinely needed.',
    recognize: 'People often feel steadied by your presence. Your energy tends to reduce the temperature of situations — sometimes before you have said anything at all.',
    question:  'Where is your natural steadiness being experienced as groundedness — and where might it be functioning as resistance?',
  },
  Gemini: {
    plain:     'Your Rising is Gemini — others encounter you as quick, curious, and easy to talk to. Your interface with life is adaptability: you meet people where they are and shift registers effortlessly, which makes you approachable across a wide range of contexts. At your best, you create the conditions for exchange. The friction is that your natural adaptability can read as inconsistency across time, making it harder for others to know which version of you to trust.',
    recognize: 'People find you easy to talk to and often open up quickly. You naturally adjust to the register of whoever you are speaking with.',
    question:  'Where is your adaptability serving genuine connection — and where is it preventing people from knowing who you actually are?',
  },
  Cancer: {
    plain:     'Your Rising is Cancer — others encounter you as warm, perceptive, and careful about what they share. Your interface with life is attentiveness: people sense quickly that you notice what others miss, and they adjust accordingly. At your best, you create the conditions for trust. The friction is a guardedness that others may not know how to move past, even when they want to.',
    recognize: 'People often share things with you they have not shared elsewhere. Your attentiveness is palpable — others sense that you are genuinely paying attention.',
    question:  'Where is your guardedness protecting something real — and where has it outlasted its purpose?',
  },
  Leo: {
    plain:     'Your Rising is Leo — others encounter you immediately. There is a quality of presence that makes you visible even when you are trying to blend in. Your interface with life is warmth and authority: people tend to grant you attention and credibility before you have said much. At your best, you make others feel that being in the room with you matters. The friction is that the persona can be mistaken for the whole person — by others and by you.',
    recognize: 'You tend to be noticed when you enter a room, regardless of your intention. People read authority or significance into your presence before you have demonstrated either.',
    question:  'Where is the persona you present serving you — and where is it getting between you and the contact you want?',
  },
  Virgo: {
    plain:     'Your Rising is Virgo — others encounter you as precise, attentive, and competent. Your interface with life is careful observation: you miss very little, and people sense this. At your best, your presence signals that things will be handled well. The friction is that the quality of attention you bring can read as critical — as though you are evaluating rather than engaging — even when what you are doing is simply paying close attention.',
    recognize: 'People often sense that you see more than you say. Your attentiveness is noticeable — sometimes experienced as discernment, sometimes as scrutiny.',
    question:  'Where could you let your precision show up as reassurance rather than as the quiet evaluation others sometimes sense?',
  },
  Libra: {
    plain:     'Your Rising is Libra — others encounter you as gracious, aesthetically aware, and easy to be with. Your interface with life is consideration: you make interactions feel well-designed, and people experience your presence as comfortable. At your best, you create the conditions for genuine exchange. The friction is that your graciousness can look like agreement when it is not — leaving others uncertain about where you actually stand.',
    recognize: 'People experience interactions with you as smooth and considered. You tend to put others at ease quickly, sometimes before you have offered anything of your own position.',
    question:  'Where could you let your actual position be visible without sacrificing the graciousness that makes you trustworthy?',
  },
  Scorpio: {
    plain:     'Your Rising is Scorpio — others encounter you as intense, private, and quietly evaluating. Your interface with life is depth: people sense immediately that there is more beneath the surface than is being shown, which they experience as either compelling or unsettling. At your best, your presence signals that you can be trusted with what matters. The friction is that the guardedness that protects depth can also make trust difficult to establish.',
    recognize: 'People tend to sense that you are taking them in before they have taken you in. Your quiet evaluation is perceptible — experienced as either depth or guardedness depending on the context.',
    question:  'Where is the intensity of your presence opening the room — and where is it closing it before connection can begin?',
  },
  Sagittarius: {
    plain:     'Your Rising is Sagittarius — others encounter you as open, direct, and expansive. Your interface with life is possibility: you make conversations feel larger than they were before you arrived, and your natural enthusiasm tends to raise the energy of rooms. At your best, your presence gives others permission to think bigger. The friction is that directness can arrive without the packaging that sensitive moments require.',
    recognize: 'People often experience conversations with you as bigger, more open, or more possible than they expected. Your directness is frequently the first thing others notice.',
    question:  'Where is your directness serving clarity — and where is it shortcutting the care a moment actually needs?',
  },
  Capricorn: {
    plain:     'Your Rising is Capricorn — others encounter you as composed, competent, and serious. Your interface with life is authority: people often grant you credibility before you have demonstrated it, because your presence signals that things are under consideration. At your best, you provide structure when others are scattered. The friction is a formality that holds warmth at a distance even when you want it close.',
    recognize: 'People tend to grant you authority or credibility before you have made a case for it. Your composure reads as competence — which is often accurate but can also be isolating.',
    question:  'Where could you let warmth be visible without needing to earn it first — or justify it after?',
  },
  Aquarius: {
    plain:     'Your Rising is Aquarius — others encounter you as unusual, independent, and a version ahead of the current conversation. Your interface with life is distinctiveness: people remember you. At your best, your presence signals that there is a different way to think about something, and others follow that signal. The friction is an otherness that keeps genuine contact at arm\'s length even when you want it nearby.',
    recognize: 'People tend to remember meeting you, often more vividly than you remember meeting them. Your distinctiveness is noticeable before you have said much.',
    question:  'Where is your distinctiveness serving genuine connection — and where is it substituting for it?',
  },
  Pisces: {
    plain:     'Your Rising is Pisces — others encounter you as soft, perceptive, and gently present. Your interface with life is receptivity: you absorb people\'s experience of themselves, which they often find relieving. At your best, your presence makes others feel that they do not need to perform. The friction is a diffuseness that makes it difficult for others to know where you are — which can be experienced as availability but also as absence.',
    recognize: 'People often feel received by you before you have said anything. Your presence creates a quality of gentle openness that others find either grounding or hard to locate.',
    question:  'Where could you let your own presence be as clearly felt as the presence you give others?',
  },
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  page:    { backgroundColor: '#F5F5F3', padding: 0, fontFamily: F.sans },
  triBar:  { flexDirection: 'row', width: PAGE.width },
  barA:    { flex: 1, height: 1.5, backgroundColor: C.amber },
  barE:    { flex: 1, height: 1.5, backgroundColor: C.emerald },
  barC:    { flex: 1, height: 1.5, backgroundColor: C.crimson },

  content: {
    flex: 1,
    paddingHorizontal: PAGE.marginH,
    paddingTop: 36,
    paddingBottom: PAGE.marginV,
  },

  // Page header
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

  // ── Three-column grid ─────────────────────────────────────────────────────
  columns: {
    flexDirection: 'row',
    gap: 14,
    flex: 1,
  },

  // ── Individual panel ──────────────────────────────────────────────────────
  panel: {
    flex: 1,
    flexDirection: 'column',
  },

  // Thin solid crimson rule at top of each panel
  panelCrimsonRule: {
    height: 1.5,
    backgroundColor: C.crimson,
    width: '100%',
    marginBottom: 10,
  },

  // TROPICAL system tag — must be visible in all modes including print
  tropicalTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 5,
  },
  tropicalBadge: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderWidth: 0.75,
    borderColor: C.crimson,
    borderStyle: 'solid',
  },
  tropicalText: {
    fontFamily: F.sans,
    fontSize: 6,
    fontWeight: 700,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    color: C.crimson,
  },

  // Role label
  roleLabel: {
    fontFamily: F.sans,
    fontSize: 7,
    fontWeight: 500,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    color: C.parchmentFaint,
    marginBottom: 8,
  },

  // Placement display
  signName: {
    fontFamily: F.display,
    fontSize: 18,
    fontWeight: 400,
    color: C.crimson,
    lineHeight: 1.0,
    marginBottom: 2,
  },
  degreeText: {
    fontFamily: F.sans,
    fontSize: 7.5,
    fontWeight: 300,
    color: C.parchmentFaint,
    letterSpacing: 0.5,
    marginBottom: 10,
  },

  // Panel divider
  panelDivider: {
    height: 0.5,
    backgroundColor: C.base,
    opacity: 0.1,
    marginBottom: 8,
  },

  // Section labels within panel
  sectionLabel: {
    fontFamily: F.sans,
    fontSize: 6.5,
    fontWeight: 500,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    color: C.parchmentFaint,
    marginBottom: 4,
  },

  // In Plain Language body
  bodyText: {
    fontFamily: F.sans,
    fontSize: 8.5,
    fontWeight: 300,
    color: C.base,
    lineHeight: 1.6,
    opacity: 0.88,
    marginBottom: 8,
  },

  // Recognize cue
  recognizeText: {
    fontFamily: F.display,
    fontSize: 8.5,
    fontWeight: 400,
    fontStyle: 'italic',
    color: C.base,
    lineHeight: 1.5,
    opacity: 0.78,
    marginBottom: 8,
  },

  // Field Question
  questionText: {
    fontFamily: F.sans,
    fontSize: 8.5,
    fontWeight: 500,
    color: C.base,
    lineHeight: 1.5,
    opacity: 0.85,
  },

  // Unknown placement text
  unknownText: {
    fontFamily: F.sans,
    fontSize: 8.5,
    fontWeight: 300,
    color: C.parchmentFaint,
    lineHeight: 1.5,
    fontStyle: 'italic',
    marginBottom: 8,
  },

  // Footer
  footer: {
    paddingHorizontal: PAGE.marginH, paddingBottom: 22,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  footerText: { fontFamily: F.sans, fontSize: 7, letterSpacing: 1.2, color: C.parchmentFaint, textTransform: 'uppercase' },
  pageNum: { fontFamily: F.sans, fontSize: 7, color: C.parchmentFaint },
});

// ─── Panel component ─────────────────────────────────────────────────────────

interface PanelProps {
  role:      string;   // "SUN — CORE ORIENTATION"
  sign:      string;   // "Libra" or "—"
  formatted: string;   // "7°32' Libra" or "—"
  content:   SignContent | null;
  birthTimeUncertain?: boolean;
  certainty?: string;
}

function Panel({ role, sign, formatted, content, birthTimeUncertain, certainty }: PanelProps) {
  const isRising = role.startsWith('RISING');
  const isMissing = sign === '—' || !sign || !content;

  return (
    <View style={S.panel}>
      {/* Thin solid crimson rule — mandatory per spec */}
      <View style={S.panelCrimsonRule} />

      {/* TROPICAL system tag — visible in all modes */}
      <View style={S.tropicalTag}>
        <View style={S.tropicalBadge}>
          <Text style={S.tropicalText}>Tropical</Text>
        </View>
      </View>

      {/* Role label */}
      <Text style={S.roleLabel}>{role}</Text>

      {/* Placement display */}
      {isMissing && isRising && birthTimeUncertain ? (
        // Rising — birth time uncertain (mandatory notice, never silent omission)
        <>
          <Text style={S.unknownText}>
            The Rising sign requires a confirmed birth time.
          </Text>
          <View style={{
            padding: 8,
            backgroundColor: '#FDF5E8',
            borderLeftWidth: 2,
            borderLeftColor: C.amberDim,
            borderLeftStyle: 'solid',
            marginBottom: 8,
          }}>
            <Text style={{ fontFamily: F.sans, fontSize: 7, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: C.amberDim, marginBottom: 4 }}>
              Birth-Time Notice
            </Text>
            <Text style={{ fontFamily: F.sans, fontSize: 8, fontWeight: 300, color: C.base, lineHeight: 1.5 }}>
              The Ascendant shifts approximately every two hours. Without a confirmed birth time, this placement cannot be accurately calculated.{'\n\n'}
              To add your birth time and receive an updated report:{'\n'}
              3dimensions.guide/update-time
            </Text>
          </View>
        </>
      ) : isMissing ? (
        <Text style={S.unknownText}>Data not available.</Text>
      ) : (
        <>
          <Text style={S.signName}>{sign}</Text>
          {formatted && formatted !== '—' && (
            <Text style={S.degreeText}>{formatted}</Text>
          )}

          <View style={S.panelDivider} />

          {/* In Plain Language */}
          <Text style={S.sectionLabel}>In Plain Language</Text>
          <Text style={S.bodyText}>{content!.plain}</Text>

          {/* Recognize */}
          <Text style={S.sectionLabel}>You may recognize this when…</Text>
          <Text style={S.recognizeText}>{content!.recognize}</Text>

          {/* Field Question */}
          <Text style={S.sectionLabel}>Field Question</Text>
          <Text style={S.questionText}>{content!.question}</Text>
        </>
      )}
    </View>
  );
}

// ─── Page component ───────────────────────────────────────────────────────────

interface Props {
  data: ReportData & { dataQuality?: { birthTimeSensitive?: boolean; birthTimeStatus?: string } };
}

export default function Page27TropicalBigThree({ data }: Props) {
  const birthTimeUncertain = data.dataQuality?.birthTimeSensitive ?? false;

  // Extract sign from formatted string as fallback
  const getSignFromFormatted = (formatted: string) => {
    if (!formatted || formatted === '—') return '—';
    const parts = formatted.trim().split(' ');
    return parts[parts.length - 1] ?? '—';
  };

  const sunSign    = data.sunSign    !== '—' ? data.sunSign    : getSignFromFormatted(data.tropicalSun);
  const moonSign   = data.moonSign   !== '—' ? data.moonSign   : getSignFromFormatted(data.tropicalMoon);
  const risingSign = data.risingSign !== '—' ? data.risingSign : getSignFromFormatted(data.tropicalAsc);

  const panels = [
    {
      role:      'Sun — Core Orientation',
      sign:      sunSign,
      formatted: data.tropicalSun,
      content:   SUN_CONTENT[sunSign] ?? null,
    },
    {
      role:      'Moon — Emotional Needs',
      sign:      moonSign,
      formatted: data.tropicalMoon,
      content:   MOON_CONTENT[moonSign] ?? null,
    },
    {
      role:      'Rising — Interface With Life',
      sign:      risingSign,
      formatted: data.tropicalAsc,
      content:   RISING_CONTENT[risingSign] ?? null,
      birthTimeUncertain,
    },
  ];

  return (
    <Page size="LETTER" style={S.page}>
      <TechnicalLines />

      <View style={S.triBar}>
        <View style={S.barA} /><View style={S.barE} /><View style={S.barC} />
      </View>

      <View style={S.content}>
        {/* Eyebrow — per spec: STOPLIGHT / TROPICAL / SEASONAL REFERENCE */}
        <Text style={S.eyebrow}>
          Stoplight  ·  Tropical  ·  Seasonal Reference
        </Text>

        <Text style={S.heading}>Your Tropical Big Three</Text>
        <Text style={S.sub}>
          How do I recognize this lens in my lived experience?
        </Text>
        <View style={S.rule} />

        {/* Three panels */}
        <View style={S.columns}>
          {panels.map(p => (
            <Panel
              key={p.role}
              role={p.role}
              sign={p.sign}
              formatted={p.formatted}
              content={p.content}
              birthTimeUncertain={p.birthTimeUncertain}
            />
          ))}
        </View>
      </View>

      <View style={S.footer}>
        <Text style={S.footerText}>The Sovereign Report</Text>
        <Text style={S.pageNum}>27</Text>
      </View>
    </Page>
  );
}
