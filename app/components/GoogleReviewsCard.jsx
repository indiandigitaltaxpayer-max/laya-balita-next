'use client';

import { useEffect, useState } from 'react';

function Stars({ rating }) {
  const roundedRating = Math.max(0, Math.min(5, Math.round(rating || 0)));
  return <span className="review-stars" aria-label={`${rating} out of 5 stars`}>{'★'.repeat(roundedRating)}{'☆'.repeat(5 - roundedRating)}</span>;
}

export default function GoogleReviewsCard({ fallbackUrl }) {
  const [reviewData, setReviewData] = useState(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadReviews() {
      try {
        const response = await fetch('/api/google-reviews');
        if (!response.ok) return;

        const data = await response.json();
        if (isMounted && data.configured) setReviewData(data);
      } catch {
        // The card keeps its Google Maps link when live reviews are unavailable.
      } finally {
        if (isMounted) setHasLoaded(true);
      }
    }

    loadReviews();

    return () => {
      isMounted = false;
    };
  }, []);

  const googleMapsUrl = reviewData?.googleMapsUrl || fallbackUrl;
  const reviews = reviewData?.reviews?.slice(0, 3) || [];

  return (
    <div className="google-review-box" data-aos="fade-left">
      <div className="review-header">
        <span className="google-mark" aria-hidden="true">G</span>
        <div>
          <h3>Google Reviews</h3>
          {reviewData ? (
            <div className="review-rating">
              <strong>{reviewData.rating}</strong>
              <Stars rating={reviewData.rating} />
              <span>{reviewData.userRatingCount} reviews</span>
            </div>
          ) : null}
        </div>
      </div>

      {reviews.length ? (
        <div className="review-list">
          {reviews.map((review) => (
            <article key={review.id}>
              <Stars rating={review.rating} />
              <p>&ldquo;{review.text}&rdquo;</p>
              <span>
                {review.authorUrl ? <a href={review.authorUrl} target="_blank" rel="noreferrer">{review.authorName}</a> : review.authorName}
                {review.relativeTime ? ` · ${review.relativeTime}` : ''}
              </span>
            </article>
          ))}
        </div>
      ) : (
        <p className="google-review-status">
          {hasLoaded ? 'Visit our Google profile to read guest reviews.' : 'Loading Google reviews...'}
        </p>
      )}

      <a className="btn btn-primary btn-block" href={googleMapsUrl} target="_blank" rel="noreferrer">Open on Google Maps</a>
      <a className="google-review-link" href={googleMapsUrl} target="_blank" rel="noreferrer">View Google profile and reviews</a>
    </div>
  );
}
