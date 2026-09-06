import { z } from 'zod';
import { jsonError, jsonOk, handleApiError } from '../../../lib/api';
import { requireAdmin } from '../../../lib/auth';
import { query } from '../../../lib/db';

const createTestimonialSchema = z.object({
  guestName: z.string().trim().min(2),
  guestLocation: z.string().trim().optional().default(''),
  rating: z.coerce.number().int().min(1).max(5).default(5),
  quote: z.string().trim().min(8),
  isPublished: z.boolean().default(false),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

function mapTestimonial(row) {
  return {
    id: row.id,
    guestName: row.guest_name,
    guestLocation: row.guest_location,
    rating: row.rating,
    quote: row.quote,
    isPublished: row.is_published,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
  };
}

export async function GET() {
  try {
    await requireAdmin();

    const result = await query(
      `SELECT *
       FROM testimonials
       ORDER BY sort_order ASC, created_at DESC`,
    );

    return jsonOk({ testimonials: result.rows.map(mapTestimonial) });
  } catch (error) {
    if (error.message === 'UNAUTHORIZED') return jsonError('Login required', 401);
    if (error.message === 'FORBIDDEN') return jsonError('Admin access required', 403);

    return handleApiError(error);
  }
}

export async function POST(request) {
  try {
    await requireAdmin();

    const payload = createTestimonialSchema.parse(await request.json());
    await query(
      `INSERT INTO testimonials (
        guest_name,
        guest_location,
        rating,
        quote,
        is_published,
        sort_order
       )
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        payload.guestName,
        payload.guestLocation || null,
        payload.rating,
        payload.quote,
        payload.isPublished,
        payload.sortOrder,
      ],
    );

    const result = await query(
      `SELECT *
       FROM testimonials
       WHERE guest_name = $1 AND quote = $2
       ORDER BY created_at DESC
       LIMIT 1`,
      [payload.guestName, payload.quote],
    );

    return jsonOk({ testimonial: mapTestimonial(result.rows[0]) }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) return jsonError('Enter valid testimonial details', 422);
    if (error.message === 'UNAUTHORIZED') return jsonError('Login required', 401);
    if (error.message === 'FORBIDDEN') return jsonError('Admin access required', 403);

    return handleApiError(error);
  }
}
