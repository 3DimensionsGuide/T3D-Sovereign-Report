import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const read = (p: string) => readFileSync(new URL(`../../${p}`, import.meta.url), 'utf8');

const route = read('src/app/api/app/vehicle/route.ts');
const api = read('mobile/src/lib/api.ts');
const hook = read('mobile/src/lib/useVehicle.ts');
const reading = read('mobile/src/components/readings/VehicleReading.tsx');
const chartTab = read('mobile/src/app/(tabs)/chart.tsx');
const types = read('mobile/src/lib/vehicleTypes.ts');
const glossary = read('src/lib/app/glossary.ts');

test('the vehicle route is told whether the birth time is known', () => {
  assert.match(route, /const birthTimeKnown = body\.birthTimeKnown !== false;/);
  // Absent means known, so an older app reads exactly as it did before.
  assert.match(route, /body = \{\};/);
  // And the session check still comes before the body, as it does on every app route.
  assert.ok(
    route.indexOf('await authenticateApp(request)') < route.indexOf('await request.json()'),
    'the body is parsed before the session is checked',
  );
});

test('the route works out the Profile rather than stating it flat', () => {
  assert.match(route, /profileReading\(activeGates, profileValue, birthTimeKnown\)/);
  assert.match(route, /certain: profileCertainty\.certain/);
  assert.match(route, /options: profileCertainty\.options/);
  assert.match(route, /reads: alsoReads\(profileCertainty\)/);
  assert.match(route, /timeNote: timeUnknownNote\(birthTimeKnown\)/);
});

test('a chart with a birth time is sent exactly what it was sent before', () => {
  // Certainty rides along only where there is something to say, so a payload for a chart with a
  // birth time does not grow by twenty-six empty objects.
  assert.match(route, /\.\.\.\(uncertain \? \{ certainty: c \} : \{\}\)/);
});

test('the app sends the flag and keys its cache on it', () => {
  assert.match(api, /requestVehicle\(birthTimeKnown: boolean\)/);
  assert.match(api, /'\/api\/app\/vehicle',\s*\{ birthTimeKnown \}/);
  // In the key as well as the request: a copy saved before a birth time was added must not be
  // served afterwards as though it had one.
  assert.match(hook, /vehicle\|\$\{leadId\}\|\$\{birthTimeKnown \? 'time' : 'notime'\}/);
  assert.match(hook, /requestVehicle\(birthTimeKnown\)/);
});

test('the Vehicle reading shows the short list and says why', () => {
  assert.match(reading, /useVehicle\(chart\?\.leadId, birthTimeKnown\)/);
  // Two possibilities read inline; the explanation only appears when there is one to give.
  assert.match(reading, /data\.profile\.reads \?\? data\.profile\.value/);
  assert.match(reading, /data\.profile\.certain === false/);
  assert.match(reading, /WHY THIS ONE IS NOT SETTLED/);
  assert.match(reading, /listOptions\(data\.profile\.options \?\? \[\]\)/);
});

test('the chart tab says a Profile is unsettled, as it already did for the Rising sign', () => {
  assert.match(chartTab, /const profileNote = profile\.birthTimeKnown/);
  assert.match(chartTab, /profileNote \? <Text style=\{styles\.note\}>\{profileNote\}<\/Text> : null/);
  // The two notes read alike, because they are the same kind of admission.
  assert.match(chartTab, /Rising sign uses 12:00 noon/);
  assert.match(chartTab, /Profile uses 12:00 noon/);
});

test('the new fields are optional, so an older server does not break the app', () => {
  assert.match(types, /certain\?: boolean;/);
  assert.match(types, /options\?: string\[\];/);
  assert.match(types, /reads\?: string \| null;/);
  assert.match(types, /certainty\?: \{ gate: Certainty; line: Certainty \};/);
  assert.match(types, /timeNote\?: string \| null;/);
});

test('the Profile glossary entry explains what a birth time is for', () => {
  const entry = glossary.slice(glossary.indexOf("add('hd:profile'"));
  const body = entry.slice(0, entry.indexOf('], ['));
  assert.match(body, /birth time/);
  assert.match(body, /once a day/);
  // It has to say the list can be narrowed but not settled, which is the actual situation.
  assert.match(body, /never settle it/);
});
