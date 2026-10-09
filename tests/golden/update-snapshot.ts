/**
 * Writes snapshot.json (what the engines produce today), VERIFY.md (a
 * worksheet for checking each chart against Astro.com and Jovian Archive) and,
 * if missing, verification.json (your check-off list).
 *
 * Run: npm run golden:update
 */

import { existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { FIXTURES } from './fixtures';
import { summarize, type ChartSummary } from './summarize';
import { formatLongitude } from './helpers';

const DIR = __dirname;

function worksheet(f: (typeof FIXTURES)[number], s: ChartSummary): string {
  const t = s.tropical;
  const sid = s.sidereal;
  const b = (z: typeof t, k: string): string => {
    const p = z.bodies[k];
    return `${formatLongitude(p.longitude)}${p.retrograde ? ' R' : ''}`;
  };
  return `## ${f.label}  (\`${f.id}\`)

Why this chart: ${f.why}

**Enter on both sites:** ${f.birthDate}, ${f.birthTime} local time, ${f.city} (lat ${f.latitude}, lon ${f.longitude}), time zone ${f.timezone}

### Astro.com (Extended Chart Selection → Whole Sign houses, True Node, Tropical)
| | T3D says |
|---|---|
| Sun | ${b(t, 'sun')} |
| Moon | ${b(t, 'moon')} |
| Mercury | ${b(t, 'mercury')} |
| Venus | ${b(t, 'venus')} |
| Mars | ${b(t, 'mars')} |
| Jupiter | ${b(t, 'jupiter')} |
| Saturn | ${b(t, 'saturn')} |
| Uranus / Neptune / Pluto | ${b(t, 'uranus')} / ${b(t, 'neptune')} / ${b(t, 'pluto')} |
| True Node | ${b(t, 'northNode')} |
| Ascendant | ${formatLongitude(t.ascendant)} |
| Midheaven | ${formatLongitude(t.midheaven)} |
| Sidereal (Lahiri) Sun / Moon / Asc | ${b(sid, 'sun')} / ${b(sid, 'moon')} / ${formatLongitude(sid.ascendant)} |

Acceptable difference: about 1 arc-minute (0°01') for planets. Moon and Ascendant matter most.

### Jovian Archive (Human Design)
| | T3D says |
|---|---|
| Type | ${s.humanDesign.type} |
| Authority | ${s.humanDesign.authority} |
| Profile | ${s.humanDesign.profile} |
| Cross | ${s.humanDesign.cross} |
| Defined centers | ${s.humanDesign.definedCenters.join(', ') || 'none'} |
| Channels | ${s.humanDesign.channels.join(', ') || 'none'} |

Mark the result in \`verification.json\`: "match", "mismatch" or "unchecked". Add a note if the site differs.

---
`;
}

const charts: Record<string, ChartSummary> = {};
for (const f of FIXTURES) charts[f.id] = summarize(f);

writeFileSync(
  join(DIR, 'snapshot.json'),
  JSON.stringify({ generatedAt: new Date().toISOString(), note: 'Regenerate only when you know the new numbers are right.', charts }, null, 2) + '\n',
);

writeFileSync(
  join(DIR, 'VERIFY.md'),
  `# Cross-check worksheet\n\nOne section per chart. Compare each against Astro.com and Jovian Archive, then record the result in verification.json.\n\n---\n\n${FIXTURES.map((f) => worksheet(f, charts[f.id])).join('\n')}`,
);

const verificationPath = join(DIR, 'verification.json');
if (!existsSync(verificationPath)) {
  const blank = Object.fromEntries(FIXTURES.map((f) => [f.id, { astroCom: 'unchecked', jovian: 'unchecked', notes: '' }]));
  writeFileSync(verificationPath, JSON.stringify(blank, null, 2) + '\n');
}

console.log(`Wrote snapshot.json and VERIFY.md for ${FIXTURES.length} charts.`);
