-- Seed Data for Hotel Booking Management System

-- Insert Users (Password is BCrypt hash for 'password')
INSERT INTO users (full_name, email, password, phone, role, loyalty_points) VALUES
('John Doe', 'user@hotel.com', '$2a$10$lhvcS.M6kIySxtT8qxSTBe9W8RrvskNzKVmDM8Qxm8Ct0xO9InYjm', '1234567890', 'ROLE_USER', 150),
('Hotel Manager', 'manager@hotel.com', '$2a$10$lhvcS.M6kIySxtT8qxSTBe9W8RrvskNzKVmDM8Qxm8Ct0xO9InYjm', '9876543210', 'ROLE_MANAGER', 0),
('System Admin', 'admin@hotel.com', '$2a$10$lhvcS.M6kIySxtT8qxSTBe9W8RrvskNzKVmDM8Qxm8Ct0xO9InYjm', '5555555555', 'ROLE_ADMIN', 0);

-- Insert Hotels
INSERT INTO hotels (hotel_name, description, city, address, rating) VALUES
('Grand Palace Hotel', 'Experience ultimate luxury in the heart of New York. Swimming pool, spa, and gourmet dining.', 'New York', '123 Broadway Ave, NY 10001', 4.8),
('Seaside Resort & Spa', 'Relax by the ocean with private beach access, custom cocktails, and luxury bungalows.', 'Miami', '456 Ocean Drive, FL 33139', 4.5),
('Mountain View Lodge', 'Cozy cabin-style lodging with beautiful scenery, skiing access, and comfortable fires.', 'Aspen', '789 Alpine Rd, CO 81611', 4.3);

-- Insert Rooms
INSERT INTO rooms (room_number, room_type, price_per_night, max_guests, status, hotel_id) VALUES
-- Grand Palace Hotel (ID 1)
('101', 'SINGLE', 150.0, 1, 'AVAILABLE', 1),
('102', 'DOUBLE', 250.0, 2, 'AVAILABLE', 1),
('201', 'SUITE', 500.0, 4, 'AVAILABLE', 1),
-- Seaside Resort & Spa (ID 2)
('101', 'SINGLE', 120.0, 1, 'AVAILABLE', 2),
('102', 'DOUBLE', 200.0, 2, 'AVAILABLE', 2),
('201', 'SUITE', 400.0, 3, 'AVAILABLE', 2),
-- Mountain View Lodge (ID 3)
('101', 'SINGLE', 90.0, 1, 'AVAILABLE', 3),
('102', 'DOUBLE', 160.0, 2, 'AVAILABLE', 3);

-- Insert Coupons
INSERT INTO coupons (code, discount_percent, expiry_date) VALUES
('WELCOME10', 10.0, '2027-12-31'),
('SUPER20', 20.0, '2027-06-30'),
('SUMMER50', 50.0, '2026-08-31');

-- Insert Amenities
INSERT INTO amenities (name) VALUES
('Free WiFi'),
('Swimming Pool'),
('Spa & Wellness'),
('Fitness Center'),
('Free Parking'),
('Room Service'),
('Complimentary Breakfast');

-- Insert Hotel Amenities
INSERT INTO hotel_amenities (hotel_id, amenity_id) VALUES
-- Grand Palace (ID 1): WiFi, Pool, Spa, Fitness, Room Service, Breakfast
(1, 1), (1, 2), (1, 3), (1, 4), (1, 6), (1, 7),
-- Seaside Resort (ID 2): WiFi, Pool, Spa, Parking, Room Service
(2, 1), (2, 2), (2, 3), (2, 5), (2, 6),
-- Mountain View (ID 3): WiFi, Parking, Breakfast
(3, 1), (3, 5), (3, 7);

-- Insert Reviews
INSERT INTO reviews (rating, comment, user_id, hotel_id) VALUES
(5, 'Absolutely spectacular! Highly recommend the Grand Palace Suite.', 1, 1),
(4, 'Great views of the beach but the room service was a bit slow.', 1, 2);
