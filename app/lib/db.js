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

function getConnectionOptions() {
  if (process.env.DATABASE_URL) {
    const connectionUrl = new URL(process.env.DATABASE_URL);

    return {
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
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    };
  }

  throw new Error('Database connection is not configured');
}

export function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      ...getConnectionOptions(),
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

function getLegacyGuestNumber(guests) {
  return Number.parseInt(String(guests || '1'), 10) || 1;
}

export function mapBookingRoomRow(row) {
  return {
    id: row.id,
    bookingId: row.booking_id,
    roomTypeId: row.room_type_id,
    roomUnitId: row.room_unit_id,
    room: row.room_name,
    roomUnit: row.room_code,
    guests: Number(row.guests) || 1,
    ratePerNight: row.rate_per_night,
    breakfastCharge: row.breakfast_charge,
  };
}

export function mapBookingRow(row, rooms = []) {
  const mappedRooms = rooms.length
    ? rooms.map(mapBookingRoomRow)
    : [{
      id: row.room_unit_id,
      bookingId: row.id,
      roomTypeId: row.room_type_id,
      roomUnitId: row.room_unit_id,
      room: row.room_name,
      roomUnit: row.room_code,
      guests: getLegacyGuestNumber(row.guests),
      ratePerNight: row.rate_per_night,
      breakfastCharge: row.breakfast_charge,
    }].filter((room) => room.roomTypeId && room.roomUnitId);

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
    rooms: mappedRooms,
  };
}

export async function getBookingRooms(bookingIds, db = { query }) {
  const ids = Array.isArray(bookingIds) ? bookingIds.filter(Boolean) : [bookingIds].filter(Boolean);

  if (!ids.length) return [];

  const placeholders = ids.map((_, index) => `$${index + 1}`).join(', ');
  const result = await db.query(
    `SELECT *
     FROM booking_rooms
     WHERE booking_id IN (${placeholders})
     ORDER BY created_at ASC`,
    ids,
  );

  return result.rows;
}

export async function mapBookingsWithRooms(bookingRows, db = { query }) {
  const rooms = await getBookingRooms(bookingRows.map((booking) => booking.id), db);
  const roomsByBooking = new Map();

  for (const room of rooms) {
    const current = roomsByBooking.get(room.booking_id) || [];
    current.push(room);
    roomsByBooking.set(room.booking_id, current);
  }

  return bookingRows.map((booking) => mapBookingRow(booking, roomsByBooking.get(booking.id) || []));
}
