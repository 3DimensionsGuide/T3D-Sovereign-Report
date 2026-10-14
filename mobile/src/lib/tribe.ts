import type { PartnerProfile, TribeMember, TribeRelation } from '@/lib/togetherTypes';

/** The most people one phone keeps in My Tribe. */
export const MAX_TRIBE = 12;

export const RELATION_OPTIONS: ReadonlyArray<{ value: TribeRelation; label: string }> = [
  { value: 'friend', label: 'Friend' },
  { value: 'romantic', label: 'Romantic' },
];

export const RELATION_LABEL: Record<TribeRelation, string> = { friend: 'Friend', romantic: 'Romantic' };

/** What the reading is about, in the words that fit how you know them. */
export const RELATION_LINE: Record<TribeRelation, string> = {
  friend: 'How the two of you trust, show up and make plans together.',
  romantic: 'How the two of you spark, communicate and make decisions together.',
};

/** The words on the button that opens a person's reading. */
export function readLabel(name: string): string {
  return `Read your connection with ${name}`;
}

export function makeId(now: number, random: number): string {
  return `${now.toString(36)}${Math.floor(random * 1e6).toString(36)}`;
}

export function newMember(profile: PartnerProfile, relation: TribeRelation, now = Date.now(), random = Math.random()): TribeMember {
  return { id: makeId(now, random), relation, profile, addedAt: new Date(now).toISOString() };
}

export function canAdd(people: readonly TribeMember[]): boolean {
  return people.length < MAX_TRIBE;
}

/** Romantic first, then friends; each group in the order added. */
export function groupTribe(people: readonly TribeMember[]): Array<{ relation: TribeRelation; title: string; members: TribeMember[] }> {
  const groups: Array<{ relation: TribeRelation; title: string; members: TribeMember[] }> = [
    { relation: 'romantic', title: 'Romantic', members: people.filter((p) => p.relation === 'romantic') },
    { relation: 'friend', title: 'Friends', members: people.filter((p) => p.relation === 'friend') },
  ];
  return groups.filter((g) => g.members.length > 0);
}

/** The count line under the My Tribe heading. */
export function tribeCountLine(count: number): string {
  if (count === 0) return 'No one yet';
  return count === 1 ? '1 person' : `${count} people`;
}

/** Older versions kept one person as `partner`. They become the first member of the tribe, as a friend. */
export function migratePartnerState(old: unknown): { people: TribeMember[] } {
  const partner = (old as { partner?: PartnerProfile | null } | null)?.partner;
  if (partner && typeof partner.label === 'string') {
    return { people: [{ id: 'first', relation: 'friend', profile: partner, addedAt: new Date(0).toISOString() }] };
  }
  return { people: [] };
}
