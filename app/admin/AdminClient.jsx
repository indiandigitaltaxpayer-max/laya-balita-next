'use client';

import { useEffect, useMemo, useState } from 'react';

const sampleBookings = [
  {
    id: 'LB-104821',
    name: 'Anjali Menon',
    email: 'anjali@example.com',
    phone: '+91 98765 43210',
    room: 'Villa 1',
    roomUnit: 'V1-101',
    checkIn: '2026-08-03',
    checkOut: '2026-08-09',
    guests: '2 Guests',
    nights: 6,
    ratePerNight: 6500,
    breakfastOpted: true,
    breakfastCharge: 450,
    breakfastComplimentary: false,
    estimatedTotal: 41700,
    status: 'PENDING',
    createdAt: '2026-06-01T08:30:00.000Z',
  },
  {
    id: 'LB-104822',
    name: 'Rahul Nair',
    email: 'rahul@example.com',
    phone: '+91 90000 11122',
    room: 'King Room',
    roomUnit: 'KR-102',
    checkIn: '2026-08-18',
    checkOut: '2026-08-21',
    guests: '1 Guest',
    nights: 3,
    ratePerNight: 4800,
    breakfastOpted: false,
    breakfastCharge: 350,
    breakfastComplimentary: false,
    estimatedTotal: 14400,
    status: 'CONFIRMED',
    createdAt: '2026-06-02T11:20:00.000Z',
  },
];

const emptyTestimonialForm = {
  guestName: '',
  guestLocation: '',
  rating: 5,
  quote: '',
  isPublished: false,
  sortOrder: 0,
};

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

function formatCurrency(amount = 0) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

function getBookingRooms(booking) {
  return booking.rooms?.length
    ? booking.rooms
    : [{ room: booking.room, roomUnit: booking.roomUnit, guests: Number.parseInt(booking.guests, 10) || 1 }];
}

export default function AdminClient() {
  const [bookings, setBookings] = useState(sampleBookings);
  const [roomTypes, setRoomTypes] = useState([]);
  const [testimonialForm, setTestimonialForm] = useState(emptyTestimonialForm);
  const [testimonials, setTestimonials] = useState([]);
  const [user, setUser] = useState(null);
  const [selectedUserEmail, setSelectedUserEmail] = useState('');
  const [adminMessage, setAdminMessage] = useState('');
  const [rateMessage, setRateMessage] = useState('');
  const [testimonialMessage, setTestimonialMessage] = useState('');
  const [savingRateId, setSavingRateId] = useState('');
  const [savingTestimonial, setSavingTestimonial] = useState(false);

  useEffect(() => {
    async function loadAdminData() {
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

        const [response, roomTypesResponse, testimonialsResponse] = await Promise.all([
          fetch('/api/admin/bookings'),
          fetch('/api/admin/room-types'),
          fetch('/api/admin/testimonials'),
        ]);

        if (response.ok) {
          const data = await response.json();
          setBookings(data.bookings);
        }

        if (roomTypesResponse.ok) {
          const data = await roomTypesResponse.json();
          setRoomTypes(data.roomTypes);
        }

        if (testimonialsResponse.ok) {
          const data = await testimonialsResponse.json();
          setTestimonials(data.testimonials);
        }

        return;
      } catch {
        // Keep local demo fallback below.
      }

      const savedBookings = JSON.parse(window.localStorage.getItem('layaBalitaBookings') || '[]');
      setBookings([...savedBookings, ...sampleBookings]);
    }

    loadAdminData();
  }, []);

  const stats = useMemo(() => {
    const pending = bookings.filter((booking) => booking.status === 'PENDING').length;
    const confirmed = bookings.filter((booking) => booking.status === 'CONFIRMED').length;

    return {
      total: bookings.length,
      pending,
      confirmed,
    };
  }, [bookings]);

  async function updateStatus(id, status) {
    const booking = bookings.find((item) => item.id === id);
    setAdminMessage('');

    if (booking?.bookingCode) {
      const response = await fetch(`/api/admin/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        setBookings((current) => current.map((item) => (item.id === id ? data.booking : item)));
        setAdminMessage(`Booking ${data.booking.bookingCode} marked as ${data.booking.status}.`);
        return;
      }

      setAdminMessage(data.error || 'Could not update booking status.');
      return;
    }

    const updatedBookings = bookings.map((booking) => (
      booking.id === id ? { ...booking, status } : booking
    ));
    const savedOnly = updatedBookings.filter((booking) => !sampleBookings.some((sample) => sample.id === booking.id));

    setBookings(updatedBookings);
    window.localStorage.setItem('layaBalitaBookings', JSON.stringify(savedOnly));
    setAdminMessage(`Demo booking marked as ${status}.`);
  }

  async function toggleBreakfastComplimentary(id) {
    const booking = bookings.find((item) => item.id === id);

    if (booking?.bookingCode) {
      const response = await fetch(`/api/admin/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ breakfastComplimentary: !booking.breakfastComplimentary }),
      });

      if (response.ok) {
        const data = await response.json();
        setBookings((current) => current.map((item) => (item.id === id ? data.booking : item)));
        return;
      }
    }

    const updatedBookings = bookings.map((booking) => (
      booking.id === id ? { ...booking, breakfastComplimentary: !booking.breakfastComplimentary } : booking
    ));
    const savedOnly = updatedBookings.filter((booking) => !sampleBookings.some((sample) => sample.id === booking.id));

    setBookings(updatedBookings);
    window.localStorage.setItem('layaBalitaBookings', JSON.stringify(savedOnly));
  }

  function updateRoomTypeField(id, field, value) {
    setRoomTypes((current) => current.map((roomType) => (
      roomType.id === id ? { ...roomType, [field]: value } : roomType
    )));
  }

  async function saveRoomTypeRate(roomType) {
    setRateMessage('');
    setSavingRateId(roomType.id);

    const response = await fetch(`/api/admin/room-types/${roomType.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ratePerNight: roomType.ratePerNight,
        breakfastCharge: roomType.breakfastCharge,
      }),
    });
    const data = await response.json().catch(() => ({}));

    setSavingRateId('');

    if (!response.ok) {
      setRateMessage(data.error || 'Could not update rates.');
      return;
    }

    setRoomTypes((current) => current.map((item) => (
      item.id === roomType.id ? { ...item, ...data.roomType } : item
    )));
    setRateMessage(`${data.roomType.name} rates updated.`);
  }

  function updateTestimonialForm(field, value) {
    setTestimonialForm((current) => ({ ...current, [field]: value }));
  }

  async function createTestimonial(event) {
    event.preventDefault();
    setSavingTestimonial(true);
    setTestimonialMessage('');

    const response = await fetch('/api/admin/testimonials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testimonialForm),
    });
    const data = await response.json().catch(() => ({}));

    setSavingTestimonial(false);

    if (!response.ok) {
      setTestimonialMessage(data.error || 'Could not add testimonial.');
      return;
    }

    setTestimonials((current) => [data.testimonial, ...current].sort((a, b) => a.sortOrder - b.sortOrder));
    setTestimonialForm(emptyTestimonialForm);
    setTestimonialMessage('Testimonial added.');
  }

  async function updateTestimonial(id, payload) {
    setTestimonialMessage('');

    const response = await fetch(`/api/admin/testimonials/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setTestimonialMessage(data.error || 'Could not update testimonial.');
      return;
    }

    setTestimonials((current) => current.map((testimonial) => (
      testimonial.id === id ? data.testimonial : testimonial
    )).sort((a, b) => a.sortOrder - b.sortOrder));
    setTestimonialMessage('Testimonial updated.');
  }

  async function deleteTestimonial(id) {
    setTestimonialMessage('');

    const response = await fetch(`/api/admin/testimonials/${id}`, {
      method: 'DELETE',
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setTestimonialMessage(data.error || 'Could not delete testimonial.');
      return;
    }

    setTestimonials((current) => current.filter((testimonial) => testimonial.id !== id));
    setTestimonialMessage('Testimonial deleted.');
  }

  const selectedUserBookings = selectedUserEmail
    ? bookings.filter((booking) => booking.email === selectedUserEmail)
    : [];
  const isAdminUser = !user?.role || user.role === 'Admin' || user.role === 'ADMIN';

  if (!isAdminUser) {
    return (
      <section className="section admin-section">
        <div className="container">
          <div className="auth-card text-center">
            <span className="admin-eyebrow">Guest Account</span>
            <h2>Reservation Profile</h2>
            <p>You are signed in as a user. Open your profile to track reservations and stay details.</p>
            <a href="/profile" className="btn btn-primary">Open My Profile</a>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section admin-section">
      <div className="container">
        <div className="admin-topbar">
          <div>
            <span className="admin-eyebrow">Demo Dashboard</span>
            <h2>Booking Requests</h2>
            <p>{user ? `Signed in as ${user.email}` : 'Demo mode. Login creates a local demo session.'}</p>
          </div>
          <a href="/booking" className="btn btn-primary">New Booking</a>
        </div>

        <div className="admin-stats">
          <div className="admin-stat-card">
            <span>Total Requests</span>
            <strong>{stats.total}</strong>
          </div>
          <div className="admin-stat-card">
            <span>Pending</span>
            <strong>{stats.pending}</strong>
          </div>
          <div className="admin-stat-card">
            <span>Confirmed</span>
            <strong>{stats.confirmed}</strong>
          </div>
        </div>

        <div className="admin-table-card admin-rates-card">
          <div className="admin-table-header">
            <div>
              <h3>Rates & Add-ons</h3>
              <p>Set nightly rates and breakfast charges used by the booking page.</p>
            </div>
            <span>{roomTypes.length} products</span>
          </div>
          {rateMessage ? <p className="admin-message">{rateMessage}</p> : null}
          <div className="admin-rate-list">
            {roomTypes.map((roomType) => (
              <article className="admin-rate-row" key={roomType.id}>
                <div>
                  <span className="admin-label">{roomType.unitCount === 1 ? 'Villa/Product' : 'Room Type'}</span>
                  <strong>{roomType.name}</strong>
                  <p>{roomType.unitCount} bookable unit{roomType.unitCount === 1 ? '' : 's'}</p>
                </div>
                <label>
                  <span>Nightly Rate</span>
                  <input
                    type="number"
                    min="0"
                    value={roomType.ratePerNight}
                    onChange={(event) => updateRoomTypeField(roomType.id, 'ratePerNight', event.target.value)}
                  />
                </label>
                <label>
                  <span>Breakfast / Night</span>
                  <input
                    type="number"
                    min="0"
                    value={roomType.breakfastCharge}
                    onChange={(event) => updateRoomTypeField(roomType.id, 'breakfastCharge', event.target.value)}
                  />
                </label>
                <button
                  type="button"
                  className="admin-save-button"
                  disabled={savingRateId === roomType.id}
                  onClick={() => saveRoomTypeRate(roomType)}
                >
                  {savingRateId === roomType.id ? 'Saving...' : 'Save'}
                </button>
              </article>
            ))}
          </div>
        </div>

        <div className="admin-table-card">
          <div className="admin-table-header">
            <h3>Recent Booking Requests</h3>
            <span>{bookings.length} records</span>
          </div>
          {adminMessage ? <p className="admin-message">{adminMessage}</p> : null}
          <div className="admin-booking-list">
            {bookings.map((booking) => (
              <article className="admin-booking-row" key={booking.id}>
                <div>
                  <span className="booking-id">{booking.bookingCode || booking.id}</span>
                  <button type="button" className="admin-user-button" onClick={() => setSelectedUserEmail(booking.email)}>
                    {booking.name}
                  </button>
                  <p>{booking.email} | {booking.phone}</p>
                </div>
                <div>
                  <span className="admin-label">Room</span>
                  <strong>{booking.room}</strong>
                  {getBookingRooms(booking).map((room) => (
                    <p key={`${booking.id}-${room.roomUnit}`}>{room.roomUnit || 'Room ID pending'} - {room.guests} guest{room.guests === 1 ? '' : 's'}</p>
                  ))}
                </div>
                <div>
                  <span className="admin-label">Stay</span>
                  <strong>{formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}</strong>
                  <p>{booking.guests}</p>
                  <p>{formatCurrency(booking.ratePerNight)} / night</p>
                  <p>Breakfast: {booking.breakfastOpted ? (booking.breakfastComplimentary ? 'Complimentary' : formatCurrency(booking.breakfastCharge)) : 'Not requested'}</p>
                  <p>Total: {formatCurrency(booking.breakfastComplimentary && booking.breakfastOpted ? booking.estimatedTotal - (booking.breakfastCharge * Math.max(booking.nights || 1, 1)) : booking.estimatedTotal)}</p>
                </div>
                <div>
                  <span className={`status-badge ${booking.status.toLowerCase()}`}>{booking.status}</span>
                  <div className="admin-actions">
                    <button type="button" onClick={() => updateStatus(booking.id, 'CONFIRMED')}>Confirm</button>
                    <button type="button" onClick={() => updateStatus(booking.id, 'PENDING')}>Pending</button>
                    <button type="button" onClick={() => updateStatus(booking.id, 'CANCELLED')}>Cancel</button>
                    {booking.breakfastOpted ? (
                      <button type="button" onClick={() => toggleBreakfastComplimentary(booking.id)}>
                        {booking.breakfastComplimentary ? 'Charge Breakfast' : 'Complimentary Breakfast'}
                      </button>
                    ) : null}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        {selectedUserEmail ? (
          <div className="admin-user-history">
            <div className="admin-table-header">
              <h3>User Booking History</h3>
              <button type="button" onClick={() => setSelectedUserEmail('')}>Close</button>
            </div>
            <p>{selectedUserEmail}</p>
            <div className="admin-booking-list">
              {selectedUserBookings.map((booking) => (
                <article className="admin-history-row" key={`${booking.id}-history`}>
                  <span className="booking-id">{booking.bookingCode || booking.id}</span>
                  <strong>{booking.room}</strong>
                  {getBookingRooms(booking).map((room) => (
                    <span key={`${booking.id}-${room.roomUnit}`}>{room.roomUnit || 'Room ID pending'} - {room.guests} guest{room.guests === 1 ? '' : 's'}</span>
                  ))}
                  <span>{formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}</span>
                  <span className={`status-badge ${booking.status.toLowerCase()}`}>{booking.status}</span>
                </article>
              ))}
            </div>
          </div>
        ) : null}

        <div className="admin-table-card admin-testimonial-card">
          <div className="admin-table-header">
            <div>
              <h3>Testimonials</h3>
              <p>Add guest testimonials and publish them to the home page when ready.</p>
            </div>
            <span>{testimonials.filter((testimonial) => testimonial.isPublished).length} published</span>
          </div>
          {testimonialMessage ? <p className="admin-message">{testimonialMessage}</p> : null}
          <form className="admin-testimonial-form" onSubmit={createTestimonial}>
            <div className="admin-form-grid">
              <label>
                <span>Guest Name</span>
                <input
                  type="text"
                  value={testimonialForm.guestName}
                  onChange={(event) => updateTestimonialForm('guestName', event.target.value)}
                  required
                />
              </label>
              <label>
                <span>Location</span>
                <input
                  type="text"
                  value={testimonialForm.guestLocation}
                  onChange={(event) => updateTestimonialForm('guestLocation', event.target.value)}
                  placeholder="Optional"
                />
              </label>
              <label>
                <span>Rating</span>
                <select
                  value={testimonialForm.rating}
                  onChange={(event) => updateTestimonialForm('rating', Number(event.target.value))}
                >
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <option key={rating} value={rating}>{rating} Star{rating === 1 ? '' : 's'}</option>
                  ))}
                </select>
              </label>
              <label>
                <span>Display Order</span>
                <input
                  type="number"
                  min="0"
                  value={testimonialForm.sortOrder}
                  onChange={(event) => updateTestimonialForm('sortOrder', Number(event.target.value))}
                />
              </label>
            </div>
            <label className="admin-wide-field">
              <span>Testimonial</span>
              <textarea
                value={testimonialForm.quote}
                onChange={(event) => updateTestimonialForm('quote', event.target.value)}
                required
              />
            </label>
            <div className="admin-form-actions">
              <label className="admin-checkbox">
                <input
                  type="checkbox"
                  checked={testimonialForm.isPublished}
                  onChange={(event) => updateTestimonialForm('isPublished', event.target.checked)}
                />
                <span>Publish on home page</span>
              </label>
              <button type="submit" className="btn btn-primary" disabled={savingTestimonial}>
                {savingTestimonial ? 'Adding...' : 'Add Testimonial'}
              </button>
            </div>
          </form>
          <div className="admin-testimonial-list">
            {testimonials.map((testimonial) => (
              <article className="admin-testimonial-row" key={testimonial.id}>
                <div>
                  <strong>{testimonial.guestName}</strong>
                  <p>{testimonial.guestLocation || 'No location'} | {testimonial.rating} star{testimonial.rating === 1 ? '' : 's'} | Order {testimonial.sortOrder}</p>
                  <blockquote>{testimonial.quote}</blockquote>
                </div>
                <div className="admin-actions">
                  <button
                    type="button"
                    onClick={() => updateTestimonial(testimonial.id, { isPublished: !testimonial.isPublished })}
                  >
                    {testimonial.isPublished ? 'Unpublish' : 'Publish'}
                  </button>
                  <button type="button" onClick={() => deleteTestimonial(testimonial.id)}>Delete</button>
                </div>
              </article>
            ))}
            {!testimonials.length ? <p>No testimonials added yet.</p> : null}
          </div>
        </div>
      </div>
    </section>
  );
}
