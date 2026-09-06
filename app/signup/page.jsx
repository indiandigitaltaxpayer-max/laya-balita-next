import Header from '../components/Header';
import Footer from '../components/Footer';
import AuthForm from '../components/AuthForm';

export const metadata = {
  title: 'Signup | Laya Balita',
  description: 'Create a Laya Balita guest account before logging in.',
};

export default function Page() {
  return (
    <>
      <Header active="Login" />
      <div>
        <section className="site-hero overlay page-inside" style={{backgroundImage: 'url(/img/hero_1.jpg)'}}>
          <div className="container">
            <div className="row site-hero-inner justify-content-center align-items-center">
              <div className="col-md-10 text-center">
                <h1 className="heading" data-aos="fade-up">Sign Up</h1>
                <p className="sub-heading mb-5" data-aos="fade-up" data-aos-delay={100}>Create your guest account, then verify it with email OTP.</p>
              </div>
            </div>
          </div>
        </section>
        <AuthForm mode="signup" />
      </div>
      <Footer />
    </>
  );
}
