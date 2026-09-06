import { NextResponse } from 'next/server';

export function jsonOk(data, init) {
  return NextResponse.json(data, init);
}

export function jsonError(message, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function handleApiError(error) {
  if (error.message === 'UNAUTHORIZED') {
    return jsonError('Login required', 401);
  }

  if (error.message === 'FORBIDDEN') {
    return jsonError('Admin access required', 403);
  }

  if (error.message === 'DATABASE_URL is not configured') {
    return jsonError('Database is not configured. Set DATABASE_URL and run the SQL migrations.', 503);
  }

  console.error(error);
  return jsonError('Unexpected server error', 500);
}
