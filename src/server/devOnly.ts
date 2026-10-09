/**
 * Guard for internal routes that exist only for working on the project
 * (PDF previews, debug pages). In production they answer "not found", exactly as
 * if the route did not exist. On your own computer (`npm run dev`) they work as before.
 */

export function devOnlyGuard(): Response | null {
  if (process.env.NODE_ENV === 'production') {
    return new Response('Not found', { status: 404, headers: { 'Cache-Control': 'no-store' } });
  }
  return null;
}
