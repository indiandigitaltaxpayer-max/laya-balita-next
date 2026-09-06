import { jsonOk, handleApiError } from '../../lib/api';
import { getSession } from '../../lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    return jsonOk({ user: session || null });
  } catch (error) {
    return handleApiError(error);
  }
}
