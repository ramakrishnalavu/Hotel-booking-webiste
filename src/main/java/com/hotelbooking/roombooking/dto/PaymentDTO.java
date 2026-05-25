package com.hotelbooking.roombooking.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentDTO {
    private Long id;
    private Double amount;
    private String paymentMethod;
    private String paymentStatus;
    private String transactionId;
    private Long bookingId;
    private LocalDateTime paidAt;
}
