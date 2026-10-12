import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { LAMP_WORD, VERDICT_LAMP, lampForChoice, spokenChecks, verdictFor } from '../../mobile/src/lib/practiceLamps';

const read = (p: string) => readFileSync(new URL(`../../${p}`, import.meta.url), 'utf8');

test('every answer lights one lamp, and nothing chosen lights none', () => {
  assert.equal(lampForChoice('vehicle', 'yes'), 'go');
  assert.equal(lampForChoice('vehicle', 'unclear'), 'slow');
  assert.equal(lampForChoice('vehicle', 'no'), 'pause');
  assert.equal(lampForChoice('road', 'toward'), 'go');
  assert.equal(lampForChoice('road', 'away'), 'pause');
  assert.equal(lampForChoice('stoplight', 'yellow'), 'slow');
  assert.equal(lampForChoice('stoplight', undefined), null);
  assert.equal(lampForChoice('stoplight', 'nope'), null);
});

test('every verdict maps to Go, Slow or Pause, and the words are the app\'s own', () => {
  assert.deepEqual(Object.keys(VERDICT_LAMP).sort(), ['decline', 'proceed', 'reconsider', 'wait']);
  assert.equal(VERDICT_LAMP.proceed, 'go');
  assert.equal(VERDICT_LAMP.reconsider, 'slow');
  assert.equal(VERDICT_LAMP.wait, 'pause');
  assert.equal(VERDICT_LAMP.decline, 'pause');
  assert.deepEqual(LAMP_WORD, { go: 'Go', slow: 'Slow', pause: 'Pause' });
});

test('the verdict lamp agrees with the decision rule for the same answers', () => {
  assert.equal(VERDICT_LAMP[verdictFor('yes', 'toward', 'green')], 'go');
  assert.equal(VERDICT_LAMP[verdictFor('yes', 'away', 'green')], 'slow');
  assert.equal(VERDICT_LAMP[verdictFor('yes', 'toward', 'red')], 'pause');
  assert.equal(VERDICT_LAMP[verdictFor('no', 'toward', 'green')], 'pause');
});

test('a screen reader hears each check and its lamp', () => {
  assert.equal(
    spokenChecks({ vehicle: 'yes', road: 'unsure' }),
    'Your Authority: Go. Your Road: Slow. The Stoplight: not answered.',
  );
});

test('Practice opens on the week, says what each part does, and closes a day with a moment', () => {
  const practice = read('mobile/src/app/(tabs)/practice.tsx');
  assert.match(practice, /useState<Mode>\('week'\)/);
  assert.match(practice, /value: 'week', label: 'My week'/);
  assert.match(practice, /EXPLAIN\[mode\]/);
  const week = read('mobile/src/components/practice/SevenDay.tsx');
  assert.match(week, /Day \$\{day\} complete/);
  assert.match(week, /isReduceMotionEnabled/);
  const decide = read('mobile/src/components/practice/DecideFlow.tsx');
  assert.match(decide, /Three checks, in this order/);
  assert.match(decide, /VERDICT_LAMP\[verdict\]/);
});
