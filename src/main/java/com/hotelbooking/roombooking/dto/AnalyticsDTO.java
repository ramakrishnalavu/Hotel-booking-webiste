package com.hotelbooking.roombooking.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnalyticsDTO {
    private Double totalRevenue;
    private Long totalBookings;
    private Long totalRooms;
    private Long totalUsers;
    private Double averageOccupancyRate;
    private Map<String, Long> bookingsByStatus;
    private Map<String, Double> revenueByCity;
}
