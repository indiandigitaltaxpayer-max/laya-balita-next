import { jsonError } from '../../../lib/api';

export async function POST(request) {
  await request.json().catch(() => null);
  return jsonError('Password login has been replaced by email OTP login.', 410);
}
