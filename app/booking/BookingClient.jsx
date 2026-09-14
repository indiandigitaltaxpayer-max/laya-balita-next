'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { featureIcons, rooms as fallbackRooms } from '../data/rooms';

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const guestOptions = Array.from({ length: 16 }, (_, index) => `${index + 1} Guest${index === 0 ? '' : 's'}`);

function getCurrentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function getMonthLabel(month) {
  return new Intl.DateTimeFormat('en-IN', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${month}-01T00:00:00`));
}

function buildCalendarDays(month, availabilityByDate) {
  const [year, monthNumber] = month.split('-').map(Number);
  const firstDay = new Date(year, monthNumber - 1, 1);
  const lastDay = new Date(year, monthNumber, 0);
  const previousMonthLastDay = new Date(year, monthNumber - 1, 0).getDate();
  const days = [];

  for (let index = firstDay.getDay() - 1; index >= 0; index -= 1) {
    days.push({ label: String(previousMonthLastDay - index), status: 'inactive' });
  }

  for (let day = 1; day <= lastDay.getDate(); day += 1) {
    const date = `${month}-${String(day).padStart(2, '0')}`;
    days.push({
      label: String(day),
      date,
      status: availabilityByDate[date] || 'available',
    });
  }

  return days;
}

function toLocalDateString(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

function getDateRange(checkIn, checkOut) {
  const dates = [];

  if (!checkIn || !checkOut || checkOut <= checkIn) {
    return dates;
  }

  const cursor = new Date(`${checkIn}T00:00:00`);
  const lastNight = new Date(`${checkOut}T00:00:00`);

  while (cursor < lastNight) {
    dates.push(toLocalDateString(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return dates;
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(date) {
  if (!date) return 'Not selected';

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${date}T00:00:00`));
}

function getGuestNumber(guestCount) {
  return Number.parseInt(guestCount, 10) || 1;
}

function AnimatedRoomImages({ images, alt, className = '' }) {
  const galleryImages = images?.length ? images : [];
  const duration = `${Math.max(galleryImages.length, 1) * 4}s`;

  if (!galleryImages.length) return null;

  return (
    <span className={`animated-room-images ${className}`} style={{'--gallery-duration': duration}}>
      {galleryImages.map((image, imageIndex) => (
        <img
          src={image}
          alt={`${alt} ${imageIndex + 1}`}
          key={image}
          style={{animationDelay: `${imageIndex * 4}s`}}
        />
      ))}
    </span>
  );
}

function StaticRoomImage({ images, alt, className = '' }) {
  const image = images?.[0];

  if (!image) return null;

  return (
    <span className={`animated-room-images ${className}`}>
      <img src={image} alt={alt} />
    </span>
  );
}

function getCardImages(room) {
  return room?.cardImages || room?.images?.slice(0, 5) || (room?.image ? [room.image] : []);
}

function getUnitPreviewImage(unit, room) {
  const images = unit?.images || getCardImages(room);
  const bedImage = images.find((image) => /_bed_1\./.test(image));
  return bedImage ? [bedImage] : images.slice(0, 1);
}

export default function BookingClient() {
  const searchParams = useSearchParams();
  const requestedRoomName = searchParams.get('room') || '';
  const bookingSectionRef = useRef(null);
  const [availableRooms, setAvailableRooms] = useState(fallbackRooms);
  const [currentUser, setCurrentUser] = useState(null);
  const [hasCheckedSession, setHasCheckedSession] = useState(false);
  const [selectedRoomName, setSelectedRoomName] = useState('');
  const [selectedRoomUnit, setSelectedRoomUnit] = useState('');
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [calendarMonth] = useState(getCurrentMonth);
  const [availabilityByDate, setAvailabilityByDate] = useState({});
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guestCount, setGuestCount] = useState('1 Guest');
  const [breakfastOpted, setBreakfastOpted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [submitMessage, setSubmitMessage] = useState('');
  const [preselectionMessage, setPreselectionMessage] = useState('');
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadRooms() {
      try {
        const response = await fetch('/api/rooms');

        if (!response.ok) return;

        const data = await response.json();
        setAvailableRooms(data.rooms.map((room) => ({
          ...room,
          units: room.units.map((unit) => ({
            id: unit.id,
            code: unit.roomCode,
            images: unit.images,
          })),
        })));
      } catch {
        setAvailableRooms(fallbackRooms);
      }
    }

    loadRooms();
  }, []);

  useEffect(() => {
    async function loadCurrentUser() {
      try {
        const response = await fetch('/api/me');
        if (!response.ok) {
          setCurrentUser(null);
          return;
        }

        const data = await response.json();
        if (data.user) {
          setCurrentUser(data.user);
          setFormData((current) => ({
            ...current,
            name: current.name || data.user.name || '',
            email: current.email || data.user.email || '',
            phone: current.phone || '',
          }));
        } else {
          setCurrentUser(null);
        }
      } catch {
        setCurrentUser(null);
      } finally {
        setHasCheckedSession(true);
      }
    }

    loadCurrentUser();
  }, []);

  useEffect(() => {
    if (!requestedRoomName || selectedRoomName) return;

    const matchingRoom = availableRooms.find((room) => room.name === requestedRoomName);
    if (matchingRoom) {
      selectRoom(matchingRoom.name);
      setPreselectionMessage(`Selected from Find Your Stay: ${matchingRoom.name}`);

      window.setTimeout(() => {
        bookingSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        bookingSectionRef.current?.focus({ preventScroll: true });
      }, 120);
    }
  }, [availableRooms, requestedRoomName, selectedRoomName]);

  const selectedRoom = useMemo(
    () => availableRooms.find((room) => room.name === selectedRoomName),
    [availableRooms, selectedRoomName],
  );

  const villaRooms = useMemo(
    () => availableRooms.filter((room) => room.kind === 'villa'),
    [availableRooms],
  );

  const privateRooms = useMemo(
    () => availableRooms.filter((room) => room.kind !== 'villa'),
    [availableRooms],
  );

  const selectedUnit = useMemo(
    () => selectedRoom?.units.find((unit) => (unit.code || unit) === selectedRoomUnit),
    [selectedRoom, selectedRoomUnit],
  );

  const selectedRoomUnits = useMemo(
    () => new Set(selectedRooms.map((room) => room.roomUnitId)),
    [selectedRooms],
  );

  const calendarDays = useMemo(
    () => buildCalendarDays(calendarMonth, availabilityByDate),
    [availabilityByDate, calendarMonth],
  );

  const guestNumber = getGuestNumber(guestCount);

  useEffect(() => {
    if (!selectedRoom?.id) {
      setAvailabilityByDate({});
      setAvailabilityError('');
      return;
    }

    let cancelled = false;

    async function loadAvailability() {
      setAvailabilityLoading(true);
      setAvailabilityError('');

      try {
        const params = new URLSearchParams({
          roomTypeId: selectedRoom.id,
          month: calendarMonth,
        });

        if (selectedUnit?.id) {
          params.set('roomUnitId', selectedUnit.id);
        }

        const response = await fetch(`/api/availability?${params.toString()}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Could not load availability.');
        }

        if (!cancelled) {
          setAvailabilityByDate(
            Object.fromEntries(data.availability.map((day) => [day.date, day.status])),
          );
        }
      } catch (error) {
        if (!cancelled) {
          setAvailabilityByDate({});
          setAvailabilityError(error.message || 'Could not load availability.');
        }
      } finally {
        if (!cancelled) {
          setAvailabilityLoading(false);
        }
      }
    }

    loadAvailability();

    return () => {
      cancelled = true;
    };
  }, [calendarMonth, selectedRoom?.id, selectedUnit?.id]);

  useEffect(() => {
    if (selectedRoom?.kind !== 'villa') return;

    setSelectedRooms((current) => current.map((room) => ({
      ...room,
      guests: guestNumber,
    })));
  }, [guestNumber, selectedRoom?.kind]);

  const nights = useMemo(() => {
    if (!checkIn || !checkOut || checkOut <= checkIn) return 0;

    return Math.ceil((new Date(`${checkOut}T00:00:00`) - new Date(`${checkIn}T00:00:00`)) / 86400000);
  }, [checkIn, checkOut]);

  const estimatedTotal = useMemo(() => {
    if (!selectedRooms.length) return 0;

    const billableNights = Math.max(nights, 1);
    const roomTotal = selectedRooms.reduce((sum, room) => sum + room.ratePerNight * billableNights, 0);
    const breakfastTotal = breakfastOpted
      ? selectedRooms.reduce((sum, room) => sum + room.breakfastCharge * room.guests * billableNights, 0)
      : 0;

    return roomTotal + breakfastTotal;
  }, [breakfastOpted, nights, selectedRooms]);

  const selectedGuestTotal = useMemo(
    () => selectedRooms.reduce((sum, room) => sum + room.guests, 0),
    [selectedRooms],
  );

  const recommendedKind = guestNumber > 8 ? 'villa' : 'room';
  const recommendationCopy = guestNumber > 8
    ? 'For this group size, an entire villa will usually be the most comfortable option.'
    : 'For this group size, private rooms are usually the easiest place to start.';

  function selectRoom(roomName) {
    const room = availableRooms.find((item) => item.name === roomName);
    setSelectedRoomName(roomName);
    setSelectedRoomUnit('');
    if (room?.kind === 'villa') {
      setSelectedRooms([]);
    }
  }

  function selectRoomUnit(roomUnit) {
    if (!selectedRoom) return;

    const unitCode = roomUnit.code || roomUnit;
    const unitId = roomUnit.id || unitCode;
    setSelectedRoomUnit(unitCode);

    if (selectedRoom.kind === 'villa') {
      setSelectedRooms([{
        roomTypeId: selectedRoom.id,
        roomUnitId: unitId,
        roomName: selectedRoom.name,
        roomCode: unitCode,
        guests: guestNumber,
        ratePerNight: selectedRoom.ratePerNight,
        breakfastCharge: selectedRoom.breakfastCharge,
      }]);
      return;
    }

    setSelectedRooms((current) => {
      const existing = current.find((room) => room.roomUnitId === unitId);

      if (existing) {
        return current.filter((room) => room.roomUnitId !== unitId);
      }

      return [
        ...current,
        {
          roomTypeId: selectedRoom.id,
          roomUnitId: unitId,
          roomName: selectedRoom.name,
          roomCode: unitCode,
          guests: 1,
          ratePerNight: selectedRoom.ratePerNight,
          breakfastCharge: selectedRoom.breakfastCharge,
        },
      ];
    });
  }

  function updateSelectedRoomGuests(roomUnitId, guests) {
    setSelectedRooms((current) => current.map((room) => (
      room.roomUnitId === roomUnitId ? { ...room, guests: Number(guests) || 1 } : room
    )));
  }

  function removeSelectedRoom(roomUnitId) {
    setSelectedRooms((current) => current.filter((room) => room.roomUnitId !== roomUnitId));
  }

  function selectCalendarDay(day) {
    if (!selectedRoom || !day.date || day.status === 'booked' || day.status === 'inactive') {
      return;
    }

    if (!checkIn || checkOut || day.date <= checkIn) {
      setCheckIn(day.date);
      setCheckOut('');
      return;
    }

    setCheckOut(day.date);
  }

  function getDayClass(day) {
    const classes = ['calendar-day', day.status];

    if (day.date === checkIn) classes.push('selected-date', 'check-in-date');
    if (day.date === checkOut) classes.push('selected-date', 'check-out-date');
    if (day.date && checkIn && checkOut && day.date > checkIn && day.date < checkOut) {
      classes.push('in-stay-range');
    }
    if (day.status === 'booked' || day.status === 'inactive') {
      classes.push('not-selectable');
    }

    return classes.join(' ');
  }

  function updateFormData(field, value) {
    setFormData((current) => ({ ...current, [field]: value }));
  }

  function isStayRangeAvailable() {
    return getDateRange(checkIn, checkOut).every((date) => availabilityByDate[date] !== 'booked');
  }

  function renderRoomOption(room) {
    const isSelected = selectedRoomName === room.name;
    const isRecommended = room.kind === recommendedKind;

    return (
      <button
        type="button"
        className={`booking-room-option${isSelected ? ' selected' : ''}${isRecommended ? ' recommended' : ''}`}
        key={room.name}
        onClick={() => selectRoom(room.name)}
        aria-pressed={isSelected}
      >
        {isRecommended ? <span className="booking-recommendation-badge">Recommended</span> : null}
        <AnimatedRoomImages images={getCardImages(room)} alt={room.name} />
        <span className="booking-room-option-body">
          <span className="booking-room-option-title">{room.name}</span>
          <span className="booking-room-rate">{formatCurrency(room.ratePerNight)} / night</span>
          <span className="booking-room-option-copy">{room.description}</span>
          <span className="room-features">
            {room.features.slice(0, 4).map((feature) => (
              <span className="room-feature" key={feature}>
                <span className={`fa ${featureIcons[feature]}`} aria-hidden="true" />
                {feature}
              </span>
            ))}
          </span>
        </span>
      </button>
    );
  }

  function submitBooking(event) {
    event.preventDefault();

    if (!selectedRoomName || !selectedRooms.length || !checkIn || !checkOut || !formData.name || !formData.email || !formData.phone) {
      setSubmitMessage('Please select at least one room, dates, and complete the contact details.');
      return;
    }

    if (!isStayRangeAvailable()) {
      setSubmitMessage('Selected dates are not available for this room. Please choose different dates.');
      return;
    }

    if (!currentUser) {
      setSubmitMessage('Please login with email OTP before making a reservation request.');
      return;
    }

    setSubmitMessage('');
    setShowSummaryModal(true);
  }

  async function confirmBooking() {
    setIsSubmitting(true);

    const bookingPayload = {
      guestName: formData.name,
      guestEmail: formData.email,
      guestPhone: formData.phone,
      selectedRooms: selectedRooms.map((room) => ({
        roomTypeId: room.roomTypeId,
        roomUnitId: room.roomUnitId,
        guests: room.guests,
      })),
      checkIn,
      checkOut,
      guests: `${selectedGuestTotal || guestNumber} Guest${(selectedGuestTotal || guestNumber) === 1 ? '' : 's'}`,
      breakfastOpted,
    };
    const booking = {
      id: `LB-${Date.now().toString().slice(-6)}`,
      room: selectedRooms.length === 1 ? selectedRooms[0].roomName : `${selectedRooms.length} Private Rooms`,
      roomUnit: selectedRooms.map((room) => room.roomCode).join(', '),
      checkIn,
      checkOut,
      guests: bookingPayload.guests,
      nights,
      ratePerNight: selectedRooms.reduce((sum, room) => sum + room.ratePerNight, 0),
      breakfastOpted,
      breakfastCharge: selectedRooms.reduce((sum, room) => sum + room.breakfastCharge * room.guests, 0),
      breakfastComplimentary: false,
      estimatedTotal,
      status: 'Pending',
      createdAt: new Date().toISOString(),
      ...formData,
    };

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingPayload),
      });
      const data = await response.json();

      if (response.ok) {
        const emailMessage = data.email?.sent
          ? 'The request has been emailed to the admin.'
          : 'Booking saved. Admin email is pending SMTP configuration.';

        setSubmitMessage(`Booking ${data.booking.bookingCode} submitted. ${emailMessage}`);
        setShowSummaryModal(false);
        setIsSubmitting(false);
        return;
      }

      setSubmitMessage(data.error || 'Could not submit booking request.');
      setShowSummaryModal(false);
      setIsSubmitting(false);
      return;
    } catch {
      // Fall back to local demo storage below.
    }

    const existingBookings = JSON.parse(window.localStorage.getItem('layaBalitaBookings') || '[]');
    window.localStorage.setItem('layaBalitaBookings', JSON.stringify([booking, ...existingBookings]));
    setSubmitMessage(`Demo booking ${booking.id} saved locally. Configure DATABASE_URL to save it to MySQL.`);
    setShowSummaryModal(false);
    setIsSubmitting(false);
  }

  return (
    <section className="section booking-section" id="booking-options" ref={bookingSectionRef} tabIndex={-1}>
      <div className="container">
        <div className="row justify-content-center text-center mb-5">
          <div className="col-md-8">
            <h2 className="heading" data-aos="fade-up">Choose Your Room</h2>
            <p className="lead" data-aos="fade-up" data-aos-delay={100}>
              Select a room type first to view availability and complete your reservation request.
            </p>
          </div>
        </div>

        {preselectionMessage ? (
          <div className="booking-source-note" data-aos="fade-up">
            <span>{preselectionMessage}</span>
            <a href="/hotel">Change stay type</a>
          </div>
        ) : null}

        <div className="booking-suggestion-panel" data-aos="fade-up" data-aos-delay={120}>
          <div>
            <span className="selected-room-label">Find a Suitable Stay</span>
            <h3>Start with dates and guests</h3>
            <p>{recommendationCopy} You can still choose any villa or room below.</p>
          </div>
          <div className="booking-suggestion-fields">
            <label>
              <span>Check-in</span>
              <input type="date" value={checkIn} onChange={(event) => setCheckIn(event.target.value)} />
            </label>
            <label>
              <span>Check-out</span>
              <input type="date" value={checkOut} onChange={(event) => setCheckOut(event.target.value)} />
            </label>
            <label>
              <span>Guests</span>
              <select value={guestCount} onChange={(event) => setGuestCount(event.target.value)}>
                {guestOptions.map((option) => <option key={option}>{option}</option>)}
              </select>
            </label>
          </div>
        </div>

        <div className="booking-room-groups" data-aos="fade-up" data-aos-delay={150}>
          <div className="booking-room-group">
            <div className="booking-room-group-heading">
              <span>Entire Villas</span>
              <p>Best for families, reunions, and larger groups staying together.</p>
            </div>
            <div className="booking-room-selector">
              {villaRooms.map(renderRoomOption)}
            </div>
          </div>

          <div className="booking-room-group">
            <div className="booking-room-group-heading">
              <span>Private Rooms</span>
              <p>Comfortable rooms for couples, solo travellers, friends, and smaller groups.</p>
            </div>
            <div className="booking-room-selector">
              {privateRooms.map(renderRoomOption)}
            </div>
          </div>
        </div>

        {selectedRoom ? (
          <div className="selected-room-summary" data-aos="fade-up">
            <div>
              <span className="selected-room-label">Selected Room</span>
              <h3>{selectedRoom.name}</h3>
              <p>{selectedRoom.description}</p>
              <div className="booking-price-line">
                <span>{formatCurrency(selectedRoom.ratePerNight)} / night</span>
                <span>Breakfast: {formatCurrency(selectedRoom.breakfastCharge)} per night</span>
              </div>
            </div>
            <div className="room-features">
              {selectedRoom.features.map((feature) => (
                <span className="room-feature" key={feature}>
                  <span className={`fa ${featureIcons[feature]}`} aria-hidden="true" />
                  {feature}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {selectedRoom ? (
          <div className="room-unit-selector" data-aos="fade-up">
            <div>
              <span className="selected-room-label">Choose Specific Room</span>
              <h3>{selectedRoom.name} room IDs</h3>
              <p>
                {selectedRoom.kind === 'villa'
                  ? 'Select one available villa for this request.'
                  : 'Select one or more available rooms for this request.'}
              </p>
            </div>
            <div className="room-unit-options">
              {selectedRoom.units.map((unit) => {
                const unitCode = unit.code || unit;
                const unitId = unit.id || unitCode;

                return (
                <button
                  type="button"
                  className={`room-unit-option${selectedRoomUnits.has(unitId) ? ' selected' : ''}`}
                  key={unitCode}
                  onClick={() => selectRoomUnit(unit)}
                >
                  <StaticRoomImage images={getUnitPreviewImage(unit, selectedRoom)} alt={unitCode} className="unit-room-images" />
                  <span>{unitCode}</span>
                  <small>{selectedRoomUnits.has(unitId) ? 'Selected' : 'Available'}</small>
                </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {selectedRooms.length ? (
          <div className="selected-room-list" data-aos="fade-up">
            <div>
              <span className="selected-room-label">Rooms in this request</span>
              <h3>{selectedRooms.length === 1 ? '1 selected stay' : `${selectedRooms.length} selected stays`}</h3>
            </div>
            <div className="selected-room-items">
              {selectedRooms.map((room) => (
                <div className="selected-room-item" key={room.roomUnitId}>
                  <div>
                    <strong>{room.roomName}</strong>
                    <span>{room.roomCode} - {formatCurrency(room.ratePerNight)} / night</span>
                    <small>Breakfast: {formatCurrency(room.breakfastCharge)} per guest / night</small>
                  </div>
                  <label>
                    Guests
                    <select
                      value={room.guests}
                      onChange={(event) => updateSelectedRoomGuests(room.roomUnitId, event.target.value)}
                      disabled={selectedRoom?.kind === 'villa'}
                    >
                      {Array.from({ length: 8 }, (_, index) => index + 1).map((count) => (
                        <option value={count} key={count}>{count}</option>
                      ))}
                    </select>
                  </label>
                  {selectedRoom?.kind !== 'villa' ? (
                    <button type="button" onClick={() => removeSelectedRoom(room.roomUnitId)}>
                      Remove
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {selectedRoom ? (
          <div className="calendar-wrapper mb-5" data-aos="fade-up">
            <div className="calendar-header">
              <h3>{getMonthLabel(calendarMonth)}</h3>
              <p>
                {availabilityLoading
                  ? 'Loading live availability...'
                  : 'Select a check-in date, then select a later checkout date.'}
              </p>
            </div>
            {availabilityError ? <p className="availability-error">{availabilityError}</p> : null}
            <div className="calendar-grid">
              {weekDays.map((day) => (
                <div className="calendar-day-name" key={day}>{day}</div>
              ))}
              {calendarDays.map((day, index) => (
                <button
                  type="button"
                  className={getDayClass(day)}
                  key={`${day.label}-${index}`}
                  onClick={() => selectCalendarDay(day)}
                  disabled={!day.date || day.status === 'booked' || day.status === 'inactive'}
                >
                  <span>{day.label}</span>
                </button>
              ))}
            </div>
            <div className="calendar-selection mt-4">
              <div><span>Check-in:</span> {formatDate(checkIn)}</div>
              <div><span>Check-out:</span> {formatDate(checkOut)}</div>
            </div>
            <div className="calendar-legend mt-4">
              <div className="legend-item">
                <span className="legend-box available" />
                Available
              </div>
              <div className="legend-item">
                <span className="legend-box limited" />
                Limited
              </div>
              <div className="legend-item">
                <span className="legend-box booked" />
                Booked
              </div>
              <div className="legend-item">
                <span className="legend-box selected-date" />
                Selected
              </div>
            </div>
          </div>
        ) : null}

        <div className="row">
          <div className="col-md-8">
              {selectedRooms.length ? (
                <div className="room-card">
                  <AnimatedRoomImages images={getCardImages(selectedRoom)} alt={selectedRoom.name} className="selected-room-images" />
                  <div className="room-content">
                  <h3>{selectedRooms.length === 1 ? selectedRooms[0].roomName : `${selectedRooms.length} Private Rooms`}</h3>
                  <p>{selectedRooms.length === 1 ? selectedRoom.description : 'Multiple rooms selected for this reservation request.'}</p>
                  <div className="room-price-summary">
                    <div>
                      <span>Room rate</span>
                      <strong>{formatCurrency(selectedRooms.reduce((sum, room) => sum + room.ratePerNight, 0))} / night</strong>
                    </div>
                    <div>
                      <span>Breakfast</span>
                      <strong>{formatCurrency(selectedRooms.reduce((sum, room) => sum + room.breakfastCharge * room.guests, 0))} / night</strong>
                    </div>
                  </div>
                  <div className="room-features">
                    {selectedRoom.features.map((feature) => (
                      <span className="room-feature" key={feature}>
                        <span className={`fa ${featureIcons[feature]}`} aria-hidden="true" />
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="booking-empty-state">
                <h3>Select a room to continue</h3>
                <p>The availability calendar and reservation details will appear after a room type is selected.</p>
              </div>
            )}
          </div>
          <div className="col-md-4">
            <div className="booking-form">
              <h3>Reservation Request</h3>
              <form onSubmit={submitBooking}>
                <div className="form-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={(event) => updateFormData('name', event.target.value)}
                  />
                </div>
                <div className="form-group">
                  <input
                    type="email"
                    className="form-control"
                    placeholder="Email"
                    value={formData.email}
                    onChange={(event) => updateFormData('email', event.target.value)}
                  />
                </div>
                <div className="form-group">
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={(event) => updateFormData('phone', event.target.value)}
                  />
                </div>
                <div className="form-group">
                  <input type="date" className="form-control" value={checkIn} onChange={(event) => setCheckIn(event.target.value)} />
                </div>
                <div className="form-group">
                  <input type="date" className="form-control" value={checkOut} onChange={(event) => setCheckOut(event.target.value)} />
                </div>
                <div className="form-group">
                  <select className="form-control" value={selectedRoomName} onChange={(event) => selectRoom(event.target.value)}>
                    <option value="" disabled>Select Room Type</option>
                    <optgroup label="Villas">
                      {villaRooms.map((room) => (
                        <option value={room.name} key={room.name}>{room.name}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Private Rooms">
                      {privateRooms.map((room) => (
                        <option value={room.name} key={room.name}>{room.name}</option>
                      ))}
                    </optgroup>
                  </select>
                </div>
                <div className="form-group">
                  <select
                    className="form-control"
                    value={selectedRoomUnit}
                    onChange={(event) => {
                      const unit = selectedRoom?.units.find((item) => (item.code || item) === event.target.value);
                      if (unit) selectRoomUnit(unit);
                    }}
                    disabled={!selectedRoom}
                  >
                    <option value="" disabled>{selectedRoom?.kind === 'villa' ? 'Select Room ID' : 'Add Room ID'}</option>
                    {selectedRoom?.units.map((unit) => {
                      const unitCode = unit.code || unit;
                      return <option value={unitCode} key={unitCode}>{unitCode}</option>;
                    })}
                  </select>
                </div>
                <div className="form-group">
                  <select className="form-control" value={guestCount} onChange={(event) => setGuestCount(event.target.value)}>
                    {guestOptions.map((option) => <option key={option}>{option}</option>)}
                  </select>
                </div>
                {selectedRoom ? (
                  <div className="breakfast-option">
                    <label>
                      <input
                        type="checkbox"
                        checked={breakfastOpted}
                        onChange={(event) => setBreakfastOpted(event.target.checked)}
                      />
                      Add breakfast
                    </label>
                    <span>Per guest, per night</span>
                  </div>
                ) : null}
                {selectedRooms.length ? (
                  <div className="booking-cost-summary">
                    <div><span>Room</span><strong>{formatCurrency(selectedRooms.reduce((sum, room) => sum + room.ratePerNight, 0))} x {Math.max(nights, 1)} night{Math.max(nights, 1) === 1 ? '' : 's'}</strong></div>
                    <div><span>Breakfast</span><strong>{breakfastOpted ? `${formatCurrency(selectedRooms.reduce((sum, room) => sum + room.breakfastCharge * room.guests, 0))} x ${Math.max(nights, 1)}` : 'Not selected'}</strong></div>
                    <div><span>Estimated total</span><strong>{formatCurrency(estimatedTotal)}</strong></div>
                  </div>
                ) : null}
                {!hasCheckedSession ? (
                  <button className="btn btn-primary btn-block" type="button" disabled>
                    Checking account...
                  </button>
                ) : currentUser ? (
                  <button className="btn btn-primary btn-block" type="submit">
                    Reserve Now
                  </button>
                ) : (
                  <a className="booking-login-link" href="/login">Login to make a reservation</a>
                )}
                {submitMessage ? <p className="booking-submit-message">{submitMessage}</p> : null}
              </form>
            </div>
          </div>
        </div>
      </div>
      {showSummaryModal ? (
        <div className="booking-modal-backdrop" role="presentation">
          <div className="booking-summary-modal" role="dialog" aria-modal="true" aria-labelledby="booking-summary-title">
            <button
              type="button"
              className="booking-modal-close"
              onClick={() => setShowSummaryModal(false)}
              aria-label="Close booking summary"
            >
              x
            </button>
            <span className="selected-room-label">Review Request</span>
            <h3 id="booking-summary-title">Confirm reservation details</h3>
            <div className="booking-summary-grid">
              <div>
                <span>Guest</span>
                <strong>{formData.name}</strong>
                <p>{formData.email}</p>
                <p>{formData.phone}</p>
              </div>
              <div>
                <span>Rooms</span>
                <strong>{selectedRooms.length === 1 ? selectedRooms[0].roomName : `${selectedRooms.length} selected rooms`}</strong>
                {selectedRooms.map((room) => (
                  <p key={room.roomUnitId}>{room.roomCode} - {room.guests} guest{room.guests === 1 ? '' : 's'}</p>
                ))}
              </div>
              <div>
                <span>Stay</span>
                <strong>{formatDate(checkIn)} - {formatDate(checkOut)}</strong>
                <p>{selectedGuestTotal} Guest{selectedGuestTotal === 1 ? '' : 's'}</p>
                <p>{Math.max(nights, 1)} night{Math.max(nights, 1) === 1 ? '' : 's'}</p>
              </div>
              <div>
                <span>Charges</span>
                <strong>{formatCurrency(estimatedTotal)}</strong>
                <p>Room: {formatCurrency(selectedRooms.reduce((sum, room) => sum + room.ratePerNight, 0))} / night</p>
                <p>Breakfast: {breakfastOpted ? `${formatCurrency(selectedRooms.reduce((sum, room) => sum + room.breakfastCharge * room.guests, 0))} / night` : 'Not selected'}</p>
              </div>
            </div>
            <p className="booking-summary-note">After confirmation, this request will be saved and sent to the admin email from the backend.</p>
            <div className="booking-modal-actions">
              <button type="button" className="btn btn-outline-primary" onClick={() => setShowSummaryModal(false)}>
                Edit Details
              </button>
              <button type="button" className="btn btn-primary" onClick={confirmBooking} disabled={isSubmitting}>
                {isSubmitting ? 'Sending...' : 'Confirm & Send Request'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
