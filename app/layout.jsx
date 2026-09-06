import Script from 'next/script';
import SiteChrome from './components/SiteChrome';
import './globals.css';

export const metadata = {
  title: 'Laya Balita',
  description: 'Laya Balita resort website',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Playfair+Display:wght@500;600;700&family=Mukta+Mahee:wght@200;300;400&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="/css/bootstrap.css" />
        <link rel="stylesheet" href="/css/animate.css" />
        <link rel="stylesheet" href="/css/owl.carousel.min.css" />
        <link rel="stylesheet" href="/css/aos.css" />
        <link rel="stylesheet" href="/fonts/ionicons/css/ionicons.min.css" />
        <link rel="stylesheet" href="/fonts/fontawesome/css/font-awesome.min.css" />
        <link rel="stylesheet" href="/css/style.css" />
        <link rel="stylesheet" href="/css/booking.css" />
      </head>
      <body>
        {children}
        <SiteChrome />
        <Script src="/js/jquery-3.2.1.min.js" strategy="beforeInteractive" />
        <Script src="/js/popper.min.js" strategy="afterInteractive" />
        <Script src="/js/bootstrap.min.js" strategy="afterInteractive" />
        <Script src="/js/owl.carousel.min.js" strategy="afterInteractive" />
        <Script src="/js/jquery.waypoints.min.js" strategy="afterInteractive" />
        <Script src="/js/aos.js" strategy="afterInteractive" />
        <Script src="/js/main.js" strategy="afterInteractive" />
        <Script src="/js/booking.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
