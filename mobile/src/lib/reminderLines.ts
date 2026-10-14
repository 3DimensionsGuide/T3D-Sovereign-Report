/**
 * The seven wordings of the daily reminder, one for each day of the week, so it does not read the same every morning.
 * Every line only says that Today's frame is ready. None says anything about the person's day.
 * Index 0 is Sunday (matching the weekday number the phone's scheduler uses, minus one).
 */
export const REMINDER_LINES: readonly string[] = [
  'Today’s frame is ready.',
  'A minute for today’s frame?',
  'Today’s frame is waiting.',
  'Your frame for today is ready.',
  'Take a look at today’s frame.',
  'Today’s frame, whenever you are ready.',
  'A quiet moment for today’s frame.',
];

/** The line for a weekday number from 1 (Sunday) to 7 (Saturday). */
export function reminderLine(weekday: number): string {
  return REMINDER_LINES[(((weekday - 1) % 7) + 7) % 7]!;
}
