import { z } from 'zod';
import { jsonError, jsonOk, handleApiError } from '../../lib/api';
import { requireSession } from '../../lib/auth';
import { getBookingRooms, mapBookingRow, mapBookingsWithRooms, query } from '../../lib/db';
import { sendAdminBookingEmail } from '../../lib/email';

const bookingSchema = z.object({
  guestName: z.string().min(2),
  guestEmail: z.string().email(),
  guestPhone: z.string().min(5),
  roomTypeId: z.string().uuid().optional(),
  roomUnitId: z.string().uuid().optional(),
  selectedRooms: z.array(z.object({
    roomTypeId: z.string().uuid(),
    roomUnitId: z.string().uuid(),
    guests: z.coerce.number().int().min(1),
  })).min(1).optional(),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  guests: z.string().min(1),
  breakfastOpted: z.boolean().default(false),
});

const villaNames = new Set(['The Azure Villa', 'The Nook Villa', 'The Verdant Villa']);

function nightsBetween(checkIn, checkOut) {
  return Math.ceil((new Date(`${checkOut}T00:00:00`) - new Date(`${checkIn}T00:00:00`)) / 86400000);
}

function getGuestNumber(guests) {
  return Number.parseInt(String(guests || '1'), 10) || 1;
}

function normalizeSelectedRooms(payload) {
  if (payload.selectedRooms?.length) {
    return payload.selectedRooms;
  }

  if (payload.roomTypeId && payload.roomUnitId) {
    return [{
      roomTypeId: payload.roomTypeId,
      roomUnitId: payload.roomUnitId,
      guests: getGuestNumber(payload.guests),
    }];
  }

  return [];
}

function buildInClause(values, offset = 1) {
  return values.map((_, index) => `$${index + offset}`).join(', ');
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

    return jsonOk({ bookings: await mapBookingsWithRooms(result.rows) });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request) {
  try {
    const payload = bookingSchema.parse(await request.json());
    const session = await requireSession();
    const nights = nightsBetween(payload.checkIn, payload.checkOut);
    const selectedRooms = normalizeSelectedRooms(payload);

    if (nights < 1) {
      return jsonError('Checkout date must be after check-in date', 422);
    }

    if (!selectedRooms.length) {
      return jsonError('Please select at least one room.', 422);
    }

    const selectedRoomUnitIds = selectedRooms.map((room) => room.roomUnitId);
    if (new Set(selectedRoomUnitIds).size !== selectedRoomUnitIds.length) {
      return jsonError('Each selected room can only be added once.', 422);
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
       WHERE ru.id IN (${buildInClause(selectedRoomUnitIds)})
         AND ru.status = 'AVAILABLE'`,
      selectedRoomUnitIds,
    );
    const selectedRoomRows = roomResult.rows.map((room) => {
      const requested = selectedRooms.find((item) => item.roomUnitId === room.room_unit_id);
      return {
        ...room,
        guests: requested?.guests || 1,
      };
    });

    if (selectedRoomRows.length !== selectedRooms.length) {
      return jsonError('One or more selected rooms are not available', 404);
    }

    const selectedVillas = selectedRoomRows.filter((room) => villaNames.has(room.name));
    if (selectedVillas.length && selectedRoomRows.length > 1) {
      return jsonError('Please select only one entire villa per reservation request.', 422);
    }

    const availabilityResult = await query(
      `SELECT 1
       FROM room_availability
       WHERE room_unit_id IN (${buildInClause(selectedRoomUnitIds)})
         AND available_date >= $${selectedRoomUnitIds.length + 1}
         AND available_date < $${selectedRoomUnitIds.length + 2}
         AND status IN ('BOOKED', 'BLOCKED')
       UNION ALL
       SELECT 1
       FROM bookings b
       LEFT JOIN booking_rooms br ON br.booking_id = b.id
       WHERE COALESCE(br.room_unit_id, b.room_unit_id) IN (${buildInClause(selectedRoomUnitIds)})
         AND b.status = 'CONFIRMED'
         AND b.check_in < $${selectedRoomUnitIds.length + 2}
         AND b.check_out > $${selectedRoomUnitIds.length + 1}
       LIMIT 1`,
      [...selectedRoomUnitIds, payload.checkIn, payload.checkOut],
    );

    if (availabilityResult.rows.length) {
      return jsonError('Selected dates are not available for one or more selected rooms', 409);
    }

    const firstRoom = selectedRoomRows[0];
    const totalGuests = selectedRoomRows.reduce((sum, room) => sum + room.guests, 0);
    const roomTotal = selectedRoomRows.reduce((sum, room) => sum + room.rate_per_night * nights, 0);
    const breakfastTotal = payload.breakfastOpted
      ? selectedRoomRows.reduce((sum, room) => sum + room.breakfast_charge * room.guests * nights, 0)
      : 0;
    const estimatedTotal = roomTotal + breakfastTotal;
    const roomName = selectedRoomRows.length === 1 ? firstRoom.name : `${selectedRoomRows.length} Private Rooms`;
    const roomCode = selectedRoomRows.length === 1
      ? firstRoom.room_code
      : selectedRoomRows.map((room) => room.room_code).join(', ');
    const bookingCode = `LB-${Date.now().toString().slice(-6)}`;
    await query(
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
        firstRoom.room_type_id,
        firstRoom.room_unit_id,
        roomName,
        roomCode,
        payload.checkIn,
        payload.checkOut,
        `${totalGuests} Guest${totalGuests === 1 ? '' : 's'}`,
        nights,
        roomTotal / nights,
        payload.breakfastOpted,
        breakfastTotal / nights,
        estimatedTotal,
      ],
    );

    const savedBookingResult = await query('SELECT * FROM bookings WHERE booking_code = $1 LIMIT 1', [bookingCode]);
    const savedBooking = savedBookingResult.rows[0];

    for (const room of selectedRoomRows) {
      await query(
        `INSERT INTO booking_rooms (
          booking_id,
          room_type_id,
          room_unit_id,
          room_name,
          room_code,
          guests,
          rate_per_night,
          breakfast_charge
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          savedBooking.id,
          room.room_type_id,
          room.room_unit_id,
          room.name,
          room.room_code,
          room.guests,
          room.rate_per_night,
          room.breakfast_charge,
        ],
      );
    }

    const savedBookingRooms = await getBookingRooms(savedBooking.id);
    const mappedBooking = mapBookingRow(savedBooking, savedBookingRooms);

    let email;
    try {
      email = await sendAdminBookingEmail({ ...savedBooking, rooms: mappedBooking.rooms });
    } catch (error) {
      email = {
        sent: false,
        reason: error.message,
      };
    }

    return jsonOk({
      booking: mappedBooking,
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
