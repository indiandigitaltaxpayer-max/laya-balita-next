import { z } from 'zod';
import { jsonError, jsonOk, handleApiError } from '../../lib/api';
import { query } from '../../lib/db';

const availabilitySchema = z.object({
  roomTypeId: z.string().uuid(),
  roomUnitId: z.string().uuid().optional(),
  month: z.string().regex(/^\d{4}-\d{2}$/),
});

function getMonthBounds(month) {
  const [year, monthNumber] = month.split('-').map(Number);
  const start = `${month}-01`;
  const end = new Date(Date.UTC(year, monthNumber, 0)).toISOString().slice(0, 10);

  return { start, end };
}

function normalizeStatus(status) {
  if (status === 'BOOKED' || status === 'BLOCKED') return 'booked';
  if (status === 'LIMITED') return 'limited';
  return 'available';
}

function toDateOnly(value) {
  if (!value) return '';
  if (typeof value === 'string') return value.slice(0, 10);
  if (value instanceof Date) {
    return [
      value.getFullYear(),
      String(value.getMonth() + 1).padStart(2, '0'),
      String(value.getDate()).padStart(2, '0'),
    ].join('-');
  }
  return String(value).slice(0, 10);
}

function enumerateMonthDates(start, end) {
  const dates = [];
  const cursor = new Date(`${start}T00:00:00Z`);
  const last = new Date(`${end}T00:00:00Z`);

  while (cursor <= last) {
    dates.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return dates;
}

function getDateRange(checkIn, checkOut) {
  const dates = [];
  const cursor = new Date(`${toDateOnly(checkIn)}T00:00:00Z`);
  const lastNight = new Date(`${toDateOnly(checkOut)}T00:00:00Z`);

  while (cursor < lastNight) {
    dates.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return dates;
}

export async function GET(request) {
  try {
    const searchParams = Object.fromEntries(new URL(request.url).searchParams);
    const { roomTypeId, roomUnitId, month } = availabilitySchema.parse(searchParams);
    const { start, end } = getMonthBounds(month);

    const unitsResult = await query(
      `SELECT id, room_code
       FROM room_units
       WHERE room_type_id = $1
         AND status = 'AVAILABLE'
         AND ($2 IS NULL OR id = $2)
       ORDER BY room_code`,
      [roomTypeId, roomUnitId || null],
    );

    if (!unitsResult.rows.length) {
      return jsonError('No available room units found for this room type', 404);
    }

    const unitIds = unitsResult.rows.map((unit) => unit.id);
    const unitPlaceholders = unitIds.map((_, index) => `$${index + 1}`).join(', ');
    const availabilityResult = await query(
      `SELECT room_unit_id, available_date, status
       FROM room_availability
       WHERE room_unit_id IN (${unitPlaceholders})
         AND available_date BETWEEN $${unitIds.length + 1} AND $${unitIds.length + 2}`,
      [...unitIds, start, end],
    );

    const confirmedBookingsResult = await query(
      `SELECT b.room_unit_id, b.check_in, b.check_out
       FROM bookings b
       WHERE b.room_unit_id IN (${unitPlaceholders})
         AND b.status = 'CONFIRMED'
         AND b.check_in <= $${unitIds.length + 2}
         AND b.check_out > $${unitIds.length + 1}`,
      [...unitIds, start, end],
    );

    const statusByUnitDate = new Map();

    for (const row of availabilityResult.rows) {
      statusByUnitDate.set(`${row.room_unit_id}:${toDateOnly(row.available_date)}`, {
        status: normalizeStatus(row.status),
        source: 'availability',
      });
    }

    for (const row of confirmedBookingsResult.rows) {
      for (const date of getDateRange(row.check_in, row.check_out)) {
        if (date >= start && date <= end) {
          statusByUnitDate.set(`${row.room_unit_id}:${date}`, {
            status: 'booked',
            source: 'booking',
          });
        }
      }
    }

    const availability = enumerateMonthDates(start, end).map((date) => {
      const statuses = unitIds.map((unitId) => statusByUnitDate.get(`${unitId}:${date}`)?.status || 'available');
      const sources = unitIds.map((unitId) => statusByUnitDate.get(`${unitId}:${date}`)?.source).filter(Boolean);
      const bookedCount = statuses.filter((status) => status === 'booked').length;
      const limitedCount = statuses.filter((status) => status === 'limited').length;

      let status = 'available';
      if (bookedCount === statuses.length) {
        status = 'booked';
      } else if (bookedCount > 0 || limitedCount > 0) {
        status = 'limited';
      }

      return {
        date,
        status,
        source: sources.includes('booking') ? 'booking' : sources[0] || 'default',
      };
    });

    return jsonOk({
      month,
      roomTypeId,
      roomUnitId: roomUnitId || null,
      units: unitsResult.rows.map((unit) => ({
        id: unit.id,
        roomCode: unit.room_code,
      })),
      availability,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError('Invalid availability request', 422);
    }

    return handleApiError(error);
  }
}
