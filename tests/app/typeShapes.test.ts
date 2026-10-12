import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spokenPair, typeShapeKind } from '../../mobile/src/lib/typeShapes';

test('Types map to their shapes, Manifesting Generator before Generator', () => {
  assert.equal(typeShapeKind('Manifesting Generator'), 'mg');
  assert.equal(typeShapeKind('Generator'), 'generator');
  assert.equal(typeShapeKind('Manifestor'), 'manifestor');
  assert.equal(typeShapeKind('Projector'), 'projector');
  assert.equal(typeShapeKind('Reflector'), 'reflector');
});

test('unknown Types have no shape', () => {
  assert.equal(typeShapeKind(null), null);
  assert.equal(typeShapeKind('Something else'), null);
});

test('spokenPair names both people and handles an unknown Type', () => {
  const s = spokenPair({ label: 'You', type: 'Projector' }, { label: 'Sam', type: null });
  assert.match(s, /You, Projector, drawn as/);
  assert.match(s, /Sam, Type depends on birth time/);
});
