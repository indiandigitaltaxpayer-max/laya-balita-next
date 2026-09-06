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
    // Environment variables may already be set outside .env.local.
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

const connection = await mysql.createConnection(getConnectionConfig());

try {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS booking_rooms (
      id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
      booking_id CHAR(36) NOT NULL,
      room_type_id CHAR(36) NOT NULL,
      room_unit_id CHAR(36) NOT NULL,
      room_name TEXT NOT NULL,
      room_code TEXT NOT NULL,
      guests INT NOT NULL DEFAULT 1,
      rate_per_night INT NOT NULL,
      breakfast_charge INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (booking_id, room_unit_id),
      CONSTRAINT booking_rooms_booking_fk FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
      CONSTRAINT booking_rooms_room_type_fk FOREIGN KEY (room_type_id) REFERENCES room_types(id) ON DELETE RESTRICT,
      CONSTRAINT booking_rooms_room_unit_fk FOREIGN KEY (room_unit_id) REFERENCES room_units(id) ON DELETE RESTRICT
    );
  `);

  await connection.query(`
    INSERT IGNORE INTO booking_rooms (
      booking_id,
      room_type_id,
      room_unit_id,
      room_name,
      room_code,
      guests,
      rate_per_night,
      breakfast_charge
    )
    SELECT
      id,
      room_type_id,
      room_unit_id,
      room_name,
      room_code,
      COALESCE(CAST(REGEXP_SUBSTR(guests, '^[0-9]+') AS UNSIGNED), 1),
      rate_per_night,
      breakfast_charge
    FROM bookings
    WHERE room_type_id IS NOT NULL
      AND room_unit_id IS NOT NULL;
  `);

  console.log('booking_rooms migration completed.');
} finally {
  await connection.end();
}
