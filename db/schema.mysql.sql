CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone TEXT,
  country TEXT,
  address TEXT,
  password_hash TEXT,
  role VARCHAR(20) NOT NULL DEFAULT 'USER',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CHECK (role IN ('USER', 'ADMIN'))
);

CREATE TABLE IF NOT EXISTS email_otps (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  email VARCHAR(255) NOT NULL,
  otp_hash TEXT NOT NULL,
  mode VARCHAR(20) NOT NULL DEFAULT 'login',
  name TEXT,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  country TEXT,
  address TEXT,
  attempts INT NOT NULL DEFAULT 0,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK (mode IN ('login', 'signup'))
);

CREATE TABLE IF NOT EXISTS room_types (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT NOT NULL,
  image TEXT NOT NULL,
  rate_per_night INT NOT NULL,
  breakfast_charge INT NOT NULL,
  features JSON NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS room_units (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  room_type_id CHAR(36) NOT NULL,
  room_code VARCHAR(80) NOT NULL UNIQUE,
  status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK (status IN ('AVAILABLE', 'MAINTENANCE', 'INACTIVE')),
  CONSTRAINT room_units_room_type_fk FOREIGN KEY (room_type_id) REFERENCES room_types(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS bookings (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  booking_code VARCHAR(80) NOT NULL UNIQUE,
  user_id CHAR(36),
  guest_name TEXT NOT NULL,
  guest_email VARCHAR(255) NOT NULL,
  guest_phone TEXT NOT NULL,
  room_type_id CHAR(36),
  room_unit_id CHAR(36),
  room_name TEXT NOT NULL,
  room_code TEXT NOT NULL,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  guests TEXT NOT NULL,
  nights INT NOT NULL,
  rate_per_night INT NOT NULL,
  breakfast_opted BOOLEAN NOT NULL DEFAULT FALSE,
  breakfast_charge INT NOT NULL DEFAULT 0,
  breakfast_complimentary BOOLEAN NOT NULL DEFAULT FALSE,
  estimated_total INT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELLED')),
  CONSTRAINT bookings_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT bookings_room_type_fk FOREIGN KEY (room_type_id) REFERENCES room_types(id) ON DELETE SET NULL,
  CONSTRAINT bookings_room_unit_fk FOREIGN KEY (room_unit_id) REFERENCES room_units(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS booking_rooms (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  booking_id CHAR(36) NOT NULL,
  room_type_id CHAR(36) NOT NULL,
  room_unit_id CHAR(36) NOT NULL,
  room_name TEXT NOT NULL,
  room_code TEXT NOT NULL,
  guests INT NOT NULL DEFAULT 1,
  rate_per_night INT NOT NULL,
  breakfast_charge INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (booking_id, room_unit_id),
  CONSTRAINT booking_rooms_booking_fk FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  CONSTRAINT booking_rooms_room_type_fk FOREIGN KEY (room_type_id) REFERENCES room_types(id) ON DELETE RESTRICT,
  CONSTRAINT booking_rooms_room_unit_fk FOREIGN KEY (room_unit_id) REFERENCES room_units(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS room_availability (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  room_type_id CHAR(36) NOT NULL,
  room_unit_id CHAR(36) NOT NULL,
  available_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',
  booking_id CHAR(36),
  note TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE (room_unit_id, available_date),
  CHECK (status IN ('AVAILABLE', 'LIMITED', 'BOOKED', 'BLOCKED')),
  CONSTRAINT room_availability_room_type_fk FOREIGN KEY (room_type_id) REFERENCES room_types(id) ON DELETE CASCADE,
  CONSTRAINT room_availability_room_unit_fk FOREIGN KEY (room_unit_id) REFERENCES room_units(id) ON DELETE CASCADE,
  CONSTRAINT room_availability_booking_fk FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  email VARCHAR(255) NOT NULL UNIQUE,
  source VARCHAR(80) NOT NULL DEFAULT 'footer',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS testimonials (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  guest_name TEXT NOT NULL,
  guest_location TEXT,
  rating INT NOT NULL DEFAULT 5,
  quote TEXT NOT NULL,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CHECK (rating BETWEEN 1 AND 5)
);
