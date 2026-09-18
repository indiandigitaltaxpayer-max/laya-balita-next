import { jsonOk } from '../../lib/api';

const FIELD_MASK = [
  'displayName',
  'rating',
  'userRatingCount',
  'googleMapsUri',
  'reviews.rating',
  'reviews.text',
  'reviews.relativePublishTimeDescription',
  'reviews.authorAttribution',
  'reviews.googleMapsUri',
].join(',');

function mapReview(review, index) {
  return {
    id: review.name || review.googleMapsUri || `google-review-${index}`,
    rating: review.rating || 0,
    text: review.text?.text || '',
    relativeTime: review.relativePublishTimeDescription || '',
    authorName: review.authorAttribution?.displayName || 'Google user',
    authorUrl: review.authorAttribution?.uri || review.googleMapsUri || '',
    authorPhoto: review.authorAttribution?.photoUri || '',
  };
}

export async function GET() {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;

  if (!apiKey || !placeId) {
    return jsonOk({ configured: false, reviews: [] });
  }

  try {
    const response = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`, {
      headers: {
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': FIELD_MASK,
      },
      next: { revalidate: 21600 },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Places review request failed', response.status, errorText);
      return Response.json({ error: 'Google reviews are temporarily unavailable' }, { status: 502 });
    }

    const place = await response.json();

    return jsonOk({
      configured: true,
      placeName: place.displayName?.text || 'Laya Balita',
      rating: place.rating || 0,
      userRatingCount: place.userRatingCount || 0,
      googleMapsUrl: place.googleMapsUri || 'https://share.google/WhrtTiTnrcQsp7u4E',
      reviews: (place.reviews || []).map(mapReview).filter((review) => review.text),
    });
  } catch (error) {
    console.error('Could not load Google reviews', error);
    return Response.json({ error: 'Google reviews are temporarily unavailable' }, { status: 502 });
  }
}
