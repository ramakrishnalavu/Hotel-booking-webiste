-- Complete PostgreSQL Schema for Hotel Booking Management System

-- Drop tables if they exist to prevent conflicts during fresh runs
DROP TABLE IF EXISTS hotel_amenities CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS coupons CASCADE;
DROP TABLE IF EXISTS rooms CASCADE;
DROP TABLE IF EXISTS amenities CASCADE;
DROP TABLE IF EXISTS hotels CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. Users Table
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(30) NOT NULL DEFAULT 'ROLE_USER',
    loyalty_points INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Hotels Table
CREATE TABLE hotels (
    id BIGSERIAL PRIMARY KEY,
    hotel_name VARCHAR(150) NOT NULL,
    description TEXT,
    city VARCHAR(100) NOT NULL,
    address VARCHAR(255) NOT NULL,
    rating DOUBLE PRECISION DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Rooms Table
CREATE TABLE rooms (
    id BIGSERIAL PRIMARY KEY,
    room_number VARCHAR(20) NOT NULL,
    room_type VARCHAR(50) NOT NULL,
    price_per_night DOUBLE PRECISION NOT NULL,
    max_guests INTEGER NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE',
    hotel_id BIGINT NOT NULL,
    CONSTRAINT fk_room_hotel FOREIGN KEY (hotel_id) REFERENCES hotels (id) ON DELETE CASCADE,
    CONSTRAINT unique_hotel_room UNIQUE (hotel_id, room_number)
);

-- 4. Coupons Table
CREATE TABLE coupons (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_percent DOUBLE PRECISION NOT NULL,
    expiry_date DATE NOT NULL
);

-- 5. Bookings Table
CREATE TABLE bookings (
    id BIGSERIAL PRIMARY KEY,
    reservation_number VARCHAR(100) UNIQUE NOT NULL,
    booking_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    total_amount DOUBLE PRECISION NOT NULL,
    booking_status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    user_id BIGINT NOT NULL,
    room_id BIGINT NOT NULL,
    coupon_id BIGINT,
    CONSTRAINT fk_booking_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_booking_room FOREIGN KEY (room_id) REFERENCES rooms (id) ON DELETE CASCADE,
    CONSTRAINT fk_booking_coupon FOREIGN KEY (coupon_id) REFERENCES coupons (id) ON DELETE SET NULL
);

-- 6. Payments Table
CREATE TABLE payments (
    id BIGSERIAL PRIMARY KEY,
    amount DOUBLE PRECISION NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    payment_status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    transaction_id VARCHAR(100) UNIQUE NOT NULL,
    booking_id BIGINT UNIQUE NOT NULL,
    paid_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_payment_booking FOREIGN KEY (booking_id) REFERENCES bookings (id) ON DELETE CASCADE
);

-- 7. Reviews Table
CREATE TABLE reviews (
    id BIGSERIAL PRIMARY KEY,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    user_id BIGINT NOT NULL,
    hotel_id BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_review_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_review_hotel FOREIGN KEY (hotel_id) REFERENCES hotels (id) ON DELETE CASCADE
);

-- 8. Amenities Table
CREATE TABLE amenities (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

-- 9. HotelAmenities Table
CREATE TABLE hotel_amenities (
    id BIGSERIAL PRIMARY KEY,
    hotel_id BIGINT NOT NULL,
    amenity_id BIGINT NOT NULL,
    CONSTRAINT fk_ha_hotel FOREIGN KEY (hotel_id) REFERENCES hotels (id) ON DELETE CASCADE,
    CONSTRAINT fk_ha_amenity FOREIGN KEY (amenity_id) REFERENCES amenities (id) ON DELETE CASCADE,
    CONSTRAINT unique_hotel_amenity UNIQUE (hotel_id, amenity_id)
);

-- Indexes for Optimizing Search Queries (e.g. searching hotels by city, reviews, bookings)
CREATE INDEX idx_hotel_city ON hotels(city);
CREATE INDEX idx_room_hotel ON rooms(hotel_id);
CREATE INDEX idx_booking_user ON bookings(user_id);
CREATE INDEX idx_booking_room ON bookings(room_id);
CREATE INDEX idx_booking_dates ON bookings(check_in_date, check_out_date);
CREATE INDEX idx_payment_booking ON payments(booking_id);
CREATE INDEX idx_review_hotel ON reviews(hotel_id);
