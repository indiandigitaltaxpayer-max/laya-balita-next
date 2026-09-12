import Header from '../components/Header';
import Footer from '../components/Footer';
import { propertyGalleryImages } from '../data/propertyGallery';

export const metadata = {
  title: "About | Laya Balita",
  description: "Learn about the Laya Balita homestay experience.",
};

export default function Page() {
  return (
    <>
      <Header active="About" />
      <div>
        <section className="site-hero overlay page-inside" style={{backgroundImage: 'url(/img/hero_2.jpg)'}}>
          <div className="container">
            <div className="row site-hero-inner justify-content-center align-items-center">
              <div className="col-md-10 text-center">
                <h1 className="heading" data-aos="fade-up">Our Story</h1>
                <p className="sub-heading about-hero-story mb-5" data-aos="fade-up" data-aos-delay={100}>
                  <span>Laya Balita began with a simple idea: create a peaceful space where travellers could experience Varkala beyond crowded itineraries and tourist checklists.</span>
                  <span>Surrounded by tropical gardens and located just minutes from the cliff and beach, our homestay welcomes solo travellers, couples, families, and long-stay guests looking for comfort and simplicity.</span>
                  <span>We believe good hospitality is not about luxury. It is about thoughtful spaces, genuine conversations, and helping guests feel at home.</span>
                </p>
              </div>
            </div>
            {/* <a href="#" class="scroll-down">Scroll Down</a> */}
          </div>
        </section>
        {/* END section */}
        <section className="section slider-section">
          <div className="container">
            <div className="row justify-content-center text-center mb-5">
              <div className="col-md-8">
                <h2 className="heading about-name-heading" data-aos="fade-up">WHY THE NAME LAYA BALITA?</h2>
                <div className="lead about-name-copy" data-aos="fade-up" data-aos-delay={100}>
                  <p>The name Laya Balita is inspired by the spirit of Varkala itself.</p>
                  <p>Balita is believed to be one of the ancient names associated with Varkala, connecting our homestay to the history and heritage of this coastal town. Laya is a Sanskrit word that can mean to dissolve, merge, or find harmony.</p>
                  <p>Together, Laya Balita reflects the experience we hope to offer our guests - a place where the noise of everyday life fades away, and where you can slow down, relax, and connect with the natural rhythm of Varkala.</p>
                  <p>Surrounded by tropical greenery and just minutes from the cliffs and beaches, our homestay is designed for travellers seeking comfort, peace, and a sense of belonging. Whether you're here for a holiday, a workation, a yoga retreat, or simply some quiet time, Laya Balita invites you to immerse yourself in the calm and character of old Varkala.</p>
                </div>
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
              <div className="col-md-12 text-center"><a href="/hotel">View More Photos</a></div>
            </div>
          </div>
        </section>
        {/* END section */}
        <section className="section blog-post-entry bg-pattern">
          <div className="container">
            <div className="row justify-content-center text-center mb-5">
              <div className="col-md-8">
                <h2 className="heading about-host-heading" data-aos="fade-up">Meet your host</h2>
                <p className="lead about-host-copy" data-aos="fade-up">Laya Balita is a family-run homestay managed by people who love Varkala and enjoy helping travellers discover it beyond guidebooks. Whether you're looking for hidden beaches, local food recommendations, yoga studios, or transport assistance, we're always happy to help.</p>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-4 col-md-6 col-sm-6 col-12 post" data-aos="fade-up" data-aos-delay={100}>
                <div className="media media-custom d-block mb-4">
                  <a href="#" className="mb-4 d-block"><img src="/img/ajayakumar.png" alt="Ajayakumar" className="img-fluid about-host-image" /></a>
                  <div className="media-body">
                    <span className="meta-post">Founder</span>
                    <h2 className="mt-0 mb-3"><a href="#">Ajayakumar</a></h2>
                  </div>
                </div>
              </div>
              <div className="col-lg-4 col-md-6 col-sm-6 col-12 post" data-aos="fade-up" data-aos-delay={200}>
                <div className="media media-custom d-block mb-4">
                  <a href="#" className="mb-4 d-block"><img src="/img/bindu.png" alt="Bindu" className="img-fluid about-host-image" /></a>
                  <div className="media-body">
                    <span className="meta-post">Hospitality and Guest Relations</span>
                    <h2 className="mt-0 mb-3"><a href="#">Bindu</a></h2>
                  </div>
                </div>
              </div>
              <div className="col-lg-4 col-md-6 col-sm-6 col-12 post" data-aos="fade-up" data-aos-delay={300}>
                <div className="media media-custom d-block mb-4">
                  <a href="#" className="mb-4 d-block"><img src="/img/ashwan.jpeg" alt="Ashwan" className="img-fluid about-host-image" /></a>
                  <div className="media-body">
                    <span className="meta-post">Creative Director</span>
                    <h2 className="mt-0 mb-3"><a href="#">Ashwan</a></h2>
                  </div>
                </div>
              </div>
              {/* 
          <div class="col-lg-4 col-md-6 col-sm-6 col-12 post" data-aos="fade-up" data-aos-delay="100">
            <div class="media media-custom d-block mb-4">
              <a href="#" class="mb-4 d-block"><img src="/img/person_3.jpg" alt="Image placeholder" class="img-fluid"></a>
              <div class="media-body">
                <span class="meta-post">CEO, Co-Founder</span>
                <h2 class="mt-0 mb-3"><a href="#">Vince Richardson</a></h2>
              </div>
            </div>
          </div>
          <div class="col-lg-4 col-md-6 col-sm-6 col-12 post" data-aos="fade-up" data-aos-delay="200">
            <div class="media media-custom d-block mb-4">
              <a href="#" class="mb-4 d-block"><img src="/img/person_1.jpg" alt="Image placeholder" class="img-fluid"></a>
              <div class="media-body">
                <span class="meta-post">CTO, Co-Founder</span>
                <h2 class="mt-0 mb-3"><a href="#">Jean Love</a></h2>
              </div>
            </div>
          </div>
          <div class="col-lg-4 col-md-6 col-sm-6 col-12 post" data-aos="fade-up" data-aos-delay="300">
            <div class="media media-custom d-block mb-4">
              <a href="#" class="mb-4 d-block"><img src="/img/person_2.jpg" alt="Image placeholder" class="img-fluid"></a>
              <div class="media-body">
                <span class="meta-post">Marketer, Co-Founder</span>
                <h2 class="mt-0 mb-3"><a href="#">Jeff Stark</a></h2>
              </div>
            </div>
          </div> */}
            </div>
          </div>
        </section>
        <section className="section journey-section">
          <div className="container">
            <div className="row justify-content-center text-center mb-5">
              <div className="col-md-8">
                <h2 className="heading journey-heading" data-aos="fade-up">Our Journey</h2>
                <p className="lead journey-intro" data-aos="fade-up" data-aos-delay={100}>Every corner of Laya Balita has a story. What began as a simple renovation project has grown into a welcoming homestay for travellers discovering the beauty of Varkala.</p>
              </div>
            </div>
            <div className="journey-timeline">
              <article className="journey-item" tabIndex={0} data-aos="fade-up" data-aos-delay={100}>
                <div className="journey-marker" />
                <div className="journey-card">
                  <span>May 2024</span>
                  <h3>A Dream Takes Shape</h3>
                  <p>We began renovating our very first building with a simple vision - to create a peaceful place where travellers could feel at home. Walls were repaired, spaces reimagined, and the journey of Laya Balita quietly began.</p>
                </div>
              </article>
              <article className="journey-item" tabIndex={0} data-aos="fade-up" data-aos-delay={150}>
                <div className="journey-marker" />
                <div className="journey-card">
                  <span>March 2025</span>
                  <h3>Opening Our Doors</h3>
                  <p>After months of planning and hard work, we welcomed our first guests. What started as an idea became a living space filled with conversations, memories, and travellers from around the world.</p>
                </div>
              </article>
              <article className="journey-item" tabIndex={0} data-aos="fade-up" data-aos-delay={200}>
                <div className="journey-marker" />
                <div className="journey-card">
                  <span>June 2026</span>
                  <h3>One Vision, Three Homes</h3>
                  <p>Encouraged by the support of our guests, we expanded our vision. Two additional buildings joined the Laya Balita family, and renovation work began to create even more comfortable spaces for future visitors.</p>
                </div>
              </article>
              <article className="journey-item" tabIndex={0} data-aos="fade-up" data-aos-delay={250}>
                <div className="journey-marker" />
                <div className="journey-card">
                  <span>August 2026</span>
                  <h3>A New Chapter Begins</h3>
                  <p>With all three buildings fully operational, Laya Balita became more than a single homestay. Together, they formed a small hospitality community built around comfort, greenery, and authentic Keralam hospitality.</p>
                </div>
              </article>
              <article className="journey-item" tabIndex={0} data-aos="fade-up" data-aos-delay={300}>
                <div className="journey-marker" />
                <div className="journey-card">
                  <span>Future</span>
                  <h3>The Best Chapters Are Yet to Come</h3>
                  <p>More stories. More travellers. More reasons to return to Varkala.</p>
                </div>
              </article>
            </div>
          </div>
        </section>
        <section className="section property-info-section">
          <div className="container">
            <div className="row justify-content-center text-center mb-5">
              <div className="col-md-8">
                <h2 className="heading" data-aos="fade-up">Property Information</h2>
                <p className="lead" data-aos="fade-up" data-aos-delay={100}>Important details for a comfortable and respectful stay at Laya Balita.</p>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-4 mb-4" data-aos="fade-up" data-aos-delay={100}>
                <div className="property-info-card">
                  <h3>House Rules</h3>
                  <ul>
                    <li>Check-in from 2:00 PM and check-out by 11:00 AM.</li>
                    <li>Quiet hours are observed after 10:00 PM.</li>
                    <li>Outside guests are allowed only with prior approval.</li>
                    <li>Please keep shared spaces clean and respect other guests.</li>
                  </ul>
                </div>
              </div>
              <div className="col-lg-4 mb-4" data-aos="fade-up" data-aos-delay={200}>
                <div className="property-info-card">
                  <h3>Terms &amp; Conditions</h3>
                  <ul>
                    <li>Reservation requests are confirmed after property approval.</li>
                    <li>Valid ID is required during check-in.</li>
                    <li>Cancellation and refund terms may vary by season.</li>
                    <li>Damage to property may be charged to the guest.</li>
                  </ul>
                </div>
              </div>
              <div className="col-lg-4 mb-4" data-aos="fade-up" data-aos-delay={300}>
                <div className="property-info-card">
                  <h3>Facilities Offered</h3>
                  <ul>
                    <li>Free WiFi across the property.</li>
                    <li>Air-conditioned rooms with private bathrooms.</li>
                    <li>Breakfast available on request.</li>
                    <li>Garden seating and easy access to Varkala attractions.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
