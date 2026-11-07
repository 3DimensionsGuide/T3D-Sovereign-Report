// @next/env is CommonJS, so it comes in as a default export rather than a named one.
import nextEnv from '@next/env';
const { loadEnvConfig } = nextEnv;
import postgres from 'postgres';
loadEnvConfig(process.cwd(), true, { info: () => {}, error: () => {} });
const client = postgres(process.env.DATABASE_URL, { max: 1, onnotice: () => {} });
try {
  const col = await client`
    SELECT column_name, data_type, column_default, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'leads' AND column_name = 'session_epoch'`;
  if (col.length === 0) {
    console.log('session_epoch: NOT THERE — the migration has not run');
    process.exitCode = 1;
  } else {
    const c = col[0];
    console.log(`session_epoch: present  (${c.data_type}, default ${c.column_default}, nullable ${c.is_nullable})`);
    const rows = await client`SELECT count(*)::int AS n, min(session_epoch)::int AS lo, max(session_epoch)::int AS hi FROM leads`;
    console.log(`leads: ${rows[0].n} row(s), session_epoch between ${rows[0].lo ?? '-'} and ${rows[0].hi ?? '-'}`);
  }
} catch (e) {
  console.log('Could not check:', e.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
