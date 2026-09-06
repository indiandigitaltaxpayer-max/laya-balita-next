import { jsonError, jsonOk, handleApiError } from '../../../lib/api';
import { requireAdmin } from '../../../lib/auth';
import { query } from '../../../lib/db';

function mapRoomType(row) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    image: row.image,
    ratePerNight: row.rate_per_night,
    breakfastCharge: row.breakfast_charge,
    unitCount: Number(row.unit_count || 0),
  };
}

export async function GET() {
  try {
    await requireAdmin();

    const result = await query(
      `SELECT
        rt.id,
        rt.name,
        rt.description,
        rt.image,
        rt.rate_per_night,
        rt.breakfast_charge,
        COUNT(ru.id) AS unit_count
       FROM room_types rt
       LEFT JOIN room_units ru ON ru.room_type_id = rt.id
       GROUP BY rt.id, rt.name, rt.description, rt.image, rt.rate_per_night, rt.breakfast_charge
       ORDER BY rt.name`,
    );

    return jsonOk({ roomTypes: result.rows.map(mapRoomType) });
  } catch (error) {
    if (error.message === 'UNAUTHORIZED') return jsonError('Login required', 401);
    if (error.message === 'FORBIDDEN') return jsonError('Admin access required', 403);

    return handleApiError(error);
  }
}
