import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

const COUNTRY_HEADERS = [
  'x-vercel-ip-country',
  'cf-ipcountry',
  'x-country-code',
  'x-appengine-country',
];

function normalizeCountryCode(countryCode) {
  if (!countryCode || countryCode === 'XX') return '';

  const normalized = countryCode.trim().toUpperCase();
  return /^[A-Z]{2}$/.test(normalized) ? normalized : '';
}

export async function GET() {
  const headerList = await headers();

  const country = COUNTRY_HEADERS
    .map((headerName) => normalizeCountryCode(headerList.get(headerName)))
    .find(Boolean);

  return NextResponse.json({ country: country || '' });
}
