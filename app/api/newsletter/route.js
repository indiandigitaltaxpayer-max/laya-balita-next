import { z } from 'zod';
import { jsonError, jsonOk, handleApiError } from '../../lib/api';
import { query } from '../../lib/db';

const newsletterSchema = z.object({
  email: z.string().trim().email(),
});

export async function POST(request) {
  try {
    const payload = newsletterSchema.parse(await request.json());
    const email = payload.email.toLowerCase();

    const result = await query(
      `INSERT INTO newsletter_subscribers (email, source)
       VALUES ($1, 'footer')
       ON DUPLICATE KEY UPDATE email = email`,
      [email],
    );

    if (!result.affectedRows || result.affectedRows > 1) {
      return jsonOk({
        subscribed: false,
        message: 'This email is already subscribed.',
      });
    }

    return jsonOk({
      subscribed: true,
      message: 'Thank you for subscribing.',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError('Enter a valid email address.', 422);
    }

    return handleApiError(error);
  }
}
