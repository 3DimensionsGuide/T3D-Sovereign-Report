import type { ChartDrawingData } from '../charts/chartTypes';
import type { NumerologyDetail } from './numerologyTypes';

/**
 * Which glossary terms show up in this person's own chart. Pure matching on ids the app already uses,
 * so the "Yours" tab works from the saved chart even with no signal. Extra detail (gates, planets,
 * Pinnacles) is added when the saved drawing data and numerology detail are available.
 */

/** The part of the saved chart this needs (kept local so tests never pull in the network layer). */
export interface YourChart {
  astrology: {
    tropicalSun: { sign: string };
    tropicalMoon: { sign: string };
    tropicalAscendant: number;
    tropicalMC: number;
  };
  numerology: {
    lifePath: number; destiny: number; personality: number; soulUrge: number; hiddenPassion: number; karmicLessons: number[];
  };
  humanDesign: { type: string; authority: string; profile: string };
}

const typeKey = (t: string) => `hd:type:${t}`;

function authorityKey(a: string): string {
  const s = a.toLowerCase();
  if (s.includes('sacral')) return 'hd:authority:Sacral';
  if (s.includes('emotion') || s.includes('solar')) return 'hd:authority:Emotional';
  if (s.includes('splen')) return 'hd:authority:Splenic';
  if (s.includes('self')) return 'hd:authority:Self-Projected';
  if (s.includes('ego') || s.includes('heart')) return 'hd:authority:Ego';
  if (s.includes('lunar')) return 'hd:authority:Lunar';
  return 'hd:authority:None';
}

const SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
const signOf = (lon: number) => SIGNS[Math.floor((((lon % 360) + 360) % 360) / 30)] ?? '';

export function yourTermIds(
  chart: YourChart,
  drawing?: ChartDrawingData | null,
  numerology?: NumerologyDetail | null,
): Set<string> {
  const ids = new Set<string>();
  const { humanDesign: hd, numerology: num, astrology: astro } = chart;

  ids.add(typeKey(hd.type));
  ids.add('hd:type');
  ids.add('hd:strategy');
  ids.add(authorityKey(hd.authority));
  ids.add('hd:authority');
  const profile = hd.profile.match(/\d\/\d/)?.[0];
  if (profile) ids.add(`hd:profile:${profile}`);
  ids.add('hd:profile');

  for (const n of [num.lifePath, num.destiny, num.soulUrge, num.personality, num.hiddenPassion, ...num.karmicLessons]) {
    ids.add(`num:${n}`);
  }
  ['lifepath', 'destiny', 'soulurge', 'personality', 'hiddenpassion'].forEach((k) => ids.add(`num:${k}`));
  if (num.karmicLessons.length) ids.add('num:karmic');
  for (const p of numerology?.pinnacles ?? []) ids.add(`num:${p.number}`);
  for (const c of numerology?.challenges ?? []) ids.add(`num:${c.number}`);

  ids.add('astro:planet:sun');
  ids.add('astro:planet:moon');
  ids.add('astro:ascendant');
  for (const s of [astro.tropicalSun.sign, astro.tropicalMoon.sign, signOf(astro.tropicalAscendant)]) {
    if (s) ids.add(`astro:sign:${s}`);
  }
  if (Number.isFinite(astro.tropicalMC)) ids.add('astro:midheaven');

  if (drawing) {
    const hdd = drawing.humanDesign;
    for (const c of [...hdd.definedCenters, ...hdd.undefinedCenters]) ids.add(`hd:center:${c}`);
    for (const g of hdd.gates) ids.add(`hd:gate:${g.gate}`);
    for (const ch of hdd.channels) ids.add(`hd:channel:${ch.gates[0]}-${ch.gates[1]}`);
    for (const p of drawing.tropical.planets) {
      ids.add(`astro:planet:${p.body}`);
      if (p.sign) ids.add(`astro:sign:${p.sign}`);
      if (p.house) ids.add(`astro:house:${p.house}`);
    }
    for (const a of drawing.tropical.aspects) ids.add(`astro:aspect:${a.aspect}`);
    if (hdd.incarnationCross) ids.add('hd:cross');
  }
  return ids;
}
