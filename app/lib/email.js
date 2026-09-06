import nodemailer from 'nodemailer';

function isEmailConfigured() {
  return Boolean(
    process.env.SMTP_HOST
      && process.env.SMTP_PORT
      && process.env.SMTP_USER
      && process.env.SMTP_PASS
      && process.env.ADMIN_EMAIL,
  );
}

function isSmtpConfigured() {
  return Boolean(
    process.env.SMTP_HOST
      && process.env.SMTP_PORT
      && process.env.SMTP_USER
      && process.env.SMTP_PASS,
  );
}

function formatCurrency(amount = 0) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

function getBookingRooms(booking) {
  if (Array.isArray(booking.rooms) && booking.rooms.length) {
    return booking.rooms;
  }

  return [{
    room: booking.room_name,
    roomUnit: booking.room_code,
    guests: Number.parseInt(String(booking.guests || '1'), 10) || 1,
    ratePerNight: booking.rate_per_night,
    breakfastCharge: booking.breakfast_charge,
  }];
}

function formatRoomLine(room) {
  return `${room.room} (${room.roomUnit}) - ${room.guests} guest${room.guests === 1 ? '' : 's'}, ${formatCurrency(room.ratePerNight)} / night`;
}

function formatRoomsText(booking) {
  return getBookingRooms(booking).map(formatRoomLine).join('\n');
}

function formatRoomsHtml(booking) {
  return getBookingRooms(booking)
    .map((room) => `<li>${formatRoomLine(room)}</li>`)
    .join('');
}

function formatBookingEmail(booking) {
  const breakfastCost = booking.breakfast_complimentary
    ? 'Complimentary'
    : formatCurrency(booking.breakfast_charge);

  return `
New reservation request

Booking ID: ${booking.booking_code}
Guest: ${booking.guest_name}
Email: ${booking.guest_email}
Phone: ${booking.guest_phone}

Selected Rooms:
${formatRoomsText(booking)}
Check-in: ${booking.check_in}
Check-out: ${booking.check_out}
Guests: ${booking.guests}
Nights: ${booking.nights}

Room Rate: ${formatCurrency(booking.rate_per_night)} / night total
Breakfast: ${booking.breakfast_opted ? `Requested (${breakfastCost} / night total)` : 'Not requested'}
Estimated Total: ${formatCurrency(booking.estimated_total)}

Status: ${booking.status}
`.trim();
}

function formatBookingEmailHtml(booking) {
  const breakfastCost = booking.breakfast_complimentary
    ? 'Complimentary'
    : formatCurrency(booking.breakfast_charge);

  return `
    <div style="font-family: Arial, sans-serif; color: #222; line-height: 1.5;">
      <h2 style="color: #6B4F3B;">New reservation request</h2>
      <p><strong>Booking ID:</strong> ${booking.booking_code}</p>
      <h3>Guest</h3>
      <p>
        <strong>Name:</strong> ${booking.guest_name}<br />
        <strong>Email:</strong> ${booking.guest_email}<br />
        <strong>Phone:</strong> ${booking.guest_phone}
      </p>
      <h3>Stay</h3>
      <ul>
        ${formatRoomsHtml(booking)}
      </ul>
      <p>
        <strong>Check-in:</strong> ${booking.check_in}<br />
        <strong>Check-out:</strong> ${booking.check_out}<br />
        <strong>Guests:</strong> ${booking.guests}<br />
        <strong>Nights:</strong> ${booking.nights}
      </p>
      <h3>Charges</h3>
      <p>
        <strong>Room Rate:</strong> ${formatCurrency(booking.rate_per_night)} / night total<br />
        <strong>Breakfast:</strong> ${booking.breakfast_opted ? `Requested (${breakfastCost} / night total)` : 'Not requested'}<br />
        <strong>Estimated Total:</strong> ${formatCurrency(booking.estimated_total)}
      </p>
      <p><strong>Status:</strong> ${booking.status}</p>
    </div>
  `;
}

function formatCancellationEmail(booking) {
  return `
Reservation cancellation request

Booking ID: ${booking.booking_code}
Guest: ${booking.guest_name}
Email: ${booking.guest_email}
Phone: ${booking.guest_phone}

Selected Rooms:
${formatRoomsText(booking)}
Check-in: ${booking.check_in}
Check-out: ${booking.check_out}
Guests: ${booking.guests}

Status: ${booking.status}
`.trim();
}

function formatCancellationEmailHtml(booking) {
  return `
    <div style="font-family: Arial, sans-serif; color: #222; line-height: 1.5;">
      <h2 style="color: #6B4F3B;">Reservation cancellation request</h2>
      <p><strong>Booking ID:</strong> ${booking.booking_code}</p>
      <h3>Guest</h3>
      <p>
        <strong>Name:</strong> ${booking.guest_name}<br />
        <strong>Email:</strong> ${booking.guest_email}<br />
        <strong>Phone:</strong> ${booking.guest_phone}
      </p>
      <h3>Stay</h3>
      <ul>
        ${formatRoomsHtml(booking)}
      </ul>
      <p>
        <strong>Check-in:</strong> ${booking.check_in}<br />
        <strong>Check-out:</strong> ${booking.check_out}<br />
        <strong>Guests:</strong> ${booking.guests}
      </p>
      <p><strong>Status:</strong> ${booking.status}</p>
    </div>
  `;
}

function formatGuestStatusEmail(booking, statusLabel) {
  const breakfastCost = booking.breakfast_complimentary
    ? 'Complimentary'
    : formatCurrency(booking.breakfast_charge);

  return `
Dear ${booking.guest_name},

Your reservation request at Laya Balita has been ${statusLabel}.

Booking ID: ${booking.booking_code}
Selected Rooms:
${formatRoomsText(booking)}
Check-in: ${booking.check_in}
Check-out: ${booking.check_out}
Guests: ${booking.guests}
Nights: ${booking.nights}

Room Rate: ${formatCurrency(booking.rate_per_night)} / night total
Breakfast: ${booking.breakfast_opted ? `Requested (${breakfastCost} / night total)` : 'Not requested'}
Estimated Total: ${formatCurrency(booking.estimated_total)}

For any changes or questions, please reply to this email.

Warm regards,
Laya Balita
`.trim();
}

function formatGuestStatusEmailHtml(booking, heading, message) {
  const breakfastCost = booking.breakfast_complimentary
    ? 'Complimentary'
    : formatCurrency(booking.breakfast_charge);

  return `
    <div style="font-family: Arial, sans-serif; color: #222; line-height: 1.5;">
      <h2 style="color: #6B4F3B;">${heading}</h2>
      <p>Dear ${booking.guest_name},</p>
      <p>${message}</p>
      <p><strong>Booking ID:</strong> ${booking.booking_code}</p>
      <h3>Stay Details</h3>
      <ul>
        ${formatRoomsHtml(booking)}
      </ul>
      <p>
        <strong>Check-in:</strong> ${booking.check_in}<br />
        <strong>Check-out:</strong> ${booking.check_out}<br />
        <strong>Guests:</strong> ${booking.guests}<br />
        <strong>Nights:</strong> ${booking.nights}
      </p>
      <h3>Charges</h3>
      <p>
        <strong>Room Rate:</strong> ${formatCurrency(booking.rate_per_night)} / night total<br />
        <strong>Breakfast:</strong> ${booking.breakfast_opted ? `Requested (${breakfastCost} / night total)` : 'Not requested'}<br />
        <strong>Estimated Total:</strong> ${formatCurrency(booking.estimated_total)}
      </p>
      <p>For any changes or questions, please reply to this email.</p>
      <p>Warm regards,<br />Laya Balita</p>
    </div>
  `;
}

function createTransporter() {
  const timeoutMs = Number(process.env.SMTP_TIMEOUT_MS || 12000);

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    connectionTimeout: timeoutMs,
    greetingTimeout: timeoutMs,
    socketTimeout: timeoutMs,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

function canLogOtpFallback() {
  return process.env.NODE_ENV !== 'production'
    && process.env.DEV_LOG_OTP_ON_EMAIL_FAILURE === 'true';
}

async function sendMail(message) {
  const transporter = createTransporter();
  const timeoutMs = Number(process.env.SMTP_TIMEOUT_MS || 12000);
  let timeoutId;

  try {
    const sendPromise = transporter.sendMail(message);
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error(`SMTP request timed out after ${timeoutMs}ms`));
      }, timeoutMs + 1000);
    });

    return await Promise.race([sendPromise, timeoutPromise]);
  } finally {
    clearTimeout(timeoutId);
    transporter.close();
  }
}

export async function sendAdminBookingEmail(booking) {
  if (!isEmailConfigured()) {
    return {
      sent: false,
      reason: 'SMTP is not configured',
    };
  }

  await sendMail({
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    to: process.env.ADMIN_EMAIL,
    replyTo: booking.guest_email,
    subject: `Reservation Request ${booking.booking_code} - ${booking.room_name}`,
    text: formatBookingEmail(booking),
    html: formatBookingEmailHtml(booking),
  });

  return {
    sent: true,
  };
}

export async function sendAdminCancellationEmail(booking) {
  if (!isEmailConfigured()) {
    return {
      sent: false,
      reason: 'SMTP is not configured',
    };
  }

  await sendMail({
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    to: process.env.ADMIN_EMAIL,
    replyTo: booking.guest_email,
    subject: `Reservation Cancelled ${booking.booking_code} - ${booking.room_name}`,
    text: formatCancellationEmail(booking),
    html: formatCancellationEmailHtml(booking),
  });

  return {
    sent: true,
  };
}

export async function sendGuestBookingConfirmationEmail(booking) {
  if (!isSmtpConfigured()) {
    return {
      sent: false,
      reason: 'SMTP is not configured',
    };
  }

  await sendMail({
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    to: booking.guest_email,
    replyTo: process.env.ADMIN_EMAIL || process.env.SMTP_USER,
    subject: `Reservation Confirmed ${booking.booking_code} - Laya Balita`,
    text: formatGuestStatusEmail(booking, 'confirmed'),
    html: formatGuestStatusEmailHtml(
      booking,
      'Your reservation is confirmed',
      'Thank you for choosing Laya Balita. Your reservation request has been confirmed by our team.',
    ),
  });

  return {
    sent: true,
  };
}

export async function sendGuestBookingCancellationEmail(booking) {
  if (!isSmtpConfigured()) {
    return {
      sent: false,
      reason: 'SMTP is not configured',
    };
  }

  await sendMail({
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    to: booking.guest_email,
    replyTo: process.env.ADMIN_EMAIL || process.env.SMTP_USER,
    subject: `Reservation Cancelled ${booking.booking_code} - Laya Balita`,
    text: formatGuestStatusEmail(booking, 'cancelled'),
    html: formatGuestStatusEmailHtml(
      booking,
      'Your reservation has been cancelled',
      'Your reservation request has been cancelled. If this was unexpected or you need help with alternate dates, please reply to this email.',
    ),
  });

  return {
    sent: true,
  };
}

export async function sendLoginOtpEmail(email, otp) {
  if (!isSmtpConfigured()) {
    return {
      sent: false,
      reason: 'SMTP is not configured',
    };
  }

  try {
    await sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to: email,
      subject: 'Your Laya Balita login code',
      text: `Your Laya Balita login code is ${otp}. It expires in 10 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #222; line-height: 1.5;">
          <h2 style="color: #6B4F3B;">Your Laya Balita login code</h2>
          <p>Use this code to continue:</p>
          <div style="font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #6B4F3B;">${otp}</div>
          <p>This code expires in 10 minutes.</p>
        </div>
      `,
    });
  } catch (error) {
    if (!canLogOtpFallback()) {
      throw error;
    }

    console.error('OTP email could not be sent. Using local development OTP fallback.', error);
    console.log(`Development OTP for ${email}: ${otp}`);
  }

  return {
    sent: true,
  };
}
