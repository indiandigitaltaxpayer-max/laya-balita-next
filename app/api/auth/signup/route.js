import { jsonError } from '../../../lib/api';

export async function POST(request) {
  await request.json().catch(() => null);
  return jsonError('Signup now starts by requesting an email OTP.', 410);
}
