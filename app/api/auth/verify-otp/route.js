import { z } from 'zod';
import { jsonError, jsonOk, handleApiError } from '../../../lib/api';
import { findUserByEmail, publicUser, setSessionCookie, verifyPassword } from '../../../lib/auth';
import { query } from '../../../lib/db';

const verifyOtpSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  otp: z.string().regex(/^\d{6}$/),
});

export async function POST(request) {
  try {
    const payload = verifyOtpSchema.parse(await request.json());
    const email = payload.email;
    const otpResult = await query(
      `SELECT * FROM email_otps
       WHERE email = $1 AND used_at IS NULL AND expires_at > NOW()
       ORDER BY created_at DESC
       LIMIT 1`,
      [email],
    );
    const otpRecord = otpResult.rows[0];

    if (!otpRecord) {
      return jsonError('OTP expired or not found. Request a new code.', 401);
    }

    if (otpRecord.attempts >= 5) {
      return jsonError('Too many attempts. Request a new code.', 429);
    }

    const isValid = await verifyPassword(payload.otp, otpRecord.otp_hash);

    if (!isValid) {
      await query('UPDATE email_otps SET attempts = attempts + 1 WHERE id = $1', [otpRecord.id]);
      return jsonError('Invalid OTP', 401);
    }

    await query('UPDATE email_otps SET used_at = NOW() WHERE id = $1', [otpRecord.id]);

    let user = await findUserByEmail(email);

    if (!user && otpRecord.mode === 'login') {
      return jsonError('No account exists for this email. Please sign up first.', 404);
    }

    if (!user) {
      await query(
        `INSERT INTO users (
          name,
          first_name,
          last_name,
          email,
          phone,
          country,
          address,
          role
        )
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'USER')`,
        [
          otpRecord.name || `${otpRecord.first_name} ${otpRecord.last_name}`.trim(),
          otpRecord.first_name,
          otpRecord.last_name,
          email,
          otpRecord.phone,
          otpRecord.country,
          otpRecord.address,
        ],
      );
      user = await findUserByEmail(email);
    }

    await setSessionCookie(user);

    return jsonOk({ user: publicUser(user) });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError('Enter the 6-digit OTP sent to your email', 422);
    }

    return handleApiError(error);
  }
}
