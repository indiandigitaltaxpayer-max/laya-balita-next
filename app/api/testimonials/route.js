import { jsonOk, handleApiError } from '../../lib/api';
import { query } from '../../lib/db';

function mapTestimonial(row) {
  return {
    id: row.id,
    guestName: row.guest_name,
    guestLocation: row.guest_location,
    rating: row.rating,
    quote: row.quote,
    sortOrder: row.sort_order,
  };
}

export async function GET() {
  try {
    const result = await query(
      `SELECT id, guest_name, guest_location, rating, quote, sort_order
       FROM testimonials
       WHERE is_published = TRUE
       ORDER BY sort_order ASC, created_at DESC`,
    );

    return jsonOk({ testimonials: result.rows.map(mapTestimonial) });
  } catch (error) {
    return handleApiError(error);
  }
}
