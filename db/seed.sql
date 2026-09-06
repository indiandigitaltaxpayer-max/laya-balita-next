DELETE FROM room_units
WHERE room_type_id IN (
  SELECT id FROM room_types
  WHERE name IN ('Villa 1', 'Villa 2', 'Villa 3', 'Deluxe Doubel Room')
);

DELETE FROM room_types
WHERE name IN ('Villa 1', 'Villa 2', 'Villa 3', 'Deluxe Doubel Room');

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
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  image = EXCLUDED.image,
  rate_per_night = EXCLUDED.rate_per_night,
  breakfast_charge = EXCLUDED.breakfast_charge,
  features = EXCLUDED.features;

INSERT INTO room_units (room_type_id, room_code)
SELECT rt.id, unit_code
FROM room_types rt
JOIN (
  VALUES
    ('The Azure Villa', 'AZURE-VILLA'),
    ('The Nook Villa', 'NOOK-VILLA'),
    ('The Verdant Villa', 'VERDANT-VILLA'),
    ('Balcony King Room', '103'), ('Balcony King Room', '104'), ('Balcony King Room', '206'), ('Balcony King Room', '304'),
    ('King Room', '101'), ('King Room', '102'),
    ('Queen Room', '105'), ('Queen Room', '203'), ('Queen Room', '204'), ('Queen Room', '305'),
    ('Balcony Twin Room', '205'),
    ('Twin Room', '303'), ('Twin Room', '306'),
    ('Economy Queen Room', '301'),
    ('Economy Twin Room', '201'), ('Economy Twin Room', '202'), ('Economy Twin Room', '302')
) AS units(room_name, unit_code) ON units.room_name = rt.name
ON CONFLICT (room_code) DO NOTHING;

INSERT INTO room_availability (room_type_id, room_unit_id, available_date, status, note)
SELECT ru.room_type_id, ru.id, availability.available_date::date, availability.status, 'Demo availability seed'
FROM room_units ru
CROSS JOIN (
  VALUES
    ('2026-08-05', 'LIMITED'),
    ('2026-08-06', 'LIMITED'),
    ('2026-08-07', 'BOOKED'),
    ('2026-08-08', 'BOOKED'),
    ('2026-08-13', 'LIMITED'),
    ('2026-08-14', 'LIMITED'),
    ('2026-08-15', 'BOOKED'),
    ('2026-08-16', 'BOOKED'),
    ('2026-08-21', 'LIMITED'),
    ('2026-08-22', 'LIMITED'),
    ('2026-08-23', 'BOOKED'),
    ('2026-08-28', 'LIMITED'),
    ('2026-08-29', 'BOOKED'),
    ('2026-08-30', 'BOOKED')
) AS availability(available_date, status)
ON CONFLICT (room_unit_id, available_date) DO UPDATE SET
  status = EXCLUDED.status,
  note = EXCLUDED.note,
  updated_at = NOW();
