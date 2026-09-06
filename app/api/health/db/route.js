import mysql from 'mysql2/promise';
import { jsonOk } from '../../../lib/api';

export const dynamic = 'force-dynamic';

function maskValue(value) {
  if (!value) return null;
  if (value.length <= 4) return 'set';
  return `${value.slice(0, 2)}...${value.slice(-2)}`;
}

function getConnectionOptions() {
  if (process.env.DATABASE_URL) {
    const connectionUrl = new URL(process.env.DATABASE_URL);

    return {
      source: 'DATABASE_URL',
      host: connectionUrl.hostname,
      port: Number(connectionUrl.port || 3306),
      user: decodeURIComponent(connectionUrl.username),
      password: decodeURIComponent(connectionUrl.password),
      database: connectionUrl.pathname.replace(/^\//, ''),
    };
  }

  if (
    process.env.DB_HOST
    && process.env.DB_NAME
    && process.env.DB_USER
    && process.env.DB_PASSWORD
  ) {
    return {
      source: 'DB_*',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    };
  }

  return null;
}

export async function GET() {
  const startedAt = Date.now();
  const connectionOptions = getConnectionOptions();
  const env = {
    hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
    hasDbHost: Boolean(process.env.DB_HOST),
    hasDbPort: Boolean(process.env.DB_PORT),
    hasDbName: Boolean(process.env.DB_NAME),
    hasDbUser: Boolean(process.env.DB_USER),
    hasDbPassword: Boolean(process.env.DB_PASSWORD),
  };

  if (!connectionOptions) {
    return jsonOk({
      ok: false,
      env,
      error: 'Database connection is not configured',
    }, { status: 503 });
  }

  const safeConnection = {
    source: connectionOptions.source,
    host: maskValue(connectionOptions.host),
    port: connectionOptions.port,
    database: maskValue(connectionOptions.database),
    user: maskValue(connectionOptions.user),
  };

  let connection;

  try {
    connection = await mysql.createConnection({
      host: connectionOptions.host,
      port: connectionOptions.port,
      user: connectionOptions.user,
      password: connectionOptions.password,
      database: connectionOptions.database,
      connectTimeout: Number(process.env.DB_HEALTH_TIMEOUT_MS || 8000),
    });

    const [rows] = await connection.query('SELECT 1 AS ok');

    return jsonOk({
      ok: true,
      env,
      connection: safeConnection,
      result: rows[0],
      durationMs: Date.now() - startedAt,
    });
  } catch (error) {
    return jsonOk({
      ok: false,
      env,
      connection: safeConnection,
      error: {
        message: error.message,
        code: error.code,
        errno: error.errno,
        syscall: error.syscall,
        fatal: error.fatal,
      },
      durationMs: Date.now() - startedAt,
    }, { status: 503 });
  } finally {
    await connection?.end().catch(() => null);
  }
}
