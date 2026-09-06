import Header from './components/Header';
import Footer from './components/Footer';
import OfferImage from './components/OfferImage';
import TestimonialsSection from './components/TestimonialsSection';
import { propertyGalleryImages } from './data/propertyGallery';

export const metadata = {
  title: 'Laya Balita | Varkala Homestay Resort',
  description: 'A tropical homestay experience near the cliffs of Varkala.',
};

const offerCards = [
  {
    title: 'Spacious Rooms',
    description: 'Comfortable rooms designed for restful stays.',
    href: '/hotel',
    image: '/img/offers/spacious-rooms.jpg',
    fallbackImage: '/img/img_1.jpg',
    alt: 'Warm modern hotel room with white bedding',
  },
  {
    title: 'Tropical Garden',
    description: 'Green corners, shade, and quiet spaces to unwind.',
    href: '/about',
    image: '/img/offers/tropical-garden.jpg',
    fallbackImage: '/img/img_2.jpg',
    alt: 'Lush tropical garden with palm trees and shaded seating',
  },
  {
    title: 'South Cliff Location',
    description: 'Close enough to explore, far enough to relax.',
    href: '/contact',
    image: '/img/offers/south-cliff-location.jpg',
    fallbackImage: '/img/img_4.jpg',
    alt: 'Varkala cliff and beach coastline in Keralam',
  },
  {
    title: 'Local Hospitality',
    description: 'Helpful recommendations and genuine Keralam warmth.',
    href: '/contact',
    image: '/img/offers/local-hospitality.jpg',
    fallbackImage: '/img/img_5.jpg',
    alt: 'Hotel receptionist handing a key card to a guest',
  },
];

const villaNameByFolder = {
  H1: 'The Azure Villa',
  H2: 'The Nook Villa',
  H3: 'The Verdant Villa',
};

function getVillaNameFromImage(src) {
  const match = src.match(/\/rooms\/(H[123])\//);
  return match ? villaNameByFolder[match[1]] : null;
}

export default function Page() {
  return (
    <>
      <Header active="Home" />
      <div>
        <section className="site-hero overlay" style={{ backgroundImage: 'url(/img/hero_1.jpg)' }}>
          <div className="container">
            <div className="row site-hero-inner justify-content-center align-items-center">
              <div className="col-md-10 text-center">
                <h1 className="heading" data-aos="fade-up">Welcome to Laya Balita</h1>
                <p className="sub-heading mb-5" data-aos="fade-up" data-aos-delay={100}> Stay Near Varkala Cliff, Experience Keralam Hospitality</p>
                <p data-aos="fade-up" data-aos-delay={100}>
                  <a href="/hotel" className="btn uppercase btn-primary mr-md-2 mr-0 mb-3 d-sm-inline d-block">Find Your Rooms</a>{' '}
                  <a href="/booking" className="btn uppercase btn-outline-light d-sm-inline d-block">Plan Your Stay</a>
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="section visit-section">
          <div className="container">
            <div className="row">
              <div className="col-md-12">
                <h2 className="heading" data-aos="fade-right">We offer</h2>
              </div>
            </div>
            <div className="row">
              {offerCards.map((card, index) => (
                <div className="col-lg-3 col-md-6 visit mb-3" data-aos="fade-right" data-aos-delay={index * 100} key={card.title}>
                  <a href={card.href}>
                    <OfferImage src={card.image} fallbackSrc={card.fallbackImage} alt={card.alt} />
                  </a>
                  <h3><a href={card.href}>{card.title}</a></h3>
                  <p>{card.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="section slider-section">
          <div className="container">
            <div className="row justify-content-center text-center mb-5">
              <div className="col-md-8">
                <h2 className="heading home-stay-heading" data-aos="fade-up">
                  <span>Not a resort. Not a hostel.</span>
                  <strong>Stay, somewhere in between.</strong>
                </h2>
                <p className="lead" data-aos="fade-up" data-aos-delay={100}>More than just a place to stay, Laya Balita is your quite corner of Varkala. Hidden among tropical gardens in the peaceful South Cliff area, our stay combines spacious accommodation, thoughtful hospitality and a relaxed atmosphere, making it ideal for beach holidays, yoga retreats, workations and family getaways.</p>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <div className="home-slider major-caousel owl-carousel mb-5" data-aos="fade-up" data-aos-delay={200}>
                  {propertyGalleryImages.map((image) => (
                    <div className="slider-item" key={image.src}>
                      <img src={image.src} alt={image.alt} className="img-fluid" />
                      {getVillaNameFromImage(image.src) ? (
                        <span className="home-gallery-watermark">{getVillaNameFromImage(image.src)}</span>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
              <div className="col-md-12 text-center"><a href="/hotel">View More Photos</a></div>
            </div>
          </div>
        </section>
        <TestimonialsSection />
      </div>
      <Footer />
    </>
  );
}
