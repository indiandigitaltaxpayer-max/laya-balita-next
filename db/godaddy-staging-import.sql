-- GoDaddy staging import: schema plus safe seed data

-- Upload this single file in GoDaddy Hosted Database > Import SQL.

SET FOREIGN_KEY_CHECKS = 0;

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


SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO users (
  name,
  first_name,
  last_name,
  email,
  phone,
  country,
  address,
  role
)
VALUES (
  'Laya Balita Admin',
  'Laya Balita',
  'Admin',
  'layabalita@gmail.com',
  '',
  'India',
  'Laya Balita',
  'ADMIN'
)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  first_name = VALUES(first_name),
  last_name = VALUES(last_name),
  role = 'ADMIN',
  updated_at = NOW();

INSERT INTO room_types (name, description, image, rate_per_night, breakfast_charge, features)
VALUES
  ('The Azure Villa', 'The most spacious villa in our collection, offering five air-conditioned bedrooms, generous common areas, and room for everyone to stay together.', '/img/hero_1.jpg', 28000, 450, '["5 bedrooms","Kitchen","Garden view","Air conditioning","Private bathroom","Free WiFi"]'),
  ('The Nook Villa', 'A relaxed group villa with six bedrooms, flexible AC and fan-cooled rooms, spacious common halls, and a shared balcony.', '/img/rooms/H2/Property%20Photos/Front.jpg', 30000, 450, '["6 bedrooms","Balcony","Garden view","Air conditioning","Private bathroom","Free WiFi"]'),
  ('The Verdant Villa', 'A warm Keralam-style villa surrounded by tropical greenery, with six bedrooms, a kitchen, open veranda, and garden seating.', '/img/rooms/H3/Property%20Photos/IMG_6984.jpg', 30000, 450, '["6 bedrooms","Kitchen","Garden view","Air conditioning","Private bathroom","Free WiFi"]'),
  ('Balcony King Room', 'A spacious king room designed for couples who appreciate a little extra space and the comfort of a private balcony.', '/img/rooms/H2/206/IMG_7121.jpg', 5200, 400, '["2 guests","King bed","Air conditioning","Balcony","Private bathroom","Free WiFi"]'),
  ('King Room', 'Bright, comfortable, and thoughtfully designed for couples or solo travellers looking for a relaxed stay near Varkala''s South Cliff.', '/img/slider-2.jpg', 4800, 350, '["2 guests","King bed","Air conditioning","Private bathroom","Hot water","Free WiFi"]'),
  ('Queen Room', 'A compact, cosy, and comfortable choice for couples seeking everything they need for a peaceful stay.', '/img/rooms/H2/203/IMG_7254.jpg', 4500, 350, '["2 guests","Queen bed","Air conditioning","Private bathroom","Hot water","Free WiFi"]'),
  ('Balcony Twin Room', 'A great option for friends travelling together, combining the practicality of twin beds with the added comfort of a private balcony.', '/img/rooms/H2/205/IMG_7148.jpg', 4700, 350, '["2 guests","Twin beds","Air conditioning","Balcony","Private bathroom","Free WiFi"]'),
  ('Twin Room', 'Comfortable, flexible, and ideal for friends, siblings, colleagues, or guests who prefer individual sleeping spaces.', '/img/rooms/H3/303/IMG_7007.jpg', 4200, 300, '["2 guests","Twin beds","Air conditioning","Private bathroom","Hot water","Free WiFi"]'),
  ('Economy Queen Room', 'A simple, comfortable fan-cooled queen room with the essentials for a relaxed stay near South Cliff.', '/img/rooms/H3/301/IMG_7044.jpg', 3400, 300, '["2 guests","Queen bed","Fan cooled","Private bathroom","Garden view","Free WiFi"]'),
  ('Economy Twin Room', 'A practical fan-cooled twin room for friends, siblings, and travel companions looking for simple comfort.', '/img/rooms/H2/201/IMG_7258.jpg', 3200, 300, '["3 guests","Twin beds","Fan cooled","Private bathroom","Garden view","Free WiFi"]')
ON DUPLICATE KEY UPDATE
  description = VALUES(description),
  image = VALUES(image),
  rate_per_night = VALUES(rate_per_night),
  breakfast_charge = VALUES(breakfast_charge),
  features = VALUES(features);

INSERT IGNORE INTO room_units (room_type_id, room_code)
SELECT rt.id, units.unit_code
FROM room_types rt
JOIN (
  SELECT 'The Azure Villa' AS room_name, 'AZURE-VILLA' AS unit_code UNION ALL
  SELECT 'The Nook Villa', 'NOOK-VILLA' UNION ALL
  SELECT 'The Verdant Villa', 'VERDANT-VILLA' UNION ALL
  SELECT 'Balcony King Room', '103' UNION ALL
  SELECT 'Balcony King Room', '104' UNION ALL
  SELECT 'Balcony King Room', '206' UNION ALL
  SELECT 'Balcony King Room', '304' UNION ALL
  SELECT 'King Room', '101' UNION ALL
  SELECT 'King Room', '102' UNION ALL
  SELECT 'Queen Room', '105' UNION ALL
  SELECT 'Queen Room', '203' UNION ALL
  SELECT 'Queen Room', '204' UNION ALL
  SELECT 'Queen Room', '305' UNION ALL
  SELECT 'Balcony Twin Room', '205' UNION ALL
  SELECT 'Twin Room', '303' UNION ALL
  SELECT 'Twin Room', '306' UNION ALL
  SELECT 'Economy Queen Room', '301' UNION ALL
  SELECT 'Economy Twin Room', '201' UNION ALL
  SELECT 'Economy Twin Room', '202' UNION ALL
  SELECT 'Economy Twin Room', '302'
) AS units ON units.room_name = rt.name;

