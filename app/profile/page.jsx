import Header from '../components/Header';
import Footer from '../components/Footer';
import ProfileClient from './ProfileClient';

export const metadata = {
  title: 'My Profile | Laya Balita',
  description: 'View Laya Balita reservations and guest profile information.',
};

export default function Page() {
  return (
    <>
      <Header active="Dashboard" />
      <div>
        <section className="site-hero overlay page-inside" style={{backgroundImage: 'url(/img/hero_2.jpg)'}}>
          <div className="container">
            <div className="row site-hero-inner justify-content-center align-items-center">
              <div className="col-md-10 text-center">
                <h1 className="heading" data-aos="fade-up">My Profile</h1>
                <p className="sub-heading mb-5" data-aos="fade-up" data-aos-delay={100}>Track your reservations and stay details.</p>
              </div>
            </div>
          </div>
        </section>
        <ProfileClient />
      </div>
      <Footer />
    </>
  );
}
