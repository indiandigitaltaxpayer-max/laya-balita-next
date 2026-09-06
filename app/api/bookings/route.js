import { z } from 'zod';
import { jsonError, jsonOk, handleApiError } from '../../lib/api';
import { requireSession } from '../../lib/auth';
import { mapBookingRow, query } from '../../lib/db';
import { sendAdminBookingEmail } from '../../lib/email';

const bookingSchema = z.object({
  guestName: z.string().min(2),
  guestEmail: z.string().email(),
  guestPhone: z.string().min(5),
  roomTypeId: z.string().uuid(),
  roomUnitId: z.string().uuid(),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  guests: z.string().min(1),
  breakfastOpted: z.boolean().default(false),
});

function nightsBetween(checkIn, checkOut) {
  return Math.ceil((new Date(`${checkOut}T00:00:00`) - new Date(`${checkIn}T00:00:00`)) / 86400000);
}

export async function GET() {
  try {
    const session = await requireSession();

    if (!session) {
      return jsonError('Login required', 401);
    }

    const result = await query(
      `SELECT * FROM bookings
       WHERE user_id = $1 OR guest_email = $2
       ORDER BY created_at DESC`,
      [session.id, session.email],
    );

    return jsonOk({ bookings: result.rows.map(mapBookingRow) });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request) {
  try {
    const payload = bookingSchema.parse(await request.json());
    const session = await requireSession();
    const nights = nightsBetween(payload.checkIn, payload.checkOut);

    if (nights < 1) {
      return jsonError('Checkout date must be after check-in date', 422);
    }

    const roomResult = await query(
      `SELECT
        rt.id AS room_type_id,
        rt.name,
        rt.rate_per_night,
        rt.breakfast_charge,
        ru.id AS room_unit_id,
        ru.room_code
       FROM room_types rt
       JOIN room_units ru ON ru.room_type_id = rt.id
       WHERE rt.id = $1 AND ru.id = $2 AND ru.status = 'AVAILABLE'
       LIMIT 1`,
      [payload.roomTypeId, payload.roomUnitId],
    );
    const room = roomResult.rows[0];

    if (!room) {
      return jsonError('Selected room is not available', 404);
    }

    const availabilityResult = await query(
      `SELECT 1
       FROM room_availability
       WHERE room_unit_id = $1
         AND available_date >= $2
         AND available_date < $3
         AND status IN ('BOOKED', 'BLOCKED')
       UNION ALL
       SELECT 1
       FROM bookings
       WHERE room_unit_id = $1
         AND status = 'CONFIRMED'
         AND check_in < $3
         AND check_out > $2
       LIMIT 1`,
      [payload.roomUnitId, payload.checkIn, payload.checkOut],
    );

    if (availabilityResult.rows.length) {
      return jsonError('Selected dates are not available for this room', 409);
    }

    const roomTotal = room.rate_per_night * nights;
    const breakfastTotal = payload.breakfastOpted ? room.breakfast_charge * nights : 0;
    const estimatedTotal = roomTotal + breakfastTotal;
    const bookingCode = `LB-${Date.now().toString().slice(-6)}`;
    const result = await query(
      `INSERT INTO bookings (
        booking_code,
        user_id,
        guest_name,
        guest_email,
        guest_phone,
        room_type_id,
        room_unit_id,
        room_name,
        room_code,
        check_in,
        check_out,
        guests,
        nights,
        rate_per_night,
        breakfast_opted,
        breakfast_charge,
        estimated_total
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
      [
        bookingCode,
        session.id,
        payload.guestName,
        payload.guestEmail.toLowerCase(),
        payload.guestPhone,
        room.room_type_id,
        room.room_unit_id,
        room.name,
        room.room_code,
        payload.checkIn,
        payload.checkOut,
        payload.guests,
        nights,
        room.rate_per_night,
        payload.breakfastOpted,
        room.breakfast_charge,
        estimatedTotal,
      ],
    );

    const savedBookingResult = await query('SELECT * FROM bookings WHERE booking_code = $1 LIMIT 1', [bookingCode]);
    const savedBooking = savedBookingResult.rows[0];

    let email;
    try {
      email = await sendAdminBookingEmail(savedBooking);
    } catch (error) {
      email = {
        sent: false,
        reason: error.message,
      };
    }

    return jsonOk({
      booking: mapBookingRow(savedBooking),
      email,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError('Invalid booking request', 422);
    }
    if (error.message === 'UNAUTHORIZED') {
      return jsonError('Login required before making a reservation request', 401);
    }

    return handleApiError(error);
  }
}
