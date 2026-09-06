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

function plusAlias(email, alias) {
  const atIndex = email.indexOf('@');
  if (atIndex === -1) return null;

  const local = email.slice(0, atIndex);
  const domain = email.slice(atIndex + 1);
  return `${local}+${alias}@${domain}`;
}

await loadLocalEnv();

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is required.');
  process.exit(1);
}

const adminEmail = (process.env.TEST_ADMIN_EMAIL || process.env.ADMIN_EMAIL || '').toLowerCase();
const userEmail = (process.env.TEST_USER_EMAIL || plusAlias(adminEmail, 'guest') || '').toLowerCase();

if (!adminEmail || !userEmail) {
  console.error('Set ADMIN_EMAIL or TEST_ADMIN_EMAIL and TEST_USER_EMAIL before seeding test users.');
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
  const accounts = [
    {
      name: 'Demo Guest',
      firstName: 'Demo',
      lastName: 'Guest',
      email: userEmail,
      phone: '+91 90000 00001',
      country: 'India',
      address: 'Demo guest address',
      role: 'USER',
    },
    {
      name: 'Demo Admin',
      firstName: 'Demo',
      lastName: 'Admin',
      email: adminEmail,
      phone: '+91 90000 00002',
      country: 'India',
      address: 'Laya Balita admin',
      role: 'ADMIN',
    },
  ];

  for (const account of accounts) {
    await client.query(
      `INSERT INTO users (
        name,
        first_name,
        last_name,
        email,
        phone,
        country,
        address,
        role
      )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        first_name = VALUES(first_name),
        last_name = VALUES(last_name),
        phone = VALUES(phone),
        country = VALUES(country),
        address = VALUES(address),
        role = VALUES(role),
        updated_at = NOW()`,
      [
        account.name,
        account.firstName,
        account.lastName,
        account.email,
        account.phone,
        account.country,
        account.address,
        account.role,
      ],
    );
  }

  console.log(JSON.stringify({
    userEmail,
    adminEmail,
    loginMethod: 'Use /login and request the email OTP.',
  }, null, 2));
} finally {
  await client.end();
}
