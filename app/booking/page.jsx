import { Suspense } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BookingClient from './BookingClient';

export const metadata = {
  title: 'Booking | Laya Balita',
  description: 'Reserve your stay at Laya Balita in Varkala.',
};

export default function Page() {
  return (
    <>
      <Header active="Booking" />
      <div>
        <section className="site-hero overlay" style={{backgroundImage: 'url(/img/hero_1.jpg)'}}>
          <div className="container">
            <div className="row site-hero-inner justify-content-center align-items-center">
              <div className="col-md-10 text-center">
                <h1 className="heading">Reserve Your Stay</h1>
                <p className="sub-heading">
                  Experience slow living near the cliffs of Varkala.
                </p>
              </div>
            </div>
          </div>
        </section>
        <Suspense fallback={<section className="section booking-section"><div className="container">Loading booking options...</div></section>}>
          <BookingClient />
        </Suspense>
      </div>
      <Footer />
    </>
  );
}
