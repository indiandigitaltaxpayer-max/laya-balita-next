'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

const TIMEZONE_COUNTRIES = {
  'Asia/Calcutta': 'IN',
  'Asia/Kolkata': 'IN',
};
const whatsappUrl = 'https://wa.me/916282076128';

function normalizeCountryCode(countryCode) {
  if (!countryCode) return '';

  const normalized = countryCode.trim().toUpperCase();
  return /^[A-Z]{2}$/.test(normalized) ? normalized : '';
}

function getCountryFromTimezone() {
  if (typeof Intl === 'undefined') return '';

  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return TIMEZONE_COUNTRIES[timezone] || '';
  } catch {
    return '';
  }
}

function getCountryFromLocale() {
  if (typeof navigator === 'undefined') return 'IN';

  try {
    const languages = navigator.languages?.length ? navigator.languages : [navigator.language];

    for (const language of languages) {
      const locale = new Intl.Locale(language);
      const country = normalizeCountryCode(locale.region);

      if (country) return country;
    }

    return 'IN';
  } catch {
    return 'IN';
  }
}

export default function SiteChrome() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [country, setCountry] = useState('IN');
  const [showLogoImage, setShowLogoImage] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function updateVisitorCountry() {
      const timezoneCountry = getCountryFromTimezone();

      if (timezoneCountry) {
        setCountry(timezoneCountry);
      }

      try {
        const response = await fetch('/api/visitor-country');
        const data = response.ok ? await response.json() : {};
        const headerCountry = normalizeCountryCode(data.country);

        if (!cancelled && headerCountry) {
          setCountry(headerCountry);
          return;
        }
      } catch {
        // The badge can still fall back to browser information if geo headers are unavailable.
      }

      if (!cancelled && !timezoneCountry) {
        setCountry(getCountryFromLocale());
      }
    }

    updateVisitorCountry();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setLoading(true);
    const timer = window.setTimeout(() => setLoading(false), 650);

    return () => window.clearTimeout(timer);
  }, [pathname]);

  return (
    <>
      {loading ? (
        <div className="page-loader" aria-label="Page loading">
          <div className="page-loader-mark">
            {showLogoImage ? (
              <img src="/img/laya-balita-logo.png" alt="Laya Balita" onError={() => setShowLogoImage(false)} />
            ) : (
              <span>Laya Balita</span>
            )}
          </div>
        </div>
      ) : null}

      <div className="country-badge" aria-label={`Visitor country ${country}`}>
        <span className="fa fa-globe" aria-hidden="true" />
        {country}
      </div>

      <div className="floating-actions">
        <a
          className="floating-whatsapp"
          href={whatsappUrl}
          target="_blank"
          rel="noreferrer"
          aria-label="Chat with Laya Balita on WhatsApp"
          title="Chat on WhatsApp"
        >
          <span className="fa fa-whatsapp" aria-hidden="true" />
        </a>
        {pathname !== '/booking' ? (
          <a className="floating-book-now" href="/booking">Book Now</a>
        ) : null}
      </div>
    </>
  );
}
