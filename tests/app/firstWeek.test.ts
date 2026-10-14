import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { JOURNEY_DAYS, SHOWN, STEPS, dayNumber, dayOf, doneSuffix, journeyHint, journeyView, stepSpoken, type JourneyInput } from '../../mobile/src/lib/journey';
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

test('when everything is done the card lists every step, each marked done', () => {
  const v = journeyView({ ...base, visited: { chart: true, readings: true, timeline: true } });
  assert.equal(v.allDone, true);
  assert.equal(v.steps.length, 3);
  assert.ok(v.all.every((s) => s.done));
});

test('the card goes away when dismissed and after two weeks', () => {
  assert.equal(journeyView({ ...base, dismissed: true }).show, false);
  assert.equal(journeyView({ ...base, today: '2026-10-26' }).show, true);
  assert.equal(journeyView({ ...base, today: '2026-10-27' }).show, false);
  assert.equal(JOURNEY_DAYS, 14);
});

test('the card says what it is for, in plain words, and the spoken label gives day, step and action', () => {
  assert.equal(journeyHint(5), 'Five small steps to get to know your chart. One a day is plenty.');
  assert.equal(journeyHint(3), 'Three small steps to get to know your chart. One a day is plenty.');
  assert.equal(dayOf(1, 5), 'Day 2 of 5');
  assert.equal(
    stepSpoken(0, 5, { label: 'Open My Chart and see your Triad', detail: 'Your Vehicle, Road and Stoplight in one picture.', cta: 'Open My Chart', done: false }),
    'Day 1 of 5. Open My Chart and see your Triad. Your Vehicle, Road and Stoplight in one picture. Open My Chart.',
  );
  assert.match(stepSpoken(1, 5, { label: 'x', detail: 'y', cta: 'z', done: true }), /^Day 2 of 5, done\./);
});

test('each step has a button that names where it goes', () => {
  for (const s of STEPS) assert.ok(s.cta.length > 4 && /^(Open|Start)/.test(s.cta), s.key);
  assert.deepEqual(STEPS.map((s) => s.cta), ['Open My Chart', 'Open Readings', 'Open Timeline', 'Start a decision', 'Open My Tribe']);
});

test('the card is one slim tile: the whole tile opens the step, numbered pills switch days, no gold button', () => {
  const card = readFileSync('mobile/src/components/JourneyCard.tsx', 'utf8');
  assert.match(card, /accessibilityRole="tab"/);
  assert.match(card, /router\.push\(step\.route/);
  assert.match(card, /v\.doneCount === 0 \? <Text style=\{styles\.hint\}>/);
  assert.doesNotMatch(card, /GoldButton/);
  assert.doesNotMatch(card, /surfaceRaised/);
  assert.match(card, /reduce \? undefined : FadeIn/);
});

test('the pills are a sequence: every day up to the one you are on is lit with a tick, later days are dim with a number', () => {
  const card = readFileSync('mobile/src/components/JourneyCard.tsx', 'utf8');
  const block = (name: string) => new RegExp(`${name}: \\{([^}]*)\\}`).exec(card)![1]!;
  assert.match(card, /const lit = i <= litTo;/);
  assert.match(card, /lit \? '✓' : String\(i \+ 1\)/);
  assert.match(block('pillLit'), /backgroundColor: colors\.gold/);
  assert.doesNotMatch(block('pill'), /backgroundColor/);
  assert.doesNotMatch(card, /pillCurrent|pillDone|s\.done \? '✓'/);
  // A dim pill can never carry a tick: the tick and the fill come from the same condition.
  assert.equal((card.match(/'✓'/g) ?? []).length, 1);
  assert.equal(doneSuffix(0), '');
  assert.equal(doneSuffix(2), '  ·  2 done');
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
  const today = readFileSync('mobile/src/app/(tabs)/today.tsx', 'utf8');
  assert.match(today, /<JourneyCard \/>/);
  // The signal comes first: the card and the reminder question sit below it.
  assert.ok(today.indexOf('<SignalLamp') < today.indexOf('<JourneyCard'));
  assert.ok(today.indexOf('<SignalLamp') < today.indexOf('<ReminderPrompt'));
  assert.match(readFileSync('mobile/src/app/(tabs)/_layout.tsx', 'utf8'), /markVisited\(current\)/);
  assert.match(readFileSync('mobile/src/app/your-data.tsx', 'utf8'), /useJourneyStore\.getState\(\)\.clearAll\(\)/);
});

test('the old unused tour is gone', () => {
  assert.equal(existsSync('mobile/src/components/CoachTour.tsx'), false);
});

test('every step can be paged back to, and the card opens on the first step not done', () => {
  const v = journeyView({ ...base, premium: true, visited: { chart: true, readings: true } });
  assert.deepEqual(v.all.map((s) => s.key), ['chart', 'readings', 'timeline', 'practice', 'tribe']);
  assert.equal(v.all[v.firstOpen]!.key, 'timeline');
  assert.equal(v.all[0]!.done, true);
  assert.equal(journeyView({ ...base, visited: { chart: true, readings: true, timeline: true } }).firstOpen, 0);
  const card = readFileSync('mobile/src/components/JourneyCard.tsx', 'utf8');
});

test('"Show the welcome note again" brings the first-week card back too', () => {
  const s = readFileSync('mobile/src/app/your-data.tsx', 'utf8');
  assert.match(s, /useCoachStore\.getState\(\)\.replay\(\);\n\s+useJourneyStore\.getState\(\)\.clearAll\(\);/);
});

test('every first start-up brings back the welcome note and the first-week card', async () => {
  const { isFirstIntroduction } = await import('../../mobile/src/lib/firstTime');
  assert.equal(isFirstIntroduction(false, undefined), true); // brand new, or after Delete my data
  assert.equal(isFirstIntroduction(true, '1990-05-04'), true); // came through the welcome screen, including the preview
  assert.equal(isFirstIntroduction(true, undefined), false); // only editing birth details from My Chart
  const onboarding = readFileSync('mobile/src/app/onboarding.tsx', 'utf8');
  assert.match(onboarding, /isFirstIntroduction\(useT3DStore\.getState\(\)\.chart !== null, startDate\)/);
  assert.match(onboarding, /useCoachStore\.getState\(\)\.replay\(\);\s*useJourneyStore\.getState\(\)\.clearAll\(\);/);
});
