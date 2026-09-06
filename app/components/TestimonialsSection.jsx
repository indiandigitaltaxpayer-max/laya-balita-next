'use client';

import { useEffect, useState } from 'react';

function Stars({ rating }) {
  return (
    <span className="testimonial-stars" aria-label={`${rating} out of 5 stars`}>
      {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
    </span>
  );
}

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState([]);

  useEffect(() => {
    let isMounted = true;

    async function loadTestimonials() {
      try {
        const response = await fetch('/api/testimonials');
        if (!response.ok) return;

        const data = await response.json();
        if (isMounted) {
          setTestimonials(data.testimonials || []);
        }
      } catch {
        // Keep the section hidden if testimonials cannot be loaded.
      }
    }

    loadTestimonials();

    return () => {
      isMounted = false;
    };
  }, []);

  if (!testimonials.length) {
    return null;
  }

  return (
    <section className="section testimonial-section bg-light">
      <div className="container">
        <div className="row justify-content-center text-center mb-5">
          <div className="col-md-8">
            <h2 className="heading" data-aos="fade-up">Guest Stories</h2>
            <p className="lead" data-aos="fade-up" data-aos-delay={100}>Kind words from travellers who have stayed with us at Laya Balita.</p>
          </div>
        </div>
        <div className="row">
          {testimonials.map((testimonial, index) => (
            <div className="col-md-4 mb-4" key={testimonial.id} data-aos="fade-up" data-aos-delay={index * 100}>
              <article className="testimonial-card">
                <Stars rating={testimonial.rating} />
                <blockquote>{testimonial.quote}</blockquote>
                <div>
                  <strong>{testimonial.guestName}</strong>
                  {testimonial.guestLocation ? <span>{testimonial.guestLocation}</span> : null}
                </div>
              </article>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
