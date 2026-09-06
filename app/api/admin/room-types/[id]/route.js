import { z } from 'zod';
import { jsonError, jsonOk, handleApiError } from '../../../../lib/api';
import { requireAdmin } from '../../../../lib/auth';
import { query } from '../../../../lib/db';

const updateRoomTypeSchema = z.object({
  ratePerNight: z.coerce.number().int().min(0).max(1000000),
  breakfastCharge: z.coerce.number().int().min(0).max(100000),
});

function mapRoomType(row) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    image: row.image,
    ratePerNight: row.rate_per_night,
    breakfastCharge: row.breakfast_charge,
  };
}

export async function PATCH(request, { params }) {
  try {
    await requireAdmin();

    const { id } = await params;
    const payload = updateRoomTypeSchema.parse(await request.json());
    const result = await query(
      `UPDATE room_types
       SET rate_per_night = $1,
           breakfast_charge = $2
       WHERE id = $3`,
      [payload.ratePerNight, payload.breakfastCharge, id],
    );

    if (!result.rowCount) {
      return jsonError('Room or villa product not found', 404);
    }

    const updatedResult = await query('SELECT * FROM room_types WHERE id = $1 LIMIT 1', [id]);

    return jsonOk({ roomType: mapRoomType(updatedResult.rows[0]) });
  } catch (error) {
    if (error instanceof z.ZodError) return jsonError('Enter valid room and breakfast rates', 422);
    if (error.message === 'UNAUTHORIZED') return jsonError('Login required', 401);
    if (error.message === 'FORBIDDEN') return jsonError('Admin access required', 403);

    return handleApiError(error);
  }
}
