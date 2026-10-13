/**
 * The Triad Map: every headline fact in the chart, grouped by lens, each one linked to its explanation.
 * Plain data, so it can be tested without a phone. It uses only chart facts. No name, birth date, time or place.
 */
import { signAt } from './carouselSlides';
import { authorityId, numberId, profileId, signId, typeId } from './termIds';

export type MapLens = 'vehicle' | 'road' | 'stoplight';

export interface MapFact { label: string; value: string; termId: string }
export interface MapGroup { lens: MapLens; name: string; system: string; facts: MapFact[] }

export interface MapChart {
  astrology: { tropicalSun: { sign: string }; tropicalMoon: { sign: string }; tropicalAscendant: number };
  numerology: { lifePath: number; destiny: number; soulUrge: number };
  humanDesign: { type: string; authority: string; profile: string };
}

export function triadMapGroups(chart: MapChart, birthTimeKnown: boolean): MapGroup[] {
  const { humanDesign: hd, numerology: num, astrology: astro } = chart;
  const profileLines = hd.profile.match(/\d\/\d/)?.[0] ?? hd.profile;
  const stoplight: MapFact[] = [
    { label: 'Sun', value: astro.tropicalSun.sign, termId: signId(astro.tropicalSun.sign) },
    { label: 'Moon', value: astro.tropicalMoon.sign, termId: signId(astro.tropicalMoon.sign) },
  ];
  // Rising needs a real birth time, so it is left off when the time is not known.
  if (birthTimeKnown) {
    const rising = signAt(astro.tropicalAscendant);
    stoplight.push({ label: 'Rising', value: rising, termId: signId(rising) });
  }
  return [
    {
      lens: 'vehicle', name: 'The Vehicle', system: 'Human Design',
      facts: [
        { label: 'Type', value: hd.type, termId: typeId(hd.type) },
        { label: 'Authority', value: hd.authority, termId: authorityId(hd.authority) },
        { label: 'Profile', value: profileLines, termId: profileId(profileLines) },
      ],
    },
    {
      lens: 'road', name: 'The Road', system: 'Numerology',
      facts: [
        { label: 'Life Path', value: String(num.lifePath), termId: numberId(num.lifePath) },
        { label: 'Destiny', value: String(num.destiny), termId: numberId(num.destiny) },
        { label: 'Soul Urge', value: String(num.soulUrge), termId: numberId(num.soulUrge) },
      ],
    },
    { lens: 'stoplight', name: 'The Stoplight', system: 'Astrology', facts: stoplight },
  ];
}
