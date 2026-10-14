import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MAX_ALERTS, NO_ALERTS, outOfQuietHours, planAlerts, type AlertPrefs, type AlertSource,
} from '../../mobile/src/lib/personalAlerts';

const at = (h: number, day = 15) => new Date(2030, 5, day, h, 0, 0).toISOString();
const NOW = new Date(2030, 5, 14, 12, 0, 0).getTime();
const ALL: AlertPrefs = { gate: true, moonChannel: true, moonSign: true };

const source: AlertSource = {
  gateToday: { gates: [{ gate: 5, name: 'Fixed Rhythms', from: null }], moon: [] },
  gateDays: [
    { gates: [{ gate: 14, name: 'Power Skills', from: at(10) }], moon: [{ gate: 2, channel: '2-14', channelName: 'The Beat', from: at(15) }] },
    { gates: [], moon: [] },
  ],
  moonDays: [{ segments: [{ sign: 'Leo', house: 3, from: null }, { sign: 'Virgo', house: 4, from: at(12) }] }],
};

test('nothing is planned when every category is off, or there is no timeline', () => {
  assert.deepEqual(planAlerts(source, NO_ALERTS, NOW), []);
  assert.deepEqual(planAlerts(null, ALL, NOW), []);
});

test('each category produces its own alert, earliest first, with plain factual wording', () => {
  const list = planAlerts(source, ALL, NOW);
  assert.deepEqual(list.map((a) => a.kind), ['gate', 'moonSign', 'moonChannel']);
  assert.equal(list[0].title, 'The Sun enters Gate 14');
  assert.equal(list[1].title, 'The Moon moves into Virgo');
  assert.match(list[1].body, /4th house/);
  assert.equal(list[2].title, 'The Moon completes Channel 2-14');
  for (const a of list) assert.ok(a.id.startsWith('alert-'));
});

test('a category that is off is left out', () => {
  const list = planAlerts(source, { ...NO_ALERTS, moonSign: true }, NOW);
  assert.deepEqual(list.map((a) => a.kind), ['moonSign']);
});

test('stretches already under way (no start time) and past events are skipped', () => {
  const list = planAlerts(source, ALL, new Date(2030, 5, 15, 13, 0, 0).getTime());
  assert.deepEqual(list.map((a) => a.kind), ['moonChannel']);
});

test('the same event twice gives one alert', () => {
  const dup: AlertSource = { gateDays: [{ gates: [{ gate: 14, name: 'x', from: at(10) }] }, { gates: [{ gate: 14, name: 'x', from: at(10) }] }] };
  assert.equal(planAlerts(dup, ALL, NOW).length, 1);
});

test('quiet hours push a night-time alert to 7 in the morning', () => {
  assert.equal(new Date(outOfQuietHours(new Date(2030, 5, 15, 3, 0).getTime())).getHours(), 7);
  const late = new Date(outOfQuietHours(new Date(2030, 5, 15, 23, 0).getTime()));
  assert.equal(late.getDate(), 16);
  assert.equal(late.getHours(), 7);
  const noon = new Date(2030, 5, 15, 12, 0).getTime();
  assert.equal(outOfQuietHours(noon), noon);
});

test('never more than the cap', () => {
  const many: AlertSource = {
    moonDays: [{ segments: Array.from({ length: 100 }, (_, i) => ({ sign: `S${i}`, house: 1, from: new Date(2030, 6, 1, 9, i).toISOString() })) }],
  };
  assert.equal(planAlerts(many, ALL, NOW).length, MAX_ALERTS);
});
