import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildDailySignal, overallLamp, roadLamp, stoplightLamp, vehicleLamp,
  type Lamp, type VehicleGateData,
} from '../../src/lib/app/signal';

const lamp = (state: Lamp['state']): Lamp => ({ state, reason: '' });

const CHANNELS: ReadonlyArray<readonly [number, number]> = [[34, 57], [20, 34], [12, 22], [1, 8]];
const CENTER: Record<number, string> = { 34: 'sacral', 57: 'spleen', 20: 'throat', 12: 'throat', 22: 'solar_plexus', 1: 'g_center', 8: 'throat' };

function vehicle(over: Partial<VehicleGateData>): VehicleGateData {
  return {
    type: 'Generator',
    authority: 'Sacral',
    natalGates: [],
    undefinedCenters: [],
    transit: { sun: 1, moon: 2 },
    channels: CHANNELS,
    gateCenter: CENTER,
    ...over,
  };
}

test('Road lamp follows the number pace from the knowledge base', () => {
  for (const n of [1, 3, 5, 8]) assert.equal(roadLamp({ number: n, label: 'x' }).state, 'go', `${n} is go`);
  for (const n of [2, 4, 6]) assert.equal(roadLamp({ number: n, label: 'x' }).state, 'slow', `${n} is slow`);
  for (const n of [7, 9]) assert.equal(roadLamp({ number: n, label: 'x' }).state, 'pause', `${n} is pause`);
});

test('master numbers use their foundation number', () => {
  assert.equal(roadLamp({ number: 11, root: 2, label: 'x' }).state, 'slow');
  assert.equal(roadLamp({ number: 22, root: 4, label: 'x' }).state, 'slow');
  assert.equal(roadLamp({ number: 33, root: 6, label: 'x' }).state, 'slow');
  assert.match(roadLamp({ number: 11, root: 2, label: 'Inspiration' }).reason, /Personal Day 11\/2/);
});

test('Stoplight lamp: quiet and flow are Go, friction is Slow, peak friction is Pause', () => {
  assert.equal(stoplightLamp(null, null).state, 'go');
  assert.equal(stoplightLamp({ nature: 'flow', peak: true }, 'Venus trine your Sun').state, 'go');
  assert.equal(stoplightLamp({ nature: 'neutral', peak: false }, null).state, 'go');
  assert.equal(stoplightLamp({ nature: 'friction', peak: false }, 'Mars square your Moon').state, 'slow');
  assert.equal(stoplightLamp({ nature: 'friction', peak: true }, 'Mars square your Moon').state, 'pause');
});

test('Vehicle lamp: a transit gate that completes your channel is a Go spark', () => {
  const l = vehicleLamp(vehicle({ natalGates: [57], transit: { sun: 34, moon: 2 } }));
  assert.equal(l.state, 'go');
  assert.match(l.reason, /completes your Channel 34-57/);
  assert.match(l.reason, /not a decision/);
});

test('Vehicle lamp: repeating a channel you already hold is companionship and Go', () => {
  const l = vehicleLamp(vehicle({ natalGates: [34, 57], transit: { sun: 2, moon: 34 } }));
  assert.equal(l.state, 'go');
  assert.match(l.reason, /already hold/);
});

test('Vehicle lamp: a gate in an open center is amplified and Slow', () => {
  const l = vehicleLamp(vehicle({ natalGates: [1], undefinedCenters: ['throat'], transit: { sun: 12, moon: 2 } }));
  assert.equal(l.state, 'slow');
  assert.match(l.reason, /amplified/);
});

test('Vehicle lamp: a gate in a defined center is just flavor and Go', () => {
  const l = vehicleLamp(vehicle({ natalGates: [1], undefinedCenters: [], transit: { sun: 12, moon: 2 } }));
  assert.equal(l.state, 'go');
});

test('Vehicle lamp: Sun and Moon making a channel against one natal gate is a Slow compromise', () => {
  const l = vehicleLamp(vehicle({ natalGates: [34], transit: { sun: 34, moon: 57 } }));
  assert.equal(l.state, 'slow');
  assert.match(l.reason, /compromise/);
});

test('Emotional authority and Reflectors are never shown a plain Go', () => {
  const base = { natalGates: [57], transit: { sun: 34, moon: 2 } } as const;
  const emotional = vehicleLamp(vehicle({ ...base, authority: 'Emotional' }));
  assert.equal(emotional.state, 'slow');
  assert.match(emotional.reason, /no truth in the now/);
  const reflector = vehicleLamp(vehicle({ ...base, type: 'Reflector', authority: 'Lunar' }));
  assert.equal(reflector.state, 'slow');
  assert.match(reflector.reason, /28 days/);
  assert.equal(vehicleLamp(vehicle({ ...base })).state, 'go', 'Sacral authority keeps the Go');
});

test('overall lamp is a plain tally: go 0, slow 1, pause 2', () => {
  assert.equal(overallLamp([lamp('go'), lamp('go'), lamp('go')]).state, 'go');
  assert.equal(overallLamp([lamp('slow'), lamp('go'), lamp('go')]).state, 'go');
  assert.equal(overallLamp([lamp('pause'), lamp('go'), lamp('go')]).state, 'slow');
  assert.equal(overallLamp([lamp('slow'), lamp('slow'), lamp('go')]).state, 'slow');
  assert.equal(overallLamp([lamp('pause'), lamp('slow'), lamp('slow')]).state, 'pause');
  assert.equal(overallLamp([lamp('pause'), lamp('pause'), lamp('go')]).state, 'pause');
});

test('every overall reason says these are conditions and that Authority decides', () => {
  const o = overallLamp([lamp('go'), lamp('slow'), lamp('pause')]);
  assert.match(o.reason, /3 lenses read: 1 go, 1 slow, 1 pause/);
  assert.match(o.reason, /conditions, not a decision/);
  assert.match(o.reason, /Strategy and Authority decide/);
});

test('without Human Design data there is no Vehicle lamp and the overall uses two', () => {
  const s = buildDailySignal({
    personal: { number: 7, label: 'Reflection' },
    top: { nature: 'friction', peak: true },
    topTitle: 'Mars square your Moon',
    vehicle: null,
  });
  assert.equal(s.vehicle, null);
  assert.equal(s.road.state, 'pause');
  assert.equal(s.stoplight.state, 'pause');
  assert.equal(s.overall.state, 'pause');
  assert.match(s.overall.reason, /2 lenses read/);
});
