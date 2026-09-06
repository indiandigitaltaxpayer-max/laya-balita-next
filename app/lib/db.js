import mysql from 'mysql2/promise';

let pool;

function normalizeQuery(text, params = []) {
  const normalizedParams = [];
  const sql = text
    .replace(/\$(\d+)/g, '?')
    .replace(/::uuid\[\]/g, '')
    .replace(/::uuid/g, '')
    .replace(/::date/g, '');

  text.replace(/\$(\d+)/g, (_match, index) => {
    normalizedParams.push(params[Number(index) - 1]);
    return _match;
  });

  return {
    sql,
    params: normalizedParams.length ? normalizedParams : params,
  };
}

function normalizeResult(result) {
  const [rows, meta] = result;

  return {
    rows: Array.isArray(rows) ? rows : [],
    rowCount: Array.isArray(rows) ? rows.length : meta?.affectedRows || rows?.affectedRows || 0,
    insertId: rows?.insertId,
    affectedRows: rows?.affectedRows || 0,
  };
}

function createClient(connection) {
  return {
    async query(text, params = []) {
      const normalized = normalizeQuery(text, params);
      return normalizeResult(await connection.query(normalized.sql, normalized.params));
    },
    release() {
      connection.release();
    },
  };
}

export function getPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not configured');
  }

  if (!pool) {
    const connectionUrl = new URL(process.env.DATABASE_URL);

    pool = mysql.createPool({
      host: connectionUrl.hostname,
      port: Number(connectionUrl.port || 3306),
      user: decodeURIComponent(connectionUrl.username),
      password: decodeURIComponent(connectionUrl.password),
      database: connectionUrl.pathname.replace(/^\//, ''),
      waitForConnections: true,
      connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
      namedPlaceholders: false,
    });

    pool.connect = async () => createClient(await pool.getConnection());
  }

  return pool;
}

export async function query(text, params = []) {
  const normalized = normalizeQuery(text, params);
  return normalizeResult(await getPool().query(normalized.sql, normalized.params));
}

function toDateOnly(value) {
  if (!value) return null;
  if (typeof value === 'string') return value.slice(0, 10);
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}

export function mapBookingRow(row) {
  return {
    id: row.id,
    bookingCode: row.booking_code,
    userId: row.user_id,
    name: row.guest_name,
    email: row.guest_email,
    phone: row.guest_phone,
    roomTypeId: row.room_type_id,
    roomUnitId: row.room_unit_id,
    room: row.room_name,
    roomUnit: row.room_code,
    checkIn: toDateOnly(row.check_in),
    checkOut: toDateOnly(row.check_out),
    guests: row.guests,
    nights: row.nights,
    ratePerNight: row.rate_per_night,
    breakfastOpted: Boolean(row.breakfast_opted),
    breakfastCharge: row.breakfast_charge,
    breakfastComplimentary: Boolean(row.breakfast_complimentary),
    estimatedTotal: row.estimated_total,
    status: row.status,
    createdAt: row.created_at,
  };
}
