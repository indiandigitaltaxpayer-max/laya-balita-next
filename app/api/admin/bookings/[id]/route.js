import { z } from 'zod';
import { jsonError, jsonOk, handleApiError } from '../../../../lib/api';
import { requireAdmin } from '../../../../lib/auth';
import { getBookingRooms, getPool, mapBookingRow } from '../../../../lib/db';
import {
  sendGuestBookingCancellationEmail,
  sendGuestBookingConfirmationEmail,
} from '../../../../lib/email';

const updateSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED']).optional(),
  breakfastComplimentary: z.boolean().optional(),
});

function toDateOnly(value) {
  if (!value) return '';
  if (typeof value === 'string') return value.slice(0, 10);
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
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

function getRoomsForBooking(booking, bookingRooms) {
  return bookingRooms.length ? bookingRooms : [{
    room_type_id: booking.room_type_id,
    room_unit_id: booking.room_unit_id,
  }].filter((room) => room.room_type_id && room.room_unit_id);
}

async function assertDatesCanBeConfirmed(client, booking, bookingRooms) {
  const rooms = getRoomsForBooking(booking, bookingRooms);
  const roomUnitIds = rooms.map((room) => room.room_unit_id);

  if (!roomUnitIds.length) {
    throw new Error('DATE_CONFLICT');
  }

  const placeholders = roomUnitIds.map((_, index) => `$${index + 1}`).join(', ');

  const conflictResult = await client.query(
    `SELECT 1
     FROM room_availability
     WHERE room_unit_id IN (${placeholders})
       AND available_date >= $${roomUnitIds.length + 1}
       AND available_date < $${roomUnitIds.length + 2}
       AND status IN ('BOOKED', 'BLOCKED')
       AND (booking_id IS NULL OR booking_id <> $${roomUnitIds.length + 3})
     UNION ALL
     SELECT 1
     FROM bookings b
     LEFT JOIN booking_rooms br ON br.booking_id = b.id
     WHERE COALESCE(br.room_unit_id, b.room_unit_id) IN (${placeholders})
       AND b.status = 'CONFIRMED'
       AND b.id <> $${roomUnitIds.length + 3}
       AND b.check_in < $${roomUnitIds.length + 2}
       AND b.check_out > $${roomUnitIds.length + 1}
     LIMIT 1`,
    [...roomUnitIds, booking.check_in, booking.check_out, booking.id],
  );

  if (conflictResult.rows.length) {
    throw new Error('DATE_CONFLICT');
  }
}

async function markBookingDatesBooked(client, booking, bookingRooms) {
  const rooms = getRoomsForBooking(booking, bookingRooms);

  for (const room of rooms) {
    for (const date of getDateRange(booking.check_in, booking.check_out)) {
      await client.query(
        `INSERT INTO room_availability (
           room_type_id,
           room_unit_id,
           available_date,
           status,
           booking_id,
           note
         )
         VALUES ($1, $2, $3, 'BOOKED', $4, 'Booked after admin confirmation')
         ON DUPLICATE KEY UPDATE
           status = 'BOOKED',
           booking_id = VALUES(booking_id),
           note = VALUES(note),
           updated_at = NOW()`,
        [room.room_type_id, room.room_unit_id, date, booking.id],
      );
    }
  }
}

async function releaseBookingDates(client, bookingId) {
  await client.query(
    `DELETE FROM room_availability
     WHERE booking_id = $1`,
    [bookingId],
  );
}

export async function PATCH(request, { params }) {
  let client;

  try {
    await requireAdmin();
    client = await getPool().connect();

    const { id } = await params;
    const payload = updateSchema.parse(await request.json());

    if (!payload.status && typeof payload.breakfastComplimentary !== 'boolean') {
      return jsonError('No update fields provided', 422);
    }

    await client.query('BEGIN');

    const currentResult = await client.query(
      `SELECT *
       FROM bookings
       WHERE id = $1
       FOR UPDATE`,
      [id],
    );
    const currentBooking = currentResult.rows[0];
    const previousStatus = currentBooking?.status;

    if (!currentBooking) {
      await client.query('ROLLBACK');
      return jsonError('Booking not found', 404);
    }

    const currentBookingRooms = currentBooking ? await getBookingRooms(currentBooking.id, client) : [];

    if (payload.status === 'CONFIRMED') {
      await assertDatesCanBeConfirmed(client, currentBooking, currentBookingRooms);
    }

    const fields = [];
    const values = [];

    if (payload.status) {
      values.push(payload.status);
      fields.push(`status = $${values.length}`);
    }

    if (typeof payload.breakfastComplimentary === 'boolean') {
      values.push(payload.breakfastComplimentary);
      fields.push(`breakfast_complimentary = $${values.length}`);
    }

    values.push(id);
    const result = await client.query(
      `UPDATE bookings
       SET ${fields.join(', ')}, updated_at = NOW()
       WHERE id = $${values.length}`,
      values,
    );

    if (!result.rowCount) {
      await client.query('ROLLBACK');
      return jsonError('Booking not found', 404);
    }

    const updatedResult = await client.query('SELECT * FROM bookings WHERE id = $1 LIMIT 1', [id]);
    const updatedBooking = updatedResult.rows[0];
    const updatedBookingRooms = await getBookingRooms(updatedBooking.id, client);

    if (payload.status === 'CONFIRMED') {
      await markBookingDatesBooked(client, updatedBooking, updatedBookingRooms);
    } else if (payload.status && payload.status !== 'CONFIRMED') {
      await releaseBookingDates(client, updatedBooking.id);
    }

    await client.query('COMMIT');
    const mappedBooking = mapBookingRow(updatedBooking, updatedBookingRooms);

    let guestEmail = null;

    if (payload.status && payload.status !== previousStatus) {
      try {
        if (payload.status === 'CONFIRMED') {
          guestEmail = await sendGuestBookingConfirmationEmail({ ...updatedBooking, rooms: mappedBooking.rooms });
        } else if (payload.status === 'CANCELLED') {
          guestEmail = await sendGuestBookingCancellationEmail({ ...updatedBooking, rooms: mappedBooking.rooms });
        }
      } catch (error) {
        guestEmail = {
          sent: false,
          reason: error.message,
        };
      }
    }

    return jsonOk({ booking: mappedBooking, guestEmail });
  } catch (error) {
    await client?.query('ROLLBACK').catch(() => null);

    if (error instanceof z.ZodError) return jsonError('Invalid booking update', 422);
    if (error.message === 'UNAUTHORIZED') return jsonError('Login required', 401);
    if (error.message === 'FORBIDDEN') return jsonError('Admin access required', 403);
    if (error.message === 'DATE_CONFLICT') {
      return jsonError('These dates are already booked for this room.', 409);
    }

    return handleApiError(error);
  } finally {
    client?.release();
  }
}
