export type TypeShapeKind = 'generator' | 'mg' | 'manifestor' | 'projector' | 'reflector';

/** Which drawn shape goes with a Human Design Type name, or null when the Type is not known. */
export function typeShapeKind(type: string | null): TypeShapeKind | null {
  if (!type) return null;
  const t = type.toLowerCase();
  if (t.includes('manifesting')) return 'mg';
  if (t.includes('generator')) return 'generator';
  if (t.includes('manifestor')) return 'manifestor';
  if (t.includes('projector')) return 'projector';
  if (t.includes('reflector')) return 'reflector';
  return null;
}

/** One plain sentence on how the shape is drawn, for screen readers. */
export const TYPE_SHAPE_SPOKEN: Record<TypeShapeKind, string> = {
  generator: 'a wide, open oval that draws things in',
  mg: 'a wide oval with a forward arrow, moving fast',
  manifestor: 'a closed circle with rays pointing out',
  projector: 'a narrow, pointed shape that focuses',
  reflector: 'a dashed ring that samples its surroundings',
};

/** The pair as one sentence, for the row that shows both shapes. */
export function spokenPair(a: { label: string; type: string | null }, b: { label: string; type: string | null }): string {
  const part = (p: { label: string; type: string | null }) => {
    const k = typeShapeKind(p.type);
    return k ? `${p.label}, ${p.type}, drawn as ${TYPE_SHAPE_SPOKEN[k]}` : `${p.label}, Type depends on birth time`;
  };
  return `${part(a)}. ${part(b)}.`;
}
