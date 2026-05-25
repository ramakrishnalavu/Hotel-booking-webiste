package com.hotelbooking.roombooking.service;

import com.hotelbooking.roombooking.entity.Booking;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Async
    public void sendBookingConfirmationEmail(Booking booking) {
        String recipientEmail = booking.getUser().getEmail();
        String subject = "Booking Confirmation - " + booking.getReservationNumber();
        String messageText = String.format(
                "Dear %s,\n\n" +
                "Thank you for booking with us! Your reservation is confirmed.\n\n" +
                "Reservation Details:\n" +
                "- Reservation Number: %s\n" +
                "- Hotel: %s (%s)\n" +
                "- Room Number: %s\n" +
                "- Check-in Date: %s\n" +
                "- Check-out Date: %s\n" +
                "- Total Amount: $%s\n\n" +
                "We look forward to hosting you!\n\n" +
                "Best regards,\n" +
                "Hotel Booking Management Team",
                booking.getUser().getFullName(),
                booking.getReservationNumber(),
                booking.getRoom().getHotel().getHotelName(),
                booking.getRoom().getHotel().getCity(),
                booking.getRoom().getRoomNumber(),
                booking.getCheckInDate(),
                booking.getCheckOutDate(),
                booking.getTotalAmount()
        );

        logger.info("Sending booking confirmation email to: {} for reservation: {}", recipientEmail, booking.getReservationNumber());
        
        if (mailSender == null) {
            logger.warn("JavaMailSender is not initialized (dummy settings). Printing email text to console log:\n{}", messageText);
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(recipientEmail);
            message.setSubject(subject);
            message.setText(messageText);
            mailSender.send(message);
            logger.info("Email sent successfully!");
        } catch (Exception e) {
            logger.error("Failed to send async booking confirmation email to: {}. Error: {}", recipientEmail, e.getMessage());
        }
    }
}
