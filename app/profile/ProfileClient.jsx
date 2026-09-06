'use client';

import { useEffect, useMemo, useState } from 'react';

const sampleUserReservations = [
  {
    id: 'LB-204501',
    name: 'Demo Guest',
    email: 'guest@example.com',
    phone: '+91 99999 88888',
    room: 'Queen Room',
    checkIn: '2026-08-10',
    checkOut: '2026-08-13',
    guests: '2 Guests',
    status: 'CONFIRMED',
  },
];

function formatDate(date) {
  if (!date) return 'Not selected';

  const normalizedDate = date instanceof Date ? date : new Date(`${String(date).slice(0, 10)}T00:00:00`);

  if (Number.isNaN(normalizedDate.getTime())) {
    return 'Not selected';
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(normalizedDate);
}

function getBookingRooms(booking) {
  return booking.rooms?.length
    ? booking.rooms
    : [{ room: booking.room, roomUnit: booking.roomUnit, guests: Number.parseInt(booking.guests, 10) || 1 }];
}

export default function ProfileClient() {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState(sampleUserReservations);
  const [cancelingId, setCancelingId] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  useEffect(() => {
    async function loadProfile() {
      const savedUser = JSON.parse(window.localStorage.getItem('layaBalitaDemoUser') || 'null');
      setUser(savedUser);

      try {
        const userResponse = await fetch('/api/me');

        if (userResponse.ok) {
          const userData = await userResponse.json();
          if (userData.user) {
            setUser({
              ...userData.user,
              role: userData.user.role === 'ADMIN' ? 'Admin' : 'User',
            });
          }
        }

        const bookingsResponse = await fetch('/api/bookings');

        if (bookingsResponse.ok) {
          const bookingsData = await bookingsResponse.json();
          setBookings(bookingsData.bookings.length ? bookingsData.bookings : sampleUserReservations);
          return;
        }
      } catch {
        // Keep local demo fallback below.
      }

      const savedBookings = JSON.parse(window.localStorage.getItem('layaBalitaBookings') || '[]');
      if (savedUser?.email) {
        const userBookings = savedBookings.filter((booking) => booking.email === savedUser.email);
        setBookings(userBookings.length ? userBookings : sampleUserReservations);
      }
    }

    loadProfile();
  }, []);

  const profileStats = useMemo(() => ({
    total: bookings.length,
    upcoming: bookings.filter((booking) => booking.status !== 'CANCELLED').length,
  }), [bookings]);

  async function cancelBooking(booking) {
    if (!window.confirm(`Cancel reservation ${booking.bookingCode || booking.id}?`)) {
      return;
    }

    setCancelingId(booking.id);
    setActionMessage('');

    try {
      const response = await fetch(`/api/bookings/${booking.id}/cancel`, {
        method: 'POST',
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Could not cancel booking');
      }

      setBookings((current) => current.map((item) => (
        item.id === booking.id ? data.booking : item
      )));
      setActionMessage(data.email?.sent
        ? 'Reservation cancelled and admin has been notified.'
        : 'Reservation cancelled. Admin email could not be sent.');
    } catch (error) {
      if (String(booking.id).startsWith('LB-')) {
        setBookings((current) => current.map((item) => (
          item.id === booking.id ? { ...item, status: 'CANCELLED' } : item
        )));
        setActionMessage('Demo reservation cancelled locally.');
      } else {
        setActionMessage(error.message);
      }
    } finally {
      setCancelingId('');
    }
  }

  return (
    <section className="section admin-section">
      <div className="container">
        <div className="admin-topbar">
          <div>
            <span className="admin-eyebrow">Guest Profile</span>
            <h2>{user ? user.name : 'My Reservations'}</h2>
            <p>{user ? user.email : 'Login to see reservations connected to your email.'}</p>
          </div>
          <a href="/booking" className="btn btn-primary">Book Another Stay</a>
        </div>

        <div className="admin-stats">
          <div className="admin-stat-card">
            <span>Total Reservations</span>
            <strong>{profileStats.total}</strong>
          </div>
          <div className="admin-stat-card">
            <span>Upcoming</span>
            <strong>{profileStats.upcoming}</strong>
          </div>
          <div className="admin-stat-card">
            <span>Account Type</span>
            <strong>{user?.role || 'User'}</strong>
          </div>
        </div>

        <div className="admin-table-card">
          <div className="admin-table-header">
            <h3>Reservation History</h3>
            <span>{bookings.length} records</span>
          </div>
          {actionMessage ? <p className="profile-action-message">{actionMessage}</p> : null}
          <div className="admin-booking-list">
            {bookings.map((booking) => (
              <article className="admin-booking-row profile-booking-row" key={booking.id}>
                <div>
                  <span className="booking-id">{booking.bookingCode || booking.id}</span>
                  <h4>{booking.room}</h4>
                  {getBookingRooms(booking).map((room) => (
                    <p key={`${booking.id}-${room.roomUnit}`}>{room.roomUnit || room.room} - {room.guests} guest{room.guests === 1 ? '' : 's'}</p>
                  ))}
                </div>
                <div>
                  <span className="admin-label">Check-in</span>
                  <strong>{formatDate(booking.checkIn)}</strong>
                </div>
                <div>
                  <span className="admin-label">Check-out</span>
                  <strong>{formatDate(booking.checkOut)}</strong>
                </div>
                <div>
                  <span className={`status-badge ${booking.status.toLowerCase()}`}>{booking.status}</span>
                  <p className="profile-note">Requests are confirmed by the Laya Balita team.</p>
                  {booking.status !== 'CANCELLED' ? (
                    <button
                      type="button"
                      className="profile-cancel-button"
                      onClick={() => cancelBooking(booking)}
                      disabled={cancelingId === booking.id}
                    >
                      {cancelingId === booking.id ? 'Cancelling...' : 'Cancel'}
                    </button>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
