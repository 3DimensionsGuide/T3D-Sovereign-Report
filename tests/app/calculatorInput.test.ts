import assert from 'node:assert/strict';
import { test } from 'node:test';
import { validateInput } from '../../src/server/calculatorInput';
import { UNDER_AGE_MESSAGE } from '../../src/lib/ageGate';

const good = {
  firstName: 'Ana',
  lastName: 'Lee',
  email: 'ana@example.com',
  birthDate: '1990-05-05',
  birthPlace: { city: 'Austin, Texas', country: 'United States' },
};

test('a complete request passes', () => assert.equal(validateInput(good), null));

test('a name is always required', () => {
  assert.equal(validateInput({ ...good, firstName: ' ' }), 'firstName is required');
  assert.equal(validateInput({ ...good, lastName: '' }), 'lastName is required');
});

/**
 * The email rule. The app shows a chart before it asks for an address and attaches one
 * afterwards under its session token, so it alone may leave the field out — by saying so. Every
 * other caller must give one, which is what keeps the website calculator from writing a lead
 * nobody can be reached at if its email field ever stops arriving.
 */
test('an address is required unless the caller says one is coming', () => {
  const { email: _unused, ...noEmail } = good;
  assert.equal(validateInput(noEmail), 'A valid email is required');
  assert.equal(validateInput({ ...noEmail, emailLater: true }), null);
});

test('emailLater has to be exactly true, so a stray value cannot stand in for it', () => {
  const { email: _unused, ...noEmail } = good;
  for (const value of ['true', 1, {}, [], 'yes'] as unknown[]) {
    assert.equal(
      validateInput({ ...noEmail, emailLater: value as boolean }),
      'A valid email is required',
      `emailLater: ${JSON.stringify(value)} was accepted`,
    );
  }
});

test('an empty or blank address is treated as absent, not as a bad one', () => {
  // The app may send '' rather than omitting the key; it means the same thing and must not be
  // read as a malformed address.
  assert.equal(validateInput({ ...good, email: '   ', emailLater: true }), null);
  assert.equal(validateInput({ ...good, email: '' }), 'A valid email is required');
});

test('an address that is given is validated however the caller asked', () => {
  // emailLater is permission to omit one, never permission to send a broken one.
  assert.equal(validateInput({ ...good, email: 'not-an-address' }), 'A valid email is required');
  assert.equal(
    validateInput({ ...good, email: 'not-an-address', emailLater: true }),
    'A valid email is required',
  );
});

test('the birth date has to be a date, in the one format', () => {
  assert.equal(validateInput({ ...good, birthDate: '05/05/1990' }), 'birthDate must be in YYYY-MM-DD format');
  assert.equal(validateInput({ ...good, birthDate: undefined }), 'birthDate must be in YYYY-MM-DD format');
});

test('the age gate still runs, and runs after the format check', () => {
  const soon = new Date();
  soon.setFullYear(soon.getFullYear() - 5);
  const recent = soon.toISOString().slice(0, 10);
  assert.equal(validateInput({ ...good, birthDate: recent }), UNDER_AGE_MESSAGE);
});

test('a birth place needs both parts', () => {
  assert.equal(
    validateInput({ ...good, birthPlace: { city: '', country: 'United States' } }),
    'birthPlace.city is required',
  );
  assert.equal(
    validateInput({ ...good, birthPlace: { city: 'Austin', country: '  ' } }),
    'birthPlace.country is required',
  );
});
