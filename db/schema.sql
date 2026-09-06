CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  country TEXT,
  address TEXT,
  password_hash TEXT,
  role TEXT NOT NULL DEFAULT 'USER' CHECK (role IN ('USER', 'ADMIN')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT;

CREATE TABLE IF NOT EXISTS email_otps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  otp_hash TEXT NOT NULL,
  mode TEXT NOT NULL DEFAULT 'login' CHECK (mode IN ('login', 'signup')),
  name TEXT,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  country TEXT,
  address TEXT,
  attempts INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE email_otps ADD COLUMN IF NOT EXISTS mode TEXT NOT NULL DEFAULT 'login';
ALTER TABLE email_otps ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE email_otps ADD COLUMN IF NOT EXISTS last_name TEXT;
ALTER TABLE email_otps ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE email_otps ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE email_otps ADD COLUMN IF NOT EXISTS address TEXT;

CREATE INDEX IF NOT EXISTS email_otps_email_idx ON email_otps(email);
CREATE INDEX IF NOT EXISTS email_otps_expires_idx ON email_otps(expires_at);

CREATE TABLE IF NOT EXISTS room_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  image TEXT NOT NULL,
  rate_per_night INTEGER NOT NULL,
  breakfast_charge INTEGER NOT NULL,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS room_units (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_type_id UUID NOT NULL REFERENCES room_types(id) ON DELETE CASCADE,
  room_code TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'MAINTENANCE', 'INACTIVE')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_code TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  guest_name TEXT NOT NULL,
  guest_email TEXT NOT NULL,
  guest_phone TEXT NOT NULL,
  room_type_id UUID REFERENCES room_types(id) ON DELETE SET NULL,
  room_unit_id UUID REFERENCES room_units(id) ON DELETE SET NULL,
  room_name TEXT NOT NULL,
  room_code TEXT NOT NULL,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  guests TEXT NOT NULL,
  nights INTEGER NOT NULL,
  rate_per_night INTEGER NOT NULL,
  breakfast_opted BOOLEAN NOT NULL DEFAULT FALSE,
  breakfast_charge INTEGER NOT NULL DEFAULT 0,
  breakfast_complimentary BOOLEAN NOT NULL DEFAULT FALSE,
  estimated_total INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELLED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS bookings_guest_email_idx ON bookings(guest_email);
CREATE INDEX IF NOT EXISTS bookings_user_id_idx ON bookings(user_id);
CREATE INDEX IF NOT EXISTS bookings_status_idx ON bookings(status);

CREATE TABLE IF NOT EXISTS room_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_type_id UUID NOT NULL REFERENCES room_types(id) ON DELETE CASCADE,
  room_unit_id UUID NOT NULL REFERENCES room_units(id) ON DELETE CASCADE,
  available_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'LIMITED', 'BOOKED', 'BLOCKED')),
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (room_unit_id, available_date)
);

CREATE INDEX IF NOT EXISTS room_availability_room_type_date_idx ON room_availability(room_type_id, available_date);
CREATE INDEX IF NOT EXISTS room_availability_room_unit_date_idx ON room_availability(room_unit_id, available_date);
CREATE INDEX IF NOT EXISTS room_availability_status_idx ON room_availability(status);

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  source TEXT NOT NULL DEFAULT 'footer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS newsletter_subscribers_email_idx ON newsletter_subscribers(email);

CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  guest_name TEXT NOT NULL,
  guest_location TEXT,
  rating INTEGER NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  quote TEXT NOT NULL,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS guest_location TEXT;
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS rating INTEGER NOT NULL DEFAULT 5;
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS quote TEXT NOT NULL DEFAULT '';
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS testimonials_published_sort_idx ON testimonials(is_published, sort_order, created_at);
