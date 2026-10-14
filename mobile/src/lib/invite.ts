/** Words and rules for invites. Pure, with no imports, so tests can use it directly. */

/** The message that goes with the invite link. The name is only used when the sender chose to show it. */
export function inviteMessage(firstName: string | null, url: string): string {
  const who = firstName && firstName.trim() ? firstName.trim() : null;
  return `${who ? `${who} invited you` : 'You are invited'} to see how your charts fit together on T3D. Add your birth date, time and place to take a look: ${url}`;
}

/** The invite token from a deep link or a pasted link, or null when there is none. */
export function tokenFromLink(link: string): string | null {
  const m = /([0-9]{1,9}\.[0-3]\.[0-9]{1,12}\.[0-9a-f]{64})/.exec(link);
  return m ? m[1] : null;
}
