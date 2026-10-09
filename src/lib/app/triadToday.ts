/**
 * Daily Triad reading for the T3D app's Today screen (server-side only).
 *
 * One frame across the three systems: the Vehicle (Strategy and Authority),
 * the Road (today's Personal Day) and the Stoplight (the Moon and the
 * tightest transit). It is a frame for deciding, never an instruction.
 * T3D rule: the sky is weather and the decision goes through Strategy and
 * Authority.
 */

import { HOUSE_THEMES } from '@/lib/report/advanced/stoplight/transits-content';
import { buildTransitCard, pickAuthorityContent, pickTypeContent } from '@/lib/app/transitCard';
import type { DayNumerology } from '@/server/engines/dayNumerology';
import type { DailySkyResult } from '@/server/engines/dailySky';

export interface TriadToday {
  vehicle: {
    heading: string;
    strategy: string | null;
    authority: string | null;
    cue: string | null;
  };
  road: {
    numberText: string;
    label: string;
    theme: string;
    leanIn: string;
    watchFor: string;
    universalLabel: string;
  };
  stoplight: {
    moon: string;
    lead: { title: string; natureLine: string; invitation: string } | null;
    quiet: string | null;
  };
  frame: string;
  steps: string[];
  closing: string;
}

function ordinal(n: number): string {
  const v = n % 100;
  const suffix = v >= 11 && v <= 13 ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' } as Record<number, string>)[n % 10] ?? 'th';
  return `${n}${suffix}`;
}

function lowerFirst(s: string): string {
  return s ? s.charAt(0).toLowerCase() + s.slice(1) : s;
}

export function buildTriadToday(
  vehicle: { type: string | null; authority: string | null },
  day: DayNumerology,
  sky: DailySkyResult,
): TriadToday {
  const typeContent = pickTypeContent(vehicle.type);
  const authContent = pickAuthorityContent(vehicle.authority);

  const hit = sky.transits[0] ?? null;
  const card = hit
    ? buildTransitCard(
        {
          transiting: hit.transiting, natal: hit.natal, aspect: hit.aspect, nature: hit.nature,
          orb: hit.orb, peak: hit.peak, applying: hit.applying,
        },
        { type: null, authority: null },
      )
    : null;

  const p = day.personal;
  const numberText = p.root ? `${p.number}/${p.root}` : String(p.number);
  const moonLine = `The Moon is in ${sky.moon.sign}, moving through your ${ordinal(sky.moon.house)} house: ${lowerFirst(HOUSE_THEMES[sky.moon.house] ?? '')}`;

  const authorityName = authContent?.authority ? `${authContent.authority} Authority` : 'Authority';
  const SKY_PHRASE = {
    flow: 'carrying an easy current',
    friction: 'carrying some friction',
    neutral: 'blending energies',
  } as const;
  const skyWord = hit ? SKY_PHRASE[hit.nature] : 'quiet';

  const strategyStep = typeContent
    ? `Strategy (${typeContent.type}): ${typeContent.strategyPractice}`
    : 'Strategy: begin from your Human Design Strategy, not from the mood of the day.';
  const authorityStep = authContent
    ? `Authority (${authContent.authority}): ${authContent.doList[0]}.`
    : 'Authority: let your inner authority speak before you commit.';

  return {
    vehicle: {
      heading: typeContent && authContent ? `${typeContent.type} · ${authorityName}` : 'Your Strategy and Authority',
      strategy: typeContent ? typeContent.strategyPractice : null,
      authority: authContent ? `${authContent.doList[0]}.` : null,
      cue: typeContent
        ? `If you notice ${lowerFirst(typeContent.notSelf)}, come back to your Strategy.`
        : null,
    },
    road: {
      numberText,
      label: p.label,
      theme: p.theme,
      leanIn: p.leanIn,
      watchFor: p.watchFor,
      universalLabel: day.universal.label,
    },
    stoplight: {
      moon: moonLine,
      lead: card ? { title: card.title, natureLine: card.natureLine, invitation: card.invitation } : null,
      quiet: card ? null : 'The sky is quiet today: no close contacts to your chart.',
    },
    frame:
      `Let your ${authorityName} lead. Your Personal Day reads as ${p.label}, and the sky is ${skyWord} today. ` +
      'Treat both as information about conditions. The decision itself comes from how your Authority responds.',
    steps: [
      strategyStep,
      authorityStep,
      `Road check: does what you are about to do fit a ${p.label} day? Lean in: ${p.leanIn}`,
      card
        ? `Sky check: ${card.title}. ${card.invitation}`
        : `Sky check: ${moonLine}`,
    ],
    closing:
      'If your Authority says yes and the Road and the sky are not pushing against it, that is a clear signal to move at your own pace. If only a sense of urgency is pushing, that tells you about the urgency, not about the decision.',
  };
}
