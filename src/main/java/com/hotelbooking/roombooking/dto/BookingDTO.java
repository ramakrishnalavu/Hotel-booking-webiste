package com.hotelbooking.roombooking.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingDTO {
    private Long id;
    private String reservationNumber;
    private LocalDateTime bookingDate;
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private Double totalAmount;
    private String bookingStatus;
    
    // User details
    private Long userId;
    private String userFullName;
    private String userEmail;
    
    // Room details
    private Long roomId;
    private String roomNumber;
    private String roomType;
    
    // Hotel details
    private Long hotelId;
    private String hotelName;
    private String hotelCity;
    
    // Coupon details
    private String couponCode;
    private Double discountPercent;
    
    // Payment details
    private String paymentStatus;
    private String transactionId;
}
