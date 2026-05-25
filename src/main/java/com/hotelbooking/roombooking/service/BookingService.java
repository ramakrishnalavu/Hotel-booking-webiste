package com.hotelbooking.roombooking.service;

import com.hotelbooking.roombooking.dto.BookingDTO;
import com.hotelbooking.roombooking.dto.BookingRequest;
import com.hotelbooking.roombooking.entity.*;
import com.hotelbooking.roombooking.exception.BookingConflictException;
import com.hotelbooking.roombooking.exception.ResourceNotFoundException;
import com.hotelbooking.roombooking.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class BookingService {
    private static final Logger logger = LoggerFactory.getLogger(BookingService.class);

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CouponService couponService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private PaymentRepository paymentRepository;

    public List<BookingDTO> getAllBookings() {
        return bookingRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<BookingDTO> getBookingsByUser(Long userId) {
        return bookingRepository.findByUserId(userId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public BookingDTO getBookingByReservationNumber(String resNum) {
        Booking booking = bookingRepository.findByReservationNumber(resNum)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with reservation number: " + resNum));
        return convertToDTO(booking);
    }

    @Transactional
    @CacheEvict(value = "hotels", allEntries = true)
    public BookingDTO createBooking(BookingRequest request, String email) {
        logger.info("Initiating booking transaction for email: {}, roomId: {}", email, request.getRoomId());
        
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<Booking> overlapping = bookingRepository.findOverlappingBookingsWithLock(
                request.getRoomId(), request.getCheckInDate(), request.getCheckOutDate());

        if (!overlapping.isEmpty()) {
            throw new BookingConflictException("The selected room is already booked for the chosen date range.");
        }

        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new ResourceNotFoundException("Room not found"));

        if (room.getStatus() == RoomStatus.MAINTENANCE) {
            throw new BookingConflictException("Room is currently under maintenance and cannot be reserved.");
        }

        long nights = ChronoUnit.DAYS.between(request.getCheckInDate(), request.getCheckOutDate());
        if (nights <= 0) {
            throw new IllegalArgumentException("Check-out date must be after check-in date");
        }

        double totalCost = room.getPricePerNight() * nights;

        Coupon coupon = null;
        if (request.getCouponCode() != null && !request.getCouponCode().trim().isEmpty()) {
            coupon = couponService.validateAndGetCoupon(request.getCouponCode());
            double discount = totalCost * (coupon.getDiscountPercent() / 100.0);
            totalCost -= discount;
        }

        String reservationNumber = "RES-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        Booking booking = Booking.builder()
                .reservationNumber(reservationNumber)
                .checkInDate(request.getCheckInDate())
                .checkOutDate(request.getCheckOutDate())
                .totalAmount(totalCost)
                .bookingStatus(BookingStatus.PENDING)
                .user(user)
                .room(room)
                .coupon(coupon)
                .build();

        booking = bookingRepository.save(booking);

        int pointsEarned = (int) (totalCost * 0.1);
        user.setLoyaltyPoints(user.getLoyaltyPoints() + pointsEarned);
        userRepository.save(user);

        emailService.sendBookingConfirmationEmail(booking);

        return convertToDTO(booking);
    }

    @Transactional
    @CacheEvict(value = "hotels", allEntries = true)
    public BookingDTO cancelBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        if (booking.getBookingStatus() == BookingStatus.CANCELLED) {
            throw new IllegalStateException("Booking is already cancelled");
        }

        booking.setBookingStatus(BookingStatus.CANCELLED);
        booking = bookingRepository.save(booking);

        User user = booking.getUser();
        int pointsToDeduct = (int) (booking.getTotalAmount() * 0.1);
        user.setLoyaltyPoints(Math.max(0, user.getLoyaltyPoints() - pointsToDeduct));
        userRepository.save(user);

        return convertToDTO(booking);
    }

    private BookingDTO convertToDTO(Booking booking) {
        String paymentStatus = "UNPAID";
        String transactionId = null;

        var paymentOpt = paymentRepository.findByBookingId(booking.getId());
        if (paymentOpt.isPresent()) {
            paymentStatus = paymentOpt.get().getPaymentStatus().name();
            transactionId = paymentOpt.get().getTransactionId();
        }

        return BookingDTO.builder()
                .id(booking.getId())
                .reservationNumber(booking.getReservationNumber())
                .bookingDate(booking.getBookingDate())
                .checkInDate(booking.getCheckInDate())
                .checkOutDate(booking.getCheckOutDate())
                .totalAmount(booking.getTotalAmount())
                .bookingStatus(booking.getBookingStatus().name())
                .userId(booking.getUser().getId())
                .userFullName(booking.getUser().getFullName())
                .userEmail(booking.getUser().getEmail())
                .roomId(booking.getRoom().getId())
                .roomNumber(booking.getRoom().getRoomNumber())
                .roomType(booking.getRoom().getRoomType().name())
                .hotelId(booking.getRoom().getHotel().getId())
                .hotelName(booking.getRoom().getHotel().getHotelName())
                .hotelCity(booking.getRoom().getHotel().getCity())
                .couponCode(booking.getCoupon() != null ? booking.getCoupon().getCode() : null)
                .discountPercent(booking.getCoupon() != null ? booking.getCoupon().getDiscountPercent() : 0.0)
                .paymentStatus(paymentStatus)
                .transactionId(transactionId)
                .build();
    }
}
