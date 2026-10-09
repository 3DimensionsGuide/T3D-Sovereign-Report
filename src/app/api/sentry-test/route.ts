/**
 * Development only. Throws an error on purpose so you can see it arrive in Sentry:
 *   npm run dev, then open http://localhost:3000/api/sentry-test
 * In production this answers "not found", like the other internal routes.
 */

import { devOnlyGuard } from '@/server/devOnly';

export async function GET(): Promise<Response> {
  const blocked = devOnlyGuard();
  if (blocked) return blocked;
  throw new Error('T3D test error from the website (test address: test@example.com)');
}
