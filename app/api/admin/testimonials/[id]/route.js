import { z } from 'zod';
import { jsonError, jsonOk, handleApiError } from '../../../../lib/api';
import { requireAdmin } from '../../../../lib/auth';
import { query } from '../../../../lib/db';

const updateTestimonialSchema = z.object({
  guestName: z.string().trim().min(2).optional(),
  guestLocation: z.string().trim().optional(),
  rating: z.coerce.number().int().min(1).max(5).optional(),
  quote: z.string().trim().min(8).optional(),
  isPublished: z.boolean().optional(),
  sortOrder: z.coerce.number().int().min(0).optional(),
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

export async function PATCH(request, { params }) {
  try {
    await requireAdmin();

    const { id } = await params;
    const payload = updateTestimonialSchema.parse(await request.json());
    const fields = [];
    const values = [];

    const fieldMap = {
      guestName: 'guest_name',
      guestLocation: 'guest_location',
      rating: 'rating',
      quote: 'quote',
      isPublished: 'is_published',
      sortOrder: 'sort_order',
    };

    for (const [key, column] of Object.entries(fieldMap)) {
      if (Object.hasOwn(payload, key)) {
        values.push(payload[key] === '' ? null : payload[key]);
        fields.push(`${column} = $${values.length}`);
      }
    }

    if (!fields.length) {
      return jsonError('No update fields provided', 422);
    }

    values.push(id);
    const result = await query(
      `UPDATE testimonials
       SET ${fields.join(', ')}, updated_at = NOW()
       WHERE id = $${values.length}`,
      values,
    );

    if (!result.rowCount) {
      return jsonError('Testimonial not found', 404);
    }

    const updatedResult = await query('SELECT * FROM testimonials WHERE id = $1 LIMIT 1', [id]);

    return jsonOk({ testimonial: mapTestimonial(updatedResult.rows[0]) });
  } catch (error) {
    if (error instanceof z.ZodError) return jsonError('Enter valid testimonial details', 422);
    if (error.message === 'UNAUTHORIZED') return jsonError('Login required', 401);
    if (error.message === 'FORBIDDEN') return jsonError('Admin access required', 403);

    return handleApiError(error);
  }
}

export async function DELETE(_request, { params }) {
  try {
    await requireAdmin();

    const { id } = await params;
    const result = await query(
      `DELETE FROM testimonials
       WHERE id = $1`,
      [id],
    );

    if (!result.rowCount) {
      return jsonError('Testimonial not found', 404);
    }

    return jsonOk({ ok: true });
  } catch (error) {
    if (error.message === 'UNAUTHORIZED') return jsonError('Login required', 401);
    if (error.message === 'FORBIDDEN') return jsonError('Admin access required', 403);

    return handleApiError(error);
  }
}
