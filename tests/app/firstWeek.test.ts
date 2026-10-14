import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { JOURNEY_DAYS, SHOWN, dayNumber, journeyTitle, journeyView, type JourneyInput } from '../../mobile/src/lib/journey';
import { REMINDER_LINES, reminderLine } from '../../mobile/src/lib/reminderLines';

const base: JourneyInput = { startedOn: '2026-10-13', today: '2026-10-13', dismissed: false, premium: false, visited: {}, decisions: 0, people: 0 };

test('day 1 is the first day; the count follows the calendar', () => {
  assert.equal(dayNumber('2026-10-13', '2026-10-13'), 1);
  assert.equal(dayNumber('2026-10-13', '2026-10-19'), 7);
  assert.equal(dayNumber('2026-10-30', '2026-11-02'), 4);
  assert.equal(dayNumber(null, '2026-10-13'), 1);
  assert.equal(dayNumber('2026-10-13', '2026-10-10'), 1);
});

test('someone without Premium is only offered steps they can open', () => {
  const v = journeyView(base);
  assert.equal(v.total, 3);
  assert.ok(v.steps.every((s) => !s.premium));
  assert.deepEqual(v.steps.map((s) => s.key), ['chart', 'readings', 'timeline']);
});

test('Premium adds the decision and My Tribe steps, and only three show at a time', () => {
  const v = journeyView({ ...base, premium: true });
  assert.equal(v.total, 5);
  assert.equal(v.steps.length, SHOWN);
  const later = journeyView({ ...base, premium: true, visited: { chart: true, readings: true, timeline: true } });
  assert.deepEqual(later.steps.map((s) => s.key), ['practice', 'tribe']);
  assert.equal(later.doneCount, 3);
});

test('steps tick off from what the person really did', () => {
  const v = journeyView({ ...base, premium: true, visited: { chart: true }, decisions: 2, people: 1 });
  assert.equal(v.doneCount, 3);
  assert.deepEqual(v.steps.map((s) => s.key), ['readings', 'timeline']);
});

test('when everything is done the card says so and lists every step', () => {
  const v = journeyView({ ...base, visited: { chart: true, readings: true, timeline: true } });
  assert.equal(v.allDone, true);
  assert.equal(v.steps.length, 3);
  assert.equal(journeyTitle(v), 'You have been through all of it');
});

test('the card goes away when dismissed and after two weeks', () => {
  assert.equal(journeyView({ ...base, dismissed: true }).show, false);
  assert.equal(journeyView({ ...base, today: '2026-10-26' }).show, true);
  assert.equal(journeyView({ ...base, today: '2026-10-27' }).show, false);
  assert.equal(JOURNEY_DAYS, 14);
});

test('titles: day count in week one, then a plain line', () => {
  assert.equal(journeyTitle({ dayNumber: 3, allDone: false }), 'Day 3 of your first week');
  assert.equal(journeyTitle({ dayNumber: 9, allDone: false }), 'A few things you have not tried yet');
});

test('the reminder has seven different wordings and none says anything about the day', () => {
  assert.equal(REMINDER_LINES.length, 7);
  assert.equal(new Set(REMINDER_LINES).size, 7);
  for (const l of REMINDER_LINES) {
    assert.match(l, /frame/i);
    assert.doesNotMatch(l, /go\b|slow|pause|lucky|great|difficult|energy|will |should/i);
  }
  assert.equal(reminderLine(1), REMINDER_LINES[0]);
  assert.equal(reminderLine(7), REMINDER_LINES[6]);
  assert.equal(reminderLine(8), REMINDER_LINES[0]);
});

test('the reminder is scheduled once for each weekday, and the card is wired into Today, the tabs and Delete my data', () => {
  const r = readFileSync('mobile/src/lib/reminder.ts', 'utf8');
  assert.match(r, /\[1, 2, 3, 4, 5, 6, 7\]\.map/);
  assert.match(r, /SchedulableTriggerInputTypes\.WEEKLY/);
  assert.match(readFileSync('mobile/src/app/(tabs)/today.tsx', 'utf8'), /<JourneyCard \/>/);
  assert.match(readFileSync('mobile/src/app/(tabs)/_layout.tsx', 'utf8'), /markVisited\(current\)/);
  assert.match(readFileSync('mobile/src/app/your-data.tsx', 'utf8'), /useJourneyStore\.getState\(\)\.clearAll\(\)/);
});

test('the old unused tour is gone', () => {
  assert.equal(existsSync('mobile/src/components/CoachTour.tsx'), false);
});
