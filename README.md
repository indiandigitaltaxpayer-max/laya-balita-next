# Laya Balita Next.js

Fresh Next.js conversion of the static Laya Balita template.

## Development

```bash
npm install
npm run dev
```

## Open-source Backend

This project now includes a real backend using:

- Next.js API route handlers
- MySQL
- `mysql2` for database access
- `bcryptjs` for password hashing
- `jose` for signed HTTP-only auth cookies
- `zod` for request validation

## Environment

Copy `.env.example` to `.env.local` and update the values:

```bash
DATABASE_URL=mysql://root:your-mysql-password@localhost:3306/laya_balita
AUTH_SECRET=replace-with-a-long-random-secret
NEXT_PUBLIC_SITE_URL=http://localhost:3000
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-smtp-username
SMTP_PASS=your-smtp-password
ADMIN_EMAIL=info@layabalita.com
EMAIL_FROM="Laya Balita <no-reply@layabalita.com>"
```

`AUTH_SECRET` should be a long random string in production.

SMTP settings are used to email the admin when a reservation request is confirmed. If SMTP is not configured, bookings can still be saved, and the API reports that email delivery is pending configuration.

## Database Setup

Create a MySQL database named `laya_balita`, then run:

```bash
npm run db:setup
```

This applies:

- `db/schema.mysql.sql`
- `db/seed.mysql.sql`

The seed creates room types, room IDs, rates, breakfast charges, and room features.

## Backend Routes

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/me`
- `GET /api/rooms`
- `GET /api/bookings`
- `POST /api/bookings`
- `GET /api/admin/bookings`
- `PATCH /api/admin/bookings/:id`

## Current Behavior

If `DATABASE_URL` is configured, login/signup, bookings, user profile, and admin dashboard use MySQL.

If the database is not configured, the UI keeps its local demo fallback for presentation purposes.
