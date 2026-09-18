import Header from '../components/Header';
import Footer from '../components/Footer';
import GoogleReviewsCard from '../components/GoogleReviewsCard';

export const metadata = {
  title: "Contact | Laya Balita",
  description: "Contact Laya Balita for your Varkala stay.",
};

const googleMapsUrl = 'https://share.google/WhrtTiTnrcQsp7u4E';
const googleMapsEmbedUrl = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3748.495469218616!2d76.7112767!3d8.7273366!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b05ef7de6c91dd3%3A0x49cba0a0ec28eda!2sLaya%20Balita!5e1!3m2!1sen!2sin!4v1787486122212!5m2!1sen!2sin';
const phoneNumber = '+916282076128';
const whatsappUrl = 'https://wa.me/916282076128';
const emailAddress = 'info@layabalita.com';

export default function Page() {
  return (
    <>
      <Header active="Contact" />
      <div>
        <section className="site-hero overlay page-inside" style={{backgroundImage: 'url(/img/hero_2.jpg)'}}>
          <div className="container">
            <div className="row site-hero-inner justify-content-center align-items-center">
              <div className="col-md-10 text-center">
                <h1 className="heading contact-hero-heading" data-aos="fade-up">Planning a Stay in Varkala?</h1>
                <p className="sub-heading contact-hero-subtitle mb-5" data-aos="fade-up" data-aos-delay={100}>Whether you're checking availability, planning a longer stay, or simply have a question, we'd be happy to help.</p>
              </div>
            </div>
          </div>
        </section>
        <section className="section bg-primary contact-section">
          <div className="container">
            <div className="row">
              <div className="col-md-7">
                <form action="#" method="post" className="bg-white p-md-5 p-4 mb-5" style={{marginTop: '-150px'}}>
                  <div className="row">
                    <div className="col-md-6 form-group">
                      <label htmlFor="name">Name</label>
                      <input type="text" id="name" className="form-control " />
                    </div>
                    <div className="col-md-6 form-group">
                      <label htmlFor="whatsapp">WhatsApp Number</label>
                      <input type="text" id="whatsapp" className="form-control " />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6 form-group">
                      <label htmlFor="startDate">Start Date</label>
                      <input type="date" id="startDate" className="form-control " />
                    </div>
                    <div className="col-md-6 form-group">
                      <label htmlFor="endDate">End Date</label>
                      <input type="date" id="endDate" className="form-control " />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-12 form-group">
                      <label htmlFor="email">Email</label>
                      <input type="email" id="email" className="form-control " />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-12 form-group">
                      <label htmlFor="message">Write Message</label>
                      <textarea name="message" id="message" className="form-control " cols={30} rows={8} defaultValue={""} />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6 form-group">
                      <input type="submit" defaultValue="Send Enquiry" className="btn btn-primary" />
                    </div>
                  </div>
                </form>
              </div>
              <div className="col-md-5">
                <div className="row">
                  <div className="col-md-10 ml-auto contact-info">
                    <p><span className="d-block">Address:</span> <span> South Cliff, Oceano Beach rd, Temple Rd, P.O, Varkala, Thiruvananthapuram, Keralam 695141</span></p>
                    <p><span className="d-block">Phone:</span> <span> (+91) 62820 76128</span></p>
                    <p><span className="d-block">Email:</span> <span> {emailAddress}</span></p>
                    <div className="contact-action-buttons">
                      <a className="btn btn-primary" href={`tel:${phoneNumber}`} aria-label="Call Laya Balita" title="Call Laya Balita">
                        <i className="fa fa-phone" aria-hidden="true" />
                      </a>
                      <a className="btn btn-primary" href={whatsappUrl} target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp" title="Chat on WhatsApp">
                        <i className="fa fa-whatsapp" aria-hidden="true" />
                      </a>
                      <a className="btn btn-primary" href={`mailto:${emailAddress}`} aria-label="Email Laya Balita" title="Email Laya Balita">
                        <i className="fa fa-envelope" aria-hidden="true" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="section location-review-section">
          <div className="container">
            <div className="row justify-content-center text-center mb-5">
              <div className="col-md-8">
                <h2 className="heading" data-aos="fade-up">Find Us in Varkala</h2>
                <p className="lead" data-aos="fade-up" data-aos-delay={100}>Located near South Cliff, Laya Balita keeps you close to the coast, cafes, and the relaxed rhythm of Varkala.</p>
              </div>
            </div>
            <div className="row align-items-stretch">
              <div className="col-lg-7 mb-4 mb-lg-0">
                <div className="map-card" data-aos="fade-right">
                  <iframe
                    title="Laya Balita Google Map"
                    src={googleMapsEmbedUrl}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="strict-origin-when-cross-origin"
                  />
                </div>
              </div>
              <div className="col-lg-5">
                <GoogleReviewsCard fallbackUrl={googleMapsUrl} />
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
