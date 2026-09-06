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
    // .env.local is optional; environment variables may already be set.
  }
}

function getConnectionConfig() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is required.');
    process.exit(1);
  }

  const connectionUrl = new URL(process.env.DATABASE_URL);

  return {
    host: connectionUrl.hostname,
    port: Number(connectionUrl.port || 3306),
    user: decodeURIComponent(connectionUrl.username),
    password: decodeURIComponent(connectionUrl.password),
    database: connectionUrl.pathname.replace(/^\//, ''),
    multipleStatements: true,
  };
}

await loadLocalEnv();

const schemaSql = await fs.readFile(path.join(root, 'db/schema.mysql.sql'), 'utf8');
const seedSql = await fs.readFile(path.join(root, 'db/seed.mysql.sql'), 'utf8');
const connection = await mysql.createConnection(getConnectionConfig());

try {
  await connection.query(schemaSql);
  await connection.query(seedSql);
  console.log('MySQL database schema and seed data applied.');
} finally {
  await connection.end();
}
