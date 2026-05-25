package com.hotelbooking.roombooking.service;

import com.hotelbooking.roombooking.dto.PaymentDTO;
import com.hotelbooking.roombooking.dto.PaymentRequest;
import com.hotelbooking.roombooking.entity.Booking;
import com.hotelbooking.roombooking.entity.BookingStatus;
import com.hotelbooking.roombooking.entity.Payment;
import com.hotelbooking.roombooking.entity.PaymentStatus;
import com.hotelbooking.roombooking.exception.PaymentFailedException;
import com.hotelbooking.roombooking.exception.ResourceNotFoundException;
import com.hotelbooking.roombooking.repository.BookingRepository;
import com.hotelbooking.roombooking.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Transactional
    public PaymentDTO processPayment(PaymentRequest request) {
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + request.getBookingId()));

        if (booking.getBookingStatus() == BookingStatus.CANCELLED) {
            throw new IllegalStateException("Cannot settle payment for a cancelled booking");
        }

        if (request.getTransactionDetails().equalsIgnoreCase("DECLINE") || 
            request.getTransactionDetails().startsWith("4000")) {
            
            Payment payment = Payment.builder()
                    .amount(booking.getTotalAmount())
                    .paymentMethod(request.getPaymentMethod())
                    .paymentStatus(PaymentStatus.FAILED)
                    .transactionId("TXN-FAILED-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                    .booking(booking)
                    .build();
            paymentRepository.save(payment);
            throw new PaymentFailedException("Payment processing failed. Card declined by issuing bank.");
        }

        String transactionId = "TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        Payment payment = Payment.builder()
                .amount(booking.getTotalAmount())
                .paymentMethod(request.getPaymentMethod())
                .paymentStatus(PaymentStatus.SUCCESS)
                .transactionId(transactionId)
                .booking(booking)
                .build();

        payment = paymentRepository.save(payment);

        booking.setBookingStatus(BookingStatus.CONFIRMED);
        bookingRepository.save(booking);

        return convertToDTO(payment);
    }

    public PaymentDTO getPaymentByBooking(Long bookingId) {
        Payment payment = paymentRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("No payment records found for Booking ID: " + bookingId));
        return convertToDTO(payment);
    }

    private PaymentDTO convertToDTO(Payment payment) {
        return PaymentDTO.builder()
                .id(payment.getId())
                .amount(payment.getAmount())
                .paymentMethod(payment.getPaymentMethod())
                .paymentStatus(payment.getPaymentStatus().name())
                .transactionId(payment.getTransactionId())
                .bookingId(payment.getBooking().getId())
                .paidAt(payment.getPaidAt())
                .build();
    }
}
