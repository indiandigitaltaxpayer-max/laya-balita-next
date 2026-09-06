'use client';

import Link from 'next/link';
import { useState } from 'react';
import { contactInfo } from '../data/site';

const footerColumns = [
  [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Rooms & Villas', href: '/hotel' },
  ],
  [
    { label: 'Book Now', href: '/booking' },
    { label: 'Contact', href: '/contact' },
    { label: 'Login', href: '/login' },
  ],
];

export default function Footer() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function subscribeToNewsletter(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    setMessageType('');

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || 'Could not subscribe right now.');
        setMessageType('error');
        return;
      }

      setMessage(data.message || 'Thank you for subscribing.');
      setMessageType('success');

      if (data.subscribed) {
        setEmail('');
      }
    } catch {
      setMessage('Could not subscribe right now.');
      setMessageType('error');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <footer className="section footer-section">
      <div className="container">
        <div className="row mb-4">
          {footerColumns.map((items, index) => (
            <div className="col-md-3 mb-5" key={index}>
              <ul className="list-unstyled link">
                {items.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href}>{item.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="col-md-3 mb-5 pr-md-5 contact-info">
            <p><span className="d-block">Address:</span> <span> {contactInfo.address}</span></p>
            <p><span className="d-block">Phone:</span> <span> {contactInfo.phone}</span></p>
            <p><span className="d-block">Email:</span> <span> {contactInfo.email}</span></p>
          </div>
          <div className="col-md-3 mb-5">
            <p>Sign up for our newsletter</p>
            <form className="footer-newsletter" onSubmit={subscribeToNewsletter}>
              <div className="form-group">
                <input
                  type="email"
                  className="form-control"
                  placeholder="Your email..."
                  aria-label="Newsletter email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
                <button type="submit" className="btn" aria-label="Submit newsletter signup" disabled={isSubmitting}>
                  <span className={isSubmitting ? 'fa fa-spinner fa-spin' : 'fa fa-paper-plane'} />
                </button>
              </div>
              {message ? <p className={`footer-newsletter-message ${messageType}`}>{message}</p> : null}
            </form>
          </div>
        </div>
      </div>
    </footer>
  );
}
