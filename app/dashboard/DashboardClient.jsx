'use client';

import { useEffect, useState } from 'react';

export default function DashboardClient() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function loadUser() {
      const savedUser = JSON.parse(window.localStorage.getItem('layaBalitaDemoUser') || 'null');
      setUser(savedUser);

      try {
        const response = await fetch('/api/me');

        if (!response.ok) return;

        const data = await response.json();
        if (data.user) {
          setUser({
            ...data.user,
            role: data.user.role === 'ADMIN' ? 'Admin' : 'User',
          });
        }
      } catch {
        setUser(savedUser);
      }
    }

    loadUser();
  }, []);

  const targetHref = user?.role === 'Admin' ? '/admin' : '/profile';
  const targetLabel = user?.role === 'Admin' ? 'Open Admin Dashboard' : 'Open My Profile';

  return (
    <section className="section auth-section">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-6">
            <div className="auth-card text-center" data-aos="fade-up">
              <span className="auth-eyebrow">Dashboard</span>
              <h2>{user ? `Welcome, ${user.name}` : 'Welcome'}</h2>
              <p>
                {user
                  ? `You are signed in as ${user.role}. Continue to the dashboard for your account.`
                  : 'Login first to open your reservation profile or admin dashboard.'}
              </p>
              <a className="btn btn-primary btn-block" href={user ? targetHref : '/login'}>
                {user ? targetLabel : 'Login'}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
