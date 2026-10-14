/**
 * Whether a finished start-up counts as someone's first introduction to the app, so Today shows the welcome
 * note and the first-week card from the start. True for a brand-new person (no chart yet) and for anyone who came
 * through the welcome screen (it passes their birth date along), including the preview from About. False when
 * someone only edits their birth details from My Chart, who has already been welcomed.
 */
export function isFirstIntroduction(hadChart: boolean, startDate: string | undefined): boolean {
  return !hadChart || Boolean(startDate);
}
