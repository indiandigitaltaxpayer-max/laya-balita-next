import Footer from './Footer';
import Header from './Header';

const whatsappUrl = 'https://wa.me/916282076128';

function Checklist({ items }) {
  return (
    <ul className="villa-check-list">
      {items.map((item) => (
        <li key={item}><span className="fa fa-check" aria-hidden="true" />{item}</li>
      ))}
    </ul>
  );
}

export default function VillaDetail({ villa }) {
  return (
    <>
      <Header active="Find Your Stay" />
      <div>
        <section className="site-hero overlay page-inside villa-detail-hero" style={{backgroundImage: `url(${villa.heroImage})`}}>
          <div className="container">
            <div className="row site-hero-inner justify-content-center align-items-center">
              <div className="col-md-10 text-center">
                <span className="villa-detail-eyebrow">{villa.eyebrow}</span>
                <h1 className="heading hotel-hero-heading">{villa.name}</h1>
                <p className="sub-heading hotel-hero-subtitle mb-4">{villa.tagline}</p>
                <div className="hotel-hero-actions">
                  <a href={`/booking?room=${encodeURIComponent(villa.name)}#booking-options`} className="btn btn-primary">Reserve Entire Villa</a>
                  <a href="/hotel#room-types" className="btn btn-outline-light">Book Individual Rooms</a>
                  <a href={whatsappUrl} className="btn btn-outline-light" target="_blank" rel="noreferrer">Chat on WhatsApp</a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section villa-detail-section">
          <div className="container">
            <div className="villa-detail-intro">
              <div>
                <span className="hotel-section-eyebrow">At a Glance</span>
                <h2>{villa.introHeading}</h2>
                {villa.intro.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </div>
              <div className="villa-glance-grid">
                {villa.glance.map(([icon, label]) => (
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
            <div className="row justify-content-center text-center mb-5">
              <div className="col-md-8">
                <span className="hotel-section-eyebrow">Spaces You'll Enjoy</span>
                <h2 className="hotel-section-heading">Room to gather, rest, and slow down</h2>
              </div>
            </div>
            <div className="villa-info-grid">
              {villa.spaces.map(([title, copy, image]) => (
                <article className="villa-info-card" key={title}>
                  <img src={image} alt={`${villa.name} ${title}`} />
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section villa-detail-section">
          <div className="container">
            <div className="villa-two-column">
              <article className="villa-panel">
                <span className="hotel-section-eyebrow">Bedroom Layout</span>
                <h2>Where everyone sleeps</h2>
                <div className="villa-layout-list">
                  {villa.layout.map(([floor, rooms]) => (
                    <div key={floor}>
                      <h3>{floor}</h3>
                      <Checklist items={rooms} />
                    </div>
                  ))}
                </div>
              </article>
              <article className="villa-panel">
                <span className="hotel-section-eyebrow">Every Bedroom Includes</span>
                <h2>Comforts in each room</h2>
                <Checklist items={villa.includes} />
              </article>
            </div>
          </div>
        </section>

        <section className="section villa-detail-band">
          <div className="container">
            <div className="villa-two-column">
              <article className="villa-panel">
                <span className="hotel-section-eyebrow">Amenities</span>
                <h2>What's included</h2>
                <Checklist items={villa.amenities} />
              </article>
              <article className="villa-panel">
                <span className="hotel-section-eyebrow">Good To Know</span>
                <h2>Before you book</h2>
                <Checklist items={villa.goodToKnow} />
              </article>
            </div>
          </div>
        </section>

        <section className="section villa-detail-section">
          <div className="container">
            <div className="row justify-content-center text-center mb-5">
              <div className="col-md-8">
                <span className="hotel-section-eyebrow">Perfect For</span>
                <h2 className="hotel-section-heading">Stays that feel easy together</h2>
              </div>
            </div>
            <div className="villa-tag-grid">
              {villa.perfectFor.map((item) => <span key={item}>{item}</span>)}
            </div>
          </div>
        </section>

        <section className="section villa-detail-band">
          <div className="container">
            <div className="row justify-content-center text-center mb-5">
              <div className="col-md-8">
                <span className="hotel-section-eyebrow">FAQ</span>
                <h2 className="hotel-section-heading">Common questions</h2>
              </div>
            </div>
            <div className="villa-faq-list">
              {villa.faqs.map(([question, answer]) => (
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
            <span className="hotel-section-eyebrow">Ready to make {villa.name} yours?</span>
            <h2>Whether you're gathering with family, travelling with friends, or planning a special getaway, we'd be delighted to welcome you.</h2>
            <div className="hotel-hero-actions">
              <a href={`/booking?room=${encodeURIComponent(villa.name)}#booking-options`} className="btn btn-primary">Reserve Entire Villa</a>
              <a href="/hotel#room-types" className="btn btn-outline-light">Book Individual Rooms</a>
              <a href={whatsappUrl} className="btn btn-outline-light" target="_blank" rel="noreferrer">Chat on WhatsApp</a>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
