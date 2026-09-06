import Header from '../components/Header';
import Footer from '../components/Footer';
import AdminClient from './AdminClient';

export const metadata = {
  title: 'Admin Dashboard | Laya Balita',
  description: 'Demo booking dashboard for Laya Balita.',
};

export default function Page() {
  return (
    <>
      <Header active="Admin" />
      <div>
        <section className="site-hero overlay page-inside" style={{backgroundImage: 'url(/img/hero_2.jpg)'}}>
          <div className="container">
            <div className="row site-hero-inner justify-content-center align-items-center">
              <div className="col-md-10 text-center">
                <h1 className="heading" data-aos="fade-up">Admin Dashboard</h1>
                <p className="sub-heading mb-5" data-aos="fade-up" data-aos-delay={100}>Review and manage booking requests.</p>
              </div>
            </div>
          </div>
        </section>
        <AdminClient />
      </div>
      <Footer />
    </>
  );
}
