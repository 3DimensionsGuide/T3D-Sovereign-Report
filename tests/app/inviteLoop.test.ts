import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { cardInviteMessage, inviteFollowUp } from '../../mobile/src/lib/invite';
import { isAppEvent } from '../../src/lib/app/events';

test('the follow-up names the friend and their Type, and says what the person gets', () => {
  const a = inviteFollowUp('Sam', 'Projector');
  assert.equal(a.title, 'Now see your own');
  assert.match(a.body, /^Sam is a Projector\./);
  assert.match(a.body, /about a minute/);
  assert.match(inviteFollowUp(null, null).body, /^Your friend has a chart too\./);
  assert.doesNotMatch(inviteFollowUp('  ', 'Generator').body, /undefined|null/);
});

test('the card message holds one link only, last, on its own line', () => {
  const m = cardInviteMessage('My T3D Triad', 'https://3dimensions.guide/i/abc');
  assert.equal(m, 'My T3D Triad. Want to see how our charts fit?\nhttps://3dimensions.guide/i/abc');
  assert.equal((m.match(/https?:\/\//g) ?? []).length, 1);
  assert.ok(m.endsWith('/i/abc'));
});

test('sharing with an invite replaces the card link instead of adding a second one', () => {
  const s = readFileSync('mobile/src/app/share-card.tsx', 'utf8');
  assert.match(s, /return cardInviteMessage\(label, url\)/);
  assert.match(s, /await messageFor\(label, `\$\{label\} · \$\{LINKS\[kind\]\}`\)/);
  assert.doesNotMatch(s, /addInvite/);
});

test('the two new counts are on both lists', () => {
  assert.ok(isAppEvent('action_invite_viewed') && isAppEvent('action_invite_chart_started'));
  assert.match(readFileSync('mobile/src/lib/track.ts', 'utf8'), /'invite_viewed', 'invite_chart_started'/);
});

test('someone opening an invite sees the make-a-chart step before and after the long reading', () => {
  const s = readFileSync('mobile/src/app/invite/[token].tsx', 'utf8');
  assert.equal((s.match(/<MakeChartCard /g) ?? []).length, 2);
  assert.ok(s.indexOf('<MakeChartCard') < s.indexOf('<TogetherReading'));
  assert.match(s, /trackAction\('invite_chart_started'\)/);
  assert.match(s, /trackAction\('invite_viewed'\)/);
});

test('sharing a card can add an invite link, off by default, and never for the wallpaper', () => {
  const s = readFileSync('mobile/src/app/share-card.tsx', 'utf8');
  assert.match(s, /useState\(false\);\n  const \[withInvite/);
  assert.match(s, /Let friends compare charts with me/);
  assert.match(s, /kind !== 'wallpaper' \? \(\n        <>\n          <View style=\{styles\.switchRow\}>\n            <Text style=\{styles\.switchLabel\}>Let friends/);
  assert.match(s, /await messageFor\(/);
});
