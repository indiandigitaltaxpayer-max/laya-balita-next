'use client';

import { useState } from 'react';

const countries = [
  'India',
  'United States',
  'United Kingdom',
  'United Arab Emirates',
  'Australia',
  'Canada',
  'Germany',
  'France',
  'Singapore',
  'Malaysia',
  'Sri Lanka',
  'Maldives',
  'Other',
];

export default function AuthForm({ mode }) {
  const isSignup = mode === 'signup';
  const [step, setStep] = useState('email');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: 'India',
    address: '',
    otp: '',
  });

  function updateField(field, value) {
    setFormData((current) => ({ ...current, [field]: value }));
  }

  async function requestOtp(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    const normalizedEmail = formData.email.trim().toLowerCase();

    const response = await fetch('/api/auth/request-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(isSignup
        ? {
            mode,
            firstName: formData.firstName.trim(),
            lastName: formData.lastName.trim(),
            email: normalizedEmail,
            phone: formData.phone.trim(),
            country: formData.country,
            address: formData.address.trim(),
          }
        : {
            mode,
            email: normalizedEmail,
          }),
    });
    const data = await response.json();

    setIsSubmitting(false);

    if (!response.ok) {
      setMessage(data.error || 'Could not send OTP');
      return;
    }

    setStep('otp');
    setMessage('OTP sent to your email. It expires in 10 minutes.');
  }

  async function verifyOtp(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    const normalizedEmail = formData.email.trim().toLowerCase();

    const response = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: normalizedEmail,
        otp: formData.otp,
      }),
    });
    const data = await response.json();

    setIsSubmitting(false);

    if (!response.ok) {
      setMessage(data.error || 'OTP verification failed');
      return;
    }

    window.localStorage.setItem('layaBalitaDemoUser', JSON.stringify({
      ...data.user,
      role: data.user.role === 'ADMIN' ? 'Admin' : 'User',
    }));
    setMessage('Login successful. Redirecting...');
    window.location.href = data.user.role === 'ADMIN' ? '/admin' : '/profile';
  }

  return (
    <section className="section auth-section">
      <div className="container">
        <div className="row justify-content-center">
          <div className={isSignup ? 'col-lg-7 col-md-9' : 'col-lg-5 col-md-7'}>
            <div className="auth-card" data-aos="fade-up">
              <span className="auth-eyebrow">Laya Balita</span>
              <h2>{isSignup ? 'Create Account' : 'Welcome Back'}</h2>
              <p>{isSignup ? 'Create your guest account before logging in with OTP.' : 'Login with the OTP sent to your registered email.'}</p>
              {step === 'email' ? (
                <form onSubmit={requestOtp}>
                  {isSignup ? (
                    <>
                      <div className="auth-field-grid">
                        <div className="form-group">
                          <label htmlFor="firstName">First Name</label>
                          <input
                            type="text"
                            id="firstName"
                            className="form-control"
                            value={formData.firstName}
                            onChange={(event) => updateField('firstName', event.target.value)}
                            placeholder="First name"
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="lastName">Last Name</label>
                          <input
                            type="text"
                            id="lastName"
                            className="form-control"
                            value={formData.lastName}
                            onChange={(event) => updateField('lastName', event.target.value)}
                            placeholder="Last name"
                            required
                          />
                        </div>
                      </div>
                    </>
                  ) : null}
                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                      type="email"
                      id="email"
                      className="form-control"
                      value={formData.email}
                      onChange={(event) => updateField('email', event.target.value.trim())}
                      placeholder="guest@example.com"
                      required
                    />
                  </div>
                  {isSignup ? (
                    <>
                      <div className="auth-field-grid">
                        <div className="form-group">
                          <label htmlFor="phone">Phone Number</label>
                          <input
                            type="tel"
                            id="phone"
                            className="form-control"
                            value={formData.phone}
                            onChange={(event) => updateField('phone', event.target.value)}
                            placeholder="+91 98765 43210"
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="country">Country</label>
                          <select
                            id="country"
                            className="form-control"
                            value={formData.country}
                            onChange={(event) => updateField('country', event.target.value)}
                            required
                          >
                            {countries.map((country) => (
                              <option key={country} value={country}>{country}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="form-group">
                        <label htmlFor="address">Address</label>
                        <textarea
                          id="address"
                          className="form-control auth-textarea"
                          value={formData.address}
                          onChange={(event) => updateField('address', event.target.value)}
                          placeholder="Full address"
                          required
                        />
                      </div>
                    </>
                  ) : null}
                  <button type="submit" className="btn btn-primary btn-block" disabled={isSubmitting}>
                    {isSubmitting ? 'Sending OTP...' : 'Send OTP'}
                  </button>
                </form>
              ) : (
                <form onSubmit={verifyOtp}>
                  <div className="form-group">
                    <label htmlFor="otp">Enter OTP</label>
                    <input
                      type="text"
                      id="otp"
                      className="form-control"
                      value={formData.otp}
                      onChange={(event) => updateField('otp', event.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="6-digit code"
                      inputMode="numeric"
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary btn-block" disabled={isSubmitting}>
                    {isSubmitting ? 'Verifying...' : 'Verify & Login'}
                  </button>
                  <button type="button" className="auth-link-button" onClick={() => setStep('email')}>
                    Change email
                  </button>
                </form>
              )}
              {message ? <p className="auth-message">{message}</p> : null}
              <p className="auth-switch">
                {isSignup ? 'Already have an account?' : 'New guest?'}{' '}
                <a href={isSignup ? '/login' : '/signup'}>{isSignup ? 'Login' : 'Create account'}</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
