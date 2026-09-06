import Header from '../components/Header';
import Footer from '../components/Footer';
import { featureIcons, rooms } from '../data/rooms';
import { roomSlugsByName } from '../data/roomDetails';
import { propertyGalleryImages } from '../data/propertyGallery';

export const metadata = {
  title: "Find Your Stay | Laya Balita",
  description: "Explore rooms and stays at Laya Balita near Varkala Cliff.",
};

const stayOptions = [
  {
    title: 'Entire Villa',
    copy: 'Bring everyone together and enjoy the comfort of having an entire villa to yourselves.',
    features: [
      'Exclusive use of the villa',
      'Multiple private bedrooms',
      'Shared spaces to gather and unwind',
      'Ideal for families and groups',
    ],
    button: 'Explore Villas',
    href: '#villa-collection',
  },
  {
    title: 'Private Room',
    copy: 'A private retreat designed for restful nights, slow mornings, and everything in between.',
    features: [
      'Your own private room',
      'Comfortable beds and ensuite bathroom',
      'Air-conditioned and non-AC options',
      'Perfect for couples, solo travellers, friends and small groups',
    ],
    button: 'Explore Rooms',
    href: '#room-types',
  },
];

const privateRoomTypes = rooms.filter((room) => room.kind === 'room');
const googleMapsUrl = 'https://share.google/WhrtTiTnrcQsp7u4E';
const googleMapsEmbedUrl = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3748.495469218616!2d76.7112767!3d8.7273366!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b05ef7de6c91dd3%3A0x49cba0a0ec28eda!2sLaya%20Balita!5e1!3m2!1sen!2sin!4v1787486122212!5m2!1sen!2sin';

const villaCards = [
  {
    eyebrow: 'THE AZURE VILLA CARD',
    title: 'The Azure Villa',
    meta: '5 Bedrooms | All Air-Conditioned | Comfortably accommodates 12 guests',
    image: '/img/rooms/H1/Property%20Photos/IMG_7318.jpg',
    copy: 'The most spacious villa in our collection, offering generous common areas, five air-conditioned bedrooms, and the comfort of staying together under one roof.',
    features: ['Kitchen available', 'Two spacious living halls', 'Open veranda and balconies'],
    button: 'Explore The Azure Villa',
    href: '/hotel/azure-villa',
    images: ['/img/rooms/H1/Property%20Photos/IMG_7318.jpg', '/img/rooms/H1/Property%20Photos/IMG_7320.jpg', '/img/rooms/H1/Property%20Photos/IMG_7321.jpg'],
  },
  {
    eyebrow: 'THE NOOK VILLA CARD',
    title: 'The Nook Villa',
    meta: '6 Bedrooms | 4 AC + 2 Non-AC Rooms | Comfortably accommodates 12 guests',
    image: '/img/rooms/H2/Property%20Photos/Front.jpg',
    copy: 'Designed for relaxed group stays, The Nook Villa combines spacious common areas with a flexible mix of room types, making it ideal for families and groups with different comfort preferences.',
    features: ['Two spacious living halls', 'Shared balcony', 'Dining area'],
    button: 'Explore The Nook Villa',
    href: '/hotel/nook-villa',
    images: ['/img/rooms/H2/Property%20Photos/Front.jpg', '/img/rooms/H2/Property%20Photos/IMG_7287.jpg', '/img/rooms/H2/Property%20Photos/IMG_7291.jpg'],
  },
  {
    eyebrow: 'THE VERDANT VILLA CARD',
    title: 'The Verdant Villa',
    meta: '6 Bedrooms | 4 AC + 2 Non-AC Rooms | Comfortably accommodates 12 guests',
    image: '/img/rooms/H3/Property%20Photos/IMG_6984.jpg',
    copy: 'Surrounded by tropical greenery, The Verdant Villa blends the warmth of a traditional Keralam home with inviting common spaces and a peaceful garden setting.',
    features: ['Kitchen available', 'Open veranda', 'Garden with seating'],
    button: 'Explore The Verdant Villa',
    href: '/hotel/verdant-villa',
    images: ['/img/rooms/H3/Property%20Photos/IMG_6984.jpg', '/img/rooms/H3/Property%20Photos/IMG_6915.jpg', '/img/rooms/H3/Property%20Photos/IMG_6871.jpg'],
  },
];

function RoomImageGallery({ images, title }) {
  const duration = `${Math.max(images.length, 1) * 4}s`;

  return (
    <div className="room-gallery-frame" style={{'--gallery-duration': duration}}>
      {images.map((image, imageIndex) => (
        <img
          src={image}
          alt={`${title} ${imageIndex + 1}`}
          key={image}
          style={{animationDelay: `${imageIndex * 4}s`}}
        />
      ))}
    </div>
  );
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function Page() {
  return (
    <>
      <Header active="Find Your Stay" />
      <div>
        <section className="site-hero overlay page-inside" style={{backgroundImage: 'url(/img/hero_2.jpg)'}}>
          <div className="container">
            <div className="row site-hero-inner justify-content-center align-items-center">
              <div className="col-md-10 text-center">
                <h1 className="heading hotel-hero-heading">Your Stay, Your Way</h1>
                <p className="sub-heading hotel-hero-subtitle mb-4">Some journeys are better shared. Others are best enjoyed at your own pace. Whether you're planning a family getaway, a reunion with friends, or a quiet escape for two, there's a space waiting for you at Laya Balita.</p>
                <div className="hotel-hero-actions">
                  <a href="#villa-collection" className="btn btn-primary">Browse Villas</a>
                  <a href="#room-types" className="btn btn-outline-light">Browse Rooms</a>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="section hotel-stay-section">
          <div className="container">
            <div className="row justify-content-center text-center mb-5">
              <div className="col-md-8">
                <span className="hotel-section-eyebrow" data-aos="fade-up">Choose Your Pace</span>
                <h2 className="hotel-section-heading" data-aos="fade-up">Stay together, or keep it private.</h2>
              </div>
            </div>
            <div className="hotel-stay-options">
              {stayOptions.map((option, index) => (
                <article className="hotel-stay-card" key={option.title} data-aos="fade-up" data-aos-delay={index * 100}>
                  <h3>{option.title}</h3>
                  <p>{option.copy}</p>
                  <ul>
                    {option.features.map((feature) => (
                      <li key={feature}><span className="fa fa-check" aria-hidden="true" />{feature}</li>
                    ))}
                  </ul>
                  <a className="btn btn-primary" href={option.href}>{option.button}</a>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section className="section hotel-villa-section" id="villa-collection">
          <div className="container">
            <div className="row justify-content-center text-center mb-5">
              <div className="col-md-8">
                <span className="hotel-section-eyebrow" data-aos="fade-up">Villa Collection</span>
                <h2 className="hotel-section-heading" data-aos="fade-up">Our Villas</h2>
              </div>
            </div>
            <div className="hotel-villa-grid">
              {villaCards.map((villa, index) => (
                <article className="hotel-villa-card" key={villa.title} data-aos="fade-up" data-aos-delay={index * 100}>
                  <div className="hotel-villa-media">
                    <RoomImageGallery title={villa.title} images={villa.images || [villa.image]} />
                  </div>
                  <div className="hotel-villa-body">
                    <span>{villa.eyebrow}</span>
                    <h3>{villa.title}</h3>
                    <strong>{villa.meta}</strong>
                    <p>{villa.copy}</p>
                    <ul>
                      {villa.features.map((feature) => (
                        <li key={feature}><span className="fa fa-check" aria-hidden="true" />{feature}</li>
                      ))}
                    </ul>
                    <a href={villa.href} className="btn btn-primary">{villa.button} <span aria-hidden="true">&rarr;</span></a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section className="section hotel-room-section" id="room-types">
          <div className="container">
            <div className="row justify-content-center text-center mb-5">
              <div className="col-md-8">
                <span className="hotel-section-eyebrow" data-aos="fade-up">Private Rooms</span>
                <h2 className="hotel-section-heading" data-aos="fade-up">Rooms for quieter stays</h2>
                <p className="lead" data-aos="fade-up" data-aos-delay={100}>Choose from comfortable private rooms designed for couples, solo travellers, friends, and small groups who want their own space at Laya Balita.</p>
              </div>
            </div>
            <div className="hotel-room-grid">
              {privateRoomTypes.map((room, index) => (
                <article className="hotel-room-card" key={room.name} data-aos="fade-up" data-aos-delay={index * 100}>
                  <div className="hotel-room-media">
                    <RoomImageGallery images={room.images || [room.image]} title={room.name} />
                  </div>
                  <div className="hotel-room-body">
                    <h3>{room.name}</h3>
                    <p>{room.description}</p>
                    <strong>{formatCurrency(room.ratePerNight)} / night</strong>
                    <div className="room-features">
                      {room.features.map((feature) => (
                        <span className="room-feature" key={feature}>
                          <span className={`fa ${featureIcons[feature]}`} aria-hidden="true" />
                          {feature}
                        </span>
                      ))}
                    </div>
                    <a className="btn btn-primary" href={`/hotel/rooms/${roomSlugsByName[room.name]}`}>Explore Room <span aria-hidden="true">&rarr;</span></a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section className="section location-review-section hotel-location-section">
          <div className="container">
            <div className="row justify-content-center text-center mb-5">
              <div className="col-md-8">
                <span className="hotel-section-eyebrow" data-aos="fade-up">Find Your Stay</span>
                <h2 className="heading" data-aos="fade-up">Find Us in Varkala</h2>
                <p className="lead" data-aos="fade-up" data-aos-delay={100}>Located near South Cliff, Laya Balita keeps you close to the coast, cafes, and the relaxed rhythm of Varkala.</p>
              </div>
            </div>
            <div className="row justify-content-center">
              <div className="col-lg-10">
                <div className="map-card" data-aos="fade-up">
                  <iframe
                    title="Laya Balita Google Map"
                    src={googleMapsEmbedUrl}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="strict-origin-when-cross-origin"
                  />
                </div>
                <div className="text-center mt-4">
                  <a className="btn btn-primary" href={googleMapsUrl} target="_blank" rel="noreferrer">Open on Google Maps</a>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="section slider-section">
          <div className="container">
            <div className="row justify-content-center text-center mb-5">
              <div className="col-md-8">
                <h2 className="heading" data-aos="fade-up">Laya Balita Gallery</h2>
                <p className="lead" data-aos="fade-up" data-aos-delay={100}>Step into the peaceful atmosphere of Laya Balita through moments captured across our tropical spaces, cozy interiors, and the natural beauty surrounding Varkala. From warm sunlit mornings to relaxed evenings by the coast, every corner is designed to offer comfort, calm, and a memorable stay experience.</p>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <div className="home-slider major-caousel owl-carousel mb-5" data-aos="fade-up" data-aos-delay={200}>
                  {propertyGalleryImages.map((image) => (
                    <div className="slider-item" key={image.src}>
                      <img src={image.src} alt={image.alt} className="img-fluid" />
                    </div>
                  ))}
                </div>
                {/* END slider */}
              </div>
              <div className="col-md-12 text-center"><a href="/contact">Ask About the Property</a></div>
            </div>
          </div>
        </section>
        {/* END section */}
      </div>
      <Footer />
    </>
  );
}
