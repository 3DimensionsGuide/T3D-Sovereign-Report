/** Words and rules for invites. Pure, with no imports, so tests can use it directly. */

/** The message that goes with the invite link. The name is only used when the sender chose to show it. */
export function inviteMessage(firstName: string | null, url: string): string {
  const who = firstName && firstName.trim() ? firstName.trim() : null;
  return `${who ? `${who} invited you` : 'You are invited'} to see how your charts fit together on T3D. Add your birth date and take a look: ${url}`;
}

/** The invite token from a deep link or a pasted link, or null when there is none. */
export function tokenFromLink(link: string): string | null {
  const m = /([0-9]{1,9}\.[0-3]\.[0-9]{1,12}\.[0-9a-f]{64})/.exec(link);
  return m ? m[1] : null;
}

/** What the person is told to add for a more complete reading, depending on what they have given so far. */
export function completeNudge(has: { time: boolean; place: boolean }): { title: string; body: string } | null {
  if (has.time && has.place) return null;
  if (has.place) {
    return {
      title: 'Add your birth time',
      body: 'Your Moon, Rising sign, houses and exact Human Design depend on the minute you were born. Add it and this reading sharpens.',
    };
  }
  return {
    title: 'Add your birth time and place',
    body: 'Your Moon, Rising sign, houses and exact Human Design depend on the minute and the place you were born. Add them and this reading sharpens.',
  };
}
