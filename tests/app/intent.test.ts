import test from 'node:test';
import assert from 'node:assert/strict';
import { INTENTS, intentPlan, isIntent } from '../../mobile/src/lib/intent';

test('every intent has a plan for free and Premium, and a button always has a target', () => {
  for (const { id } of INTENTS) {
    for (const premium of [false, true]) {
      const plan = intentPlan(id, premium);
      assert.ok(plan.line.length > 20, id);
      assert.equal(plan.href === null, plan.button === null, `${id}: button and target go together`);
    }
  }
});

test('a free person is never sent to the Premium Practice tab', () => {
  assert.equal(intentPlan('decide', false).href, null);
  assert.equal(intentPlan('together', false).href, null);
  assert.equal(intentPlan('decide', true).href, '/practice');
});

test('isIntent accepts only the four answers', () => {
  assert.ok(isIntent('timing'));
  assert.ok(!isIntent('other'));
  assert.ok(!isIntent(null));
});
