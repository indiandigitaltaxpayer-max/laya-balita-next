import Footer from './Footer';
import Header from './Header';
import { baseIncluded, baseRules, locationHighlights, roomDetailList } from '../data/roomDetails';
import { featureIcons } from '../data/rooms';

const whatsappUrl = 'https://wa.me/916282076128';

function Checklist({ items }) {
  return (
    <ul className="villa-check-list">
      {items.map((item) => <li key={item}><span className="fa fa-check" aria-hidden="true" />{item}</li>)}
    </ul>
  );
}

export default function RoomDetail({ detail }) {
  const room = detail.room;

  return (
    <>
      <Header active="Find Your Stay" />
      <div>
        <section className="site-hero overlay page-inside villa-detail-hero" style={{backgroundImage: `url(${room.image})`}}>
          <div className="container">
            <div className="row site-hero-inner justify-content-center align-items-center">
              <div className="col-md-10 text-center">
                <span className="villa-detail-eyebrow">Private Room</span>
                <h1 className="heading hotel-hero-heading">{detail.name}</h1>
                <p className="sub-heading hotel-hero-subtitle mb-4">{detail.headline}</p>
                <div className="hotel-hero-actions">
                  <a href={`/booking?room=${encodeURIComponent(detail.name)}#booking-options`} className="btn btn-primary">Check Availability</a>
                  <a href={`/booking?room=${encodeURIComponent(detail.name)}#booking-options`} className="btn btn-outline-light">Reserve Room</a>
                  <a href={whatsappUrl} className="btn btn-outline-light" target="_blank" rel="noreferrer">WhatsApp Us</a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section villa-detail-section">
          <div className="container">
            <div className="villa-detail-intro">
              <div>
                <span className="hotel-section-eyebrow">About This Room</span>
                <h2>{detail.intro}</h2>
                <p>{detail.about}</p>
                <p className="room-detail-note">Representative images are shown. Room layouts, furniture placement and decor may vary slightly while maintaining the same room category and amenities.</p>
              </div>
              <div className="villa-glance-grid">
                {detail.quickFacts.map(([icon, label]) => (
                  <div className="villa-glance-item" key={label}>
                    <span className={`fa ${icon}`} aria-hidden="true" />
                    <strong>{label}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="section villa-detail-band">
          <div className="container">
            <div className="room-detail-gallery">
              {(room.images || [room.image]).slice(0, 4).map((image, index) => (
                <img src={image} alt={`${detail.name} representative ${index + 1}`} key={image} />
              ))}
            </div>
          </div>
        </section>

        <section className="section villa-detail-section">
          <div className="container">
            <div className="villa-two-column">
              <article className="villa-panel">
                <span className="hotel-section-eyebrow">Available In</span>
                <h2>Room allocation</h2>
                <Checklist items={detail.availableIn} />
              </article>
              <article className="villa-panel">
                <span className="hotel-section-eyebrow">Every Room Includes</span>
                <h2>Core comforts</h2>
                <Checklist items={baseIncluded} />
              </article>
            </div>
          </div>
        </section>

        <section className="section villa-detail-band">
          <div className="container">
            <div className="room-amenity-grid">
              {Object.entries(detail.amenities).map(([group, items]) => (
                <article className="villa-panel" key={group}>
                  <span className="hotel-section-eyebrow">{group}</span>
                  <h2>{group} amenities</h2>
                  <Checklist items={items} />
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section villa-detail-section">
          <div className="container">
            <div className="villa-two-column">
              <article className="villa-panel">
                <span className="hotel-section-eyebrow">Good To Know</span>
                <h2>Before you book</h2>
                <Checklist items={detail.goodToKnow} />
              </article>
              <article className="villa-panel">
                <span className="hotel-section-eyebrow">House Rules</span>
                <h2>Stay guidelines</h2>
                <Checklist items={baseRules} />
                <a href="/about" className="room-detail-link">View Full House Rules</a>
              </article>
            </div>
          </div>
        </section>

        <section className="section villa-detail-band">
          <div className="container">
            <div className="villa-two-column">
              <article className="villa-panel">
                <span className="hotel-section-eyebrow">Perfect For</span>
                <h2>Best suited for</h2>
                <Checklist items={detail.perfectFor} />
              </article>
              <article className="villa-panel">
                <span className="hotel-section-eyebrow">Location Highlights</span>
                <h2>Near South Cliff</h2>
                <Checklist items={locationHighlights} />
              </article>
            </div>
          </div>
        </section>

        <section className="section villa-detail-section">
          <div className="container">
            <div className="row justify-content-center text-center mb-5">
              <div className="col-md-8">
                <span className="hotel-section-eyebrow">Explore Other Room Types</span>
                <h2 className="hotel-section-heading">Compare private rooms</h2>
              </div>
            </div>
            <div className="villa-tag-grid">
              {roomDetailList.filter((item) => item.name !== detail.name).map((item) => (
                <a href={`/hotel/rooms/${item.slug}`} key={item.slug}>{item.name}</a>
              ))}
            </div>
          </div>
        </section>

        <section className="section villa-detail-band">
          <div className="container">
            <div className="villa-faq-list">
              {detail.faqs.map(([question, answer]) => (
                <article key={question}>
                  <h3>{question}</h3>
                  <p>{answer}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section villa-cta-section">
          <div className="container text-center">
            <span className="hotel-section-eyebrow">Reserve This Room</span>
            <h2>Ready to plan your stay?</h2>
            <div className="hotel-hero-actions">
              <a href={`/booking?room=${encodeURIComponent(detail.name)}#booking-options`} className="btn btn-primary">Reserve Room</a>
              <a href={whatsappUrl} className="btn btn-outline-light" target="_blank" rel="noreferrer">WhatsApp Us</a>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
