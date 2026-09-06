import Header from '../components/Header';
import Footer from '../components/Footer';
import DashboardClient from './DashboardClient';

export const metadata = {
  title: 'Dashboard | Laya Balita',
  description: 'Open the right Laya Balita dashboard for your account.',
};

export default function Page() {
  return (
    <>
      <Header active="Dashboard" />
      <div>
        <section className="site-hero overlay page-inside" style={{backgroundImage: 'url(/img/hero_1.jpg)'}}>
          <div className="container">
            <div className="row site-hero-inner justify-content-center align-items-center">
              <div className="col-md-10 text-center">
                <h1 className="heading" data-aos="fade-up">Dashboard</h1>
                <p className="sub-heading mb-5" data-aos="fade-up" data-aos-delay={100}>Continue to your reservation space.</p>
              </div>
            </div>
          </div>
        </section>
        <DashboardClient />
      </div>
      <Footer />
    </>
  );
}
