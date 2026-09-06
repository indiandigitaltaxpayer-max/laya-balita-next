'use client';

import { useEffect, useMemo, useState } from 'react';
import { contactInfo, navItems, socialLinks } from '../data/site';

export default function Header({ active = 'Home' }) {
  const [user, setUser] = useState(null);
  const [hasCheckedSession, setHasCheckedSession] = useState(false);

  useEffect(() => {
    async function loadSession() {
      try {
        const response = await fetch('/api/me');

        if (!response.ok) {
          setUser(null);
          return;
        }

        const data = await response.json();
        setUser(data.user || null);
      } catch {
        setUser(null);
      } finally {
        setHasCheckedSession(true);
      }
    }

    loadSession();
  }, []);

  const visibleNavItems = useMemo(() => {
    if (!hasCheckedSession) {
      return navItems.filter((item) => item.label !== 'Dashboard');
    }

    if (user) {
      return navItems.filter((item) => item.label !== 'Login');
    }

    return navItems.filter((item) => item.label !== 'Dashboard');
  }, [hasCheckedSession, user]);

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => null);
    window.localStorage.removeItem('layaBalitaDemoUser');
    window.location.href = '/';
  }

  return (
    <header className="site-header">
      <div className="container-fluid">
        <div className="row">
          <div className="col-4 site-logo" data-aos="fade">
            <a href="/" aria-label="Laya Balita home">
              <img src="/img/laya-balita-logo.png" alt="Laya Balita" />
            </a>
          </div>
          <div className="col-8">
            <div className="site-menu-toggle js-site-menu-toggle" data-aos="fade">
              <span />
              <span />
              <span />
            </div>

            <div className="site-navbar js-site-navbar">
              <nav role="navigation">
                <div className="container">
                  <div className="row full-height align-items-center">
                    <div className="col-md-6">
                      <ul className="list-unstyled menu">
                        {visibleNavItems.map((item) => (
                          <li key={item.href} className={item.label === active ? 'active' : undefined}>
                            <a href={item.href}>{item.label}</a>
                          </li>
                        ))}
                        {user ? (
                          <li>
                            <button type="button" className="nav-logout-button" onClick={logout}>
                              Logout
                            </button>
                          </li>
                        ) : null}
                      </ul>
                    </div>
                    <div className="col-md-6 extra-info">
                      <div className="row">
                        <div className="col-md-6 mb-5">
                          <h3>Contact Info</h3>
                          <p>South Cliff, Oceano Beach rd, Temple Rd, P.O,<br /> Varkala, Thiruvananthapuram, Keralam 695141</p>
                          <p>{contactInfo.email}</p>
                          <p>{contactInfo.phone}</p>
                        </div>
                        <div className="col-md-6">
                          <h3>Connect With Us</h3>
                          <ul className="list-unstyled">
                            {socialLinks.map((link) => (
                              <li key={link.label}><a href={link.href}>{link.label}</a></li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
