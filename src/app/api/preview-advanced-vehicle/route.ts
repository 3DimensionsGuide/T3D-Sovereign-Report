import React from 'react';
import { Document, renderToBuffer } from '@react-pdf/renderer';
import { registerFonts } from '@/lib/report/fonts';
import Page01VehicleDivider from '@/lib/report/advanced/vehicle/Page01Divider';
import Page02Definition from '@/lib/report/advanced/vehicle/Page02Definition';
import Page02Gates from '@/lib/report/advanced/vehicle/Page02Gates';
import Page02Bodygraph from '@/lib/report/advanced/vehicle/Page02Bodygraph';
import Page03Bridges, { hasBridgePage } from '@/lib/report/advanced/vehicle/Page03Bridges';
import Page04Circuitry from '@/lib/report/advanced/vehicle/Page04Circuitry';
import Page05IncarnationCross from '@/lib/report/advanced/vehicle/Page05IncarnationCross';
import Page06Godhead from '@/lib/report/advanced/vehicle/Page06Godhead';
import Page07GodheadLightShadow from '@/lib/report/advanced/vehicle/Page07GodheadLightShadow';
import Page08Variables from '@/lib/report/advanced/vehicle/Page08Variables';
import Page09Synthesis from '@/lib/report/advanced/vehicle/Page09Synthesis';
import { generateVehicleSynthesis } from '@/lib/report/schema/vehicleSynthesisEngine';

registerFonts();

// Representative sample data — not a real chart. Throat+Sacral connect via
// the Charisma channel (20-34), Spleen+Root connect via Judgment (18-58) —
// a clean 2-group Split. Gate 20 (throat) and 34 (sacral) are both already
// active, and each has an unpaired partner gate in the Spleen island (57,
// via Brainwave 57-20 and Power 57-34) — so this demos a "narrow split"
// bridge with a real hanging-gate readout. The two active channels also
// give Circuitry something real to tally: Charisma (34-20) is an
// Integration channel, Judgment (18-58) is Collective/Understanding-Logic —
// a tied, "Even Spread" reading, which exercises that content path.
//
// Profile 1/3 (Right Angle) demos the Incarnation Cross family reading.
// hdActiveGates below reuses gate 20 as Personality Sun and adds Personality
// Earth / Design Sun / Design Earth so all four cross gates are present.
const sampleData = {
  firstName: 'Alex',
  hdType: 'Manifesting Generator',
  hdAuthority: 'Sacral',
  hdStrategy: 'Wait to respond, then inform',
  hdNotSelf: 'Anger and frustration',
  hdProfile: '1/3',
  hdIncarnationCross: 'Right Angle Cross of the Sleeping Phoenix',
  hdDefinedCenters: ['throat', 'sacral', 'spleen', 'root'],
  hdChannels: [
    { name: 'Charisma', gates: [34, 20], activatedBy: 'personality', fromCenter: 'sacral', toCenter: 'throat' },
    { name: 'Judgment', gates: [18, 58], activatedBy: 'design', fromCenter: 'spleen', toCenter: 'root' },
  ],
  hdActiveGates: [
    { gate: 20, line: 1, center: 'throat', planet: 'sun', epoch: 'personality', longitude: 0 },
    { gate: 34, line: 1, center: 'sacral', planet: 'moon', epoch: 'personality', longitude: 0 },
    { gate: 18, line: 1, center: 'spleen', planet: 'mars', epoch: 'design', longitude: 0 },
    { gate: 58, line: 1, center: 'root', planet: 'venus', epoch: 'design', longitude: 0 },
    { gate: 55, line: 3, center: 'solar_plexus', planet: 'earth', epoch: 'personality', longitude: 0 },
    { gate: 10, line: 2, center: 'g_center', planet: 'sun', epoch: 'design', longitude: 0 },
    { gate: 15, line: 4, center: 'g_center', planet: 'earth', epoch: 'design', longitude: 0 },
  ],
};

// Tyler's real chart (1993-09-30, 09:51, Harbor City CA) — captured verbatim
// from /api/debug-calculate against the live swisseph engine, to verify the
// Incarnation Cross output against his own corrected reference analysis.
// Confirmed match: Profile 4/1, Juxtaposition Cross of Correction,
// gates 18/17/39/38. Pass ?real=1 to render this instead of the demo data.
const realData = {
  firstName: 'Tyler',
  hdType: 'Manifesting Generator',
  hdAuthority: 'Sacral',
  hdStrategy: 'Wait to respond, then inform',
  hdNotSelf: 'Anger and frustration',
  hdProfile: '4/1',
  hdIncarnationCross: 'Juxtaposition Cross of Correction',
  hdDefinedCenters: ['throat', 'sacral', 'spleen', 'root'],
  hdChannels: [
    { name: 'Charisma', gates: [20, 34], activatedBy: 'personality', fromCenter: 'throat', toCenter: 'sacral' },
    { name: 'Struggle', gates: [28, 38], activatedBy: 'both', fromCenter: 'spleen', toCenter: 'root' },
    { name: 'Transformation', gates: [32, 54], activatedBy: 'both', fromCenter: 'spleen', toCenter: 'root' },
  ],
  hdActiveGates: [
    { gate: 18, line: 4, center: 'spleen', planet: 'sun', epoch: 'personality', longitude: 187.53810447591457 },
    { gate: 17, line: 3, center: 'ajna', planet: 'moon', epoch: 'personality', longitude: 6.6104931883740505 },
    { gate: 50, line: 4, center: 'spleen', planet: 'mercury', epoch: 'personality', longitude: 209.47185454366536 },
    { gate: 40, line: 6, center: 'heart', planet: 'venus', epoch: 'personality', longitude: 161.12409871138323 },
    { gate: 28, line: 1, center: 'spleen', planet: 'mars', epoch: 'personality', longitude: 212.43870141535217 },
    { gate: 32, line: 1, center: 'spleen', planet: 'jupiter', epoch: 'personality', longitude: 201.22221361792765 },
    { gate: 49, line: 6, center: 'solar_plexus', planet: 'saturn', epoch: 'personality', longitude: 324.2575517770025 },
    { gate: 54, line: 4, center: 'root', planet: 'uranus', epoch: 'personality', longitude: 288.2322695514266 },
    { gate: 54, line: 4, center: 'root', planet: 'neptune', epoch: 'personality', longitude: 288.37618755645644 },
    { gate: 43, line: 6, center: 'ajna', planet: 'pluto', epoch: 'personality', longitude: 233.66200482463557 },
    { gate: 34, line: 5, center: 'sacral', planet: 'northNode', epoch: 'personality', longitude: 244.55268684630005 },
    { gate: 20, line: 5, center: 'throat', planet: 'southNode', epoch: 'personality', longitude: 64.55268684630005 },
    { gate: 17, line: 4, center: 'ajna', planet: 'earth', epoch: 'personality', longitude: 7.538104475914565 },
    { gate: 39, line: 1, center: 'root', planet: 'sun', epoch: 'design', longitude: 99.5380991256265 },
    { gate: 9, line: 2, center: 'sacral', planet: 'moon', epoch: 'design', longitude: 247.1358017426578 },
    { gate: 56, line: 3, center: 'throat', planet: 'mercury', epoch: 'design', longitude: 118.25449124226691 },
    { gate: 8, line: 1, center: 'throat', planet: 'venus', epoch: 'design', longitude: 55.03625340297299 },
    { gate: 59, line: 5, center: 'sacral', planet: 'mars', epoch: 'design', longitude: 154.67786743643103 },
    { gate: 18, line: 3, center: 'spleen', planet: 'jupiter', epoch: 'design', longitude: 186.08863872105644 },
    { gate: 30, line: 6, center: 'solar_plexus', planet: 'saturn', epoch: 'design', longitude: 329.9665637411001 },
    { gate: 54, line: 6, center: 'root', planet: 'uranus', epoch: 'design', longitude: 290.655406185399 },
    { gate: 54, line: 6, center: 'root', planet: 'neptune', epoch: 'design', longitude: 290.05441906585384 },
    { gate: 43, line: 5, center: 'ajna', planet: 'pluto', epoch: 'design', longitude: 233.00197953356474 },
    { gate: 5, line: 1, center: 'sacral', planet: 'northNode', epoch: 'design', longitude: 252.06792605259204 },
    { gate: 35, line: 1, center: 'throat', planet: 'southNode', epoch: 'design', longitude: 72.06792605259204 },
    { gate: 38, line: 1, center: 'root', planet: 'earth', epoch: 'design', longitude: 279.53809912562656 },
  ],
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const data = searchParams.get('real') === '1' ? realData : sampleData;

  const pages: React.ReactElement[] = [
    React.createElement(Page01VehicleDivider, { data: data as any, key: 'p1' }),
    React.createElement(Page02Definition, { data: data as any, key: 'p2' }),
    React.createElement(Page02Gates, { key: 'p2a' }),
    React.createElement(Page02Bodygraph, { data: data as any, key: 'p2b' }),
  ];
  if (hasBridgePage(data as any)) {
    pages.push(React.createElement(Page03Bridges, { data: data as any, key: 'p3' }));
  }
  pages.push(React.createElement(Page04Circuitry, { data: data as any, key: 'p4' }));
  pages.push(React.createElement(Page05IncarnationCross, { data: data as any, key: 'p5' }));
  pages.push(React.createElement(Page06Godhead, { data: data as any, key: 'p6' }));
  pages.push(React.createElement(Page07GodheadLightShadow, { data: data as any, key: 'p7' }));
  pages.push(React.createElement(Page08Variables, { data: data as any, key: 'p8' }));

  const synthesis = await generateVehicleSynthesis(data as any);
  pages.push(React.createElement(Page09Synthesis, {
    data: { ...data, vehicleSynthesis: synthesis.text, vehicleSynthesisSource: synthesis.source } as any,
    key: 'p9',
  }));

  const doc = React.createElement(Document, {}, ...pages);
  const buffer = await renderToBuffer(doc as any);
  return new Response(Buffer.from(buffer), {
    headers: { 'Content-Type': 'application/pdf' },
  });
}
