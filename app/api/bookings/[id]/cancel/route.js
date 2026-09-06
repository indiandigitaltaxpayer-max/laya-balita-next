import { jsonError, jsonOk, handleApiError } from '../../../../lib/api';
import { requireSession } from '../../../../lib/auth';
import { getBookingRooms, getPool, mapBookingRow } from '../../../../lib/db';
import { sendAdminCancellationEmail } from '../../../../lib/email';

export async function POST(request, { params }) {
  let client;

  try {
    const session = await requireSession();
    const { id } = await params;
    client = await getPool().connect();

    await client.query('BEGIN');

    const currentResult = await client.query(
      `SELECT *
       FROM bookings
       WHERE id = $1
         AND status <> 'CANCELLED'
         AND (user_id = $2 OR guest_email = $3)
       LIMIT 1`,
      [id, session.id, session.email],
    );
    const booking = currentResult.rows[0];

    if (!booking) {
      await client.query('ROLLBACK');
      return jsonError('Booking not found or already cancelled', 404);
    }

    await client.query(
      `UPDATE bookings
       SET status = 'CANCELLED', updated_at = NOW()
       WHERE id = $1`,
      [booking.id],
    );

    const updatedResult = await client.query('SELECT * FROM bookings WHERE id = $1 LIMIT 1', [booking.id]);
    const updatedBooking = updatedResult.rows[0];
    const updatedBookingRooms = await getBookingRooms(updatedBooking.id, client);

    await client.query(
      `DELETE FROM room_availability
       WHERE booking_id = $1`,
      [booking.id],
    );

    await client.query('COMMIT');

    let email;
    const mappedBooking = mapBookingRow(updatedBooking, updatedBookingRooms);
    try {
      email = await sendAdminCancellationEmail({ ...updatedBooking, rooms: mappedBooking.rooms });
    } catch (error) {
      email = {
        sent: false,
        reason: error.message,
      };
    }

    return jsonOk({
      booking: mappedBooking,
      email,
    });
  } catch (error) {
    await client?.query('ROLLBACK').catch(() => null);

    if (error.message === 'UNAUTHORIZED') {
      return jsonError('Login required', 401);
    }

    return handleApiError(error);
  } finally {
    client?.release();
  }
}
