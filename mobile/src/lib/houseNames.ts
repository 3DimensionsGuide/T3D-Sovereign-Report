/** Whole-sign house names, written the same way the readings and the report write them. */
export const HOUSE_NAMES: Record<number, string> = {
  1: 'Identity & First Impression', 2: 'Resources & Values',
  3: 'Communication & Local', 4: 'Home & Roots',
  5: 'Creativity & Expression', 6: 'Work & Daily Practice',
  7: 'Partnership & Relationship', 8: 'Depth & Transformation',
  9: 'Philosophy & Expansion', 10: 'Career & Reputation',
  11: 'Community & Vision', 12: 'Inner Life & Hidden Terrain',
};

/** "Resources & Values (house 2)", or "house 2" if the name is unknown, or null with no house. */
export function houseLabel(house: number | null | undefined): string | null {
  if (!house) return null;
  const name = HOUSE_NAMES[house];
  return name ? `${name} (house ${house})` : `house ${house}`;
}
