import { jsonError, jsonOk, handleApiError } from '../../../lib/api';
import { requireAdmin } from '../../../lib/auth';
import { mapBookingsWithRooms, query } from '../../../lib/db';

export async function GET() {
  try {
    await requireAdmin();

    const result = await query('SELECT * FROM bookings ORDER BY created_at DESC');
    return jsonOk({ bookings: await mapBookingsWithRooms(result.rows) });
  } catch (error) {
    if (error.message === 'UNAUTHORIZED') return jsonError('Login required', 401);
    if (error.message === 'FORBIDDEN') return jsonError('Admin access required', 403);

    return handleApiError(error);
  }
}
