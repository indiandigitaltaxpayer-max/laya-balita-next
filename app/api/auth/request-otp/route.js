import crypto from 'node:crypto';
import { z } from 'zod';
import { jsonError, jsonOk, handleApiError } from '../../../lib/api';
import { findUserByEmail, hashPassword } from '../../../lib/auth';
import { query } from '../../../lib/db';
import { sendLoginOtpEmail } from '../../../lib/email';

const optionalText = (minLength) => z.preprocess(
  (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
  z.string().trim().min(minLength).optional(),
);

const requestOtpSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  mode: z.enum(['login', 'signup']).default('login'),
  firstName: optionalText(2),
  lastName: optionalText(1),
  phone: optionalText(5),
  country: optionalText(2),
  address: optionalText(5),
});

function generateOtp() {
  return crypto.randomInt(100000, 1000000).toString();
}

export async function POST(request) {
  try {
    const payload = requestOtpSchema.parse(await request.json());
    const email = payload.email;
    const existingUser = await findUserByEmail(email);

    if (payload.mode === 'login' && !existingUser) {
      return jsonError('No account exists for this email. Please sign up first.', 404);
    }

    if (payload.mode === 'signup') {
      if (existingUser) {
        return jsonError('An account already exists for this email. Please login.', 409);
      }

      if (!payload.firstName || !payload.lastName || !payload.phone || !payload.country || !payload.address) {
        return jsonError('Complete all signup details before requesting OTP', 422);
      }
    }

    const otp = generateOtp();
    const otpHash = await hashPassword(otp);
    const name = payload.mode === 'signup'
      ? `${payload.firstName} ${payload.lastName}`.trim()
      : existingUser?.name || null;

    await query(
      `INSERT INTO email_otps (
        email,
        otp_hash,
        mode,
        name,
        first_name,
        last_name,
        phone,
        country,
        address,
        expires_at
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, DATE_ADD(NOW(), INTERVAL 10 MINUTE))`,
      [
        email,
        otpHash,
        payload.mode,
        name,
        payload.firstName || null,
        payload.lastName || null,
        payload.phone || null,
        payload.country || null,
        payload.address || null,
      ],
    );

    const emailResult = await sendLoginOtpEmail(email, otp);

    if (!emailResult.sent) {
      return jsonError('OTP email could not be sent. Check SMTP configuration.', 503);
    }

    return jsonOk({ ok: true, message: 'OTP sent to email' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError('Enter valid account details', 422);
    }

    return handleApiError(error);
  }
}
