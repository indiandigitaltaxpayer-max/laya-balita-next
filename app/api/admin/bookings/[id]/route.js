import { z } from 'zod';
import { jsonError, jsonOk, handleApiError } from '../../../../lib/api';
import { requireAdmin } from '../../../../lib/auth';
import { getPool, mapBookingRow } from '../../../../lib/db';
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

async function assertDatesCanBeConfirmed(client, booking) {
  const conflictResult = await client.query(
    `SELECT 1
     FROM room_availability
     WHERE room_unit_id = $1
       AND available_date >= $2
       AND available_date < $3
       AND status IN ('BOOKED', 'BLOCKED')
       AND (booking_id IS NULL OR booking_id <> $4)
     UNION ALL
     SELECT 1
     FROM bookings
     WHERE room_unit_id = $1
       AND status = 'CONFIRMED'
       AND id <> $4
       AND check_in < $3
       AND check_out > $2
     LIMIT 1`,
    [booking.room_unit_id, booking.check_in, booking.check_out, booking.id],
  );

  if (conflictResult.rows.length) {
    throw new Error('DATE_CONFLICT');
  }
}

async function markBookingDatesBooked(client, booking) {
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
      [booking.room_type_id, booking.room_unit_id, date, booking.id],
    );
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

    if (payload.status === 'CONFIRMED') {
      await assertDatesCanBeConfirmed(client, currentBooking);
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

    if (payload.status === 'CONFIRMED') {
      await markBookingDatesBooked(client, updatedBooking);
    } else if (payload.status && payload.status !== 'CONFIRMED') {
      await releaseBookingDates(client, updatedBooking.id);
    }

    await client.query('COMMIT');

    let guestEmail = null;

    if (payload.status && payload.status !== previousStatus) {
      try {
        if (payload.status === 'CONFIRMED') {
          guestEmail = await sendGuestBookingConfirmationEmail(updatedBooking);
        } else if (payload.status === 'CANCELLED') {
          guestEmail = await sendGuestBookingCancellationEmail(updatedBooking);
        }
      } catch (error) {
        guestEmail = {
          sent: false,
          reason: error.message,
        };
      }
    }

    return jsonOk({ booking: mapBookingRow(updatedBooking), guestEmail });
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
