import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { inviteMessage, tokenFromLink } from '../../mobile/src/lib/invite';

const read = (p: string) => readFileSync(p, 'utf8');
const TOKEN = `42.1.1893456000.${'a1'.repeat(32)}`;

test('the invite message uses the sender\'s name only when it is given', () => {
  assert.match(inviteMessage('Tyler', 'https://x/i/t'), /^Tyler invited you/);
  assert.match(inviteMessage(null, 'https://x/i/t'), /^You are invited/);
  assert.match(inviteMessage('  ', 'https://x/i/t'), /^You are invited/);
  assert.ok(inviteMessage('Tyler', 'https://x/i/t').endsWith('https://x/i/t'));
});

test('a token is found in a link and nowhere else', () => {
  assert.equal(tokenFromLink(`https://3dimensions.guide/i/${TOKEN}`), TOKEN);
  assert.equal(tokenFromLink(`t3d://invite/${TOKEN}`), TOKEN);
  assert.equal(tokenFromLink('https://3dimensions.guide/'), null);
  assert.equal(tokenFromLink('42.1.99.short'), null);
});

test('the server and the app agree on which screens are counted, including the invite screen', () => {
  const quoted = (src: string) => src.match(/'[a-z-]+'/g)!.sort();
  const app = quoted(/new Set\(\[([\s\S]*?)\]\)/.exec(read('mobile/src/lib/track.ts'))![1]);
  const server = quoted(/SCREENS = \[([\s\S]*?)\] as const/.exec(read('src/lib/app/events.ts'))![1]);
  assert.deepEqual(app, server);
  assert.ok(app.includes("'invite'"));
});

test('an invite never puts birth details in a link or stores them on the phone', () => {
  const screen = read('mobile/src/app/invite/[token].tsx');
  assert.doesNotMatch(screen, /AsyncStorage|usePartnerStore|setPartner/);
  const card = read('mobile/src/components/InviteCard.tsx');
  assert.doesNotMatch(card, /birthDate|latitude|longitude/);
  assert.match(screen, /router\.push\(\{ pathname: '\/onboarding', params: \{ birthDate:/);
});

test('someone without a chart must give birth date and place; the time may be marked unknown, as in onboarding', () => {
  const route = read('src/app/api/app/invite/route.ts');
  assert.match(route, /if \(!place \|\|/, 'the server refuses a missing place');
  const screen = read('mobile/src/app/invite/[token].tsx');
  assert.match(screen, /I do not know my birth time/);
  assert.match(screen, /requestPlaceCheck/);
  assert.doesNotMatch(screen, /UNLOCK THE COMPLETE READING|firstLook\(null, null\)/);
});
