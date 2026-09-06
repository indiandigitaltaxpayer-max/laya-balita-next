import Header from '../components/Header';
import Footer from '../components/Footer';
import AuthForm from '../components/AuthForm';

export const metadata = {
  title: 'Login | Laya Balita',
  description: 'Login to your Laya Balita account with email OTP.',
};

export default function Page() {
  return (
    <>
      <Header active="Login" />
      <div>
        <section className="site-hero overlay page-inside" style={{backgroundImage: 'url(/img/hero_2.jpg)'}}>
          <div className="container">
            <div className="row site-hero-inner justify-content-center align-items-center">
              <div className="col-md-10 text-center">
                <h1 className="heading" data-aos="fade-up">Login</h1>
                <p className="sub-heading mb-5" data-aos="fade-up" data-aos-delay={100}>Access your reservations with your registered email OTP.</p>
              </div>
            </div>
          </div>
        </section>
        <AuthForm mode="login" />
      </div>
      <Footer />
    </>
  );
}
