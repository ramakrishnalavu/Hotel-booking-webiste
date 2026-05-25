package com.hotelbooking.roombooking.controller;

import com.hotelbooking.roombooking.dto.PaymentDTO;
import com.hotelbooking.roombooking.dto.PaymentRequest;
import com.hotelbooking.roombooking.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@Tag(name = "Payments", description = "Endpoints for processing and fetching booking payments")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @PostMapping
    @Operation(summary = "Settle a booking payment", description = "Processes payment for a booking. Validates card numbers or UPI handles and transitions booking to CONFIRMED on success.")
    public ResponseEntity<PaymentDTO> processPayment(@Valid @RequestBody PaymentRequest request) {
        PaymentDTO payment = paymentService.processPayment(request);
        return ResponseEntity.ok(payment);
    }

    @GetMapping("/booking/{bookingId}")
    @Operation(summary = "Get payment by booking ID", description = "Retrieves the transaction logs associated with a booking ID")
    public ResponseEntity<PaymentDTO> getPaymentByBooking(@PathVariable Long bookingId) {
        PaymentDTO payment = paymentService.getPaymentByBooking(bookingId);
        return ResponseEntity.ok(payment);
    }
}
