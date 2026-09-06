import fs from 'node:fs/promises';
import path from 'node:path';
import mysql from 'mysql2/promise';

const root = process.cwd();

async function loadLocalEnv() {
  try {
    const envFile = await fs.readFile(path.join(root, '.env.local'), 'utf8');

    for (const line of envFile.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      const separatorIndex = trimmed.indexOf('=');
      if (separatorIndex === -1) continue;

      const key = trimmed.slice(0, separatorIndex);
      let value = trimmed.slice(separatorIndex + 1);

      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }

      process.env[key] ||= value;
    }
  } catch {
    // Environment variables may already be set.
  }
}

await loadLocalEnv();

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is required.');
  process.exit(1);
}

const connectionUrl = new URL(process.env.DATABASE_URL);
const client = await mysql.createConnection({
  host: connectionUrl.hostname,
  port: Number(connectionUrl.port || 3306),
  user: decodeURIComponent(connectionUrl.username),
  password: decodeURIComponent(connectionUrl.password),
  database: connectionUrl.pathname.replace(/^\//, ''),
});

try {
  const [beforeRows] = await client.query('SELECT COUNT(*) AS count FROM users');
  await client.query('DELETE FROM users');
  const [afterRows] = await client.query('SELECT COUNT(*) AS count FROM users');

  console.log(JSON.stringify({
    usersBefore: Number(beforeRows[0].count),
    usersAfter: Number(afterRows[0].count),
  }));
} finally {
  await client.end();
}
