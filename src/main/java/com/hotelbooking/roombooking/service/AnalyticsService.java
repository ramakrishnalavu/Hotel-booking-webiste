package com.hotelbooking.roombooking.service;

import com.hotelbooking.roombooking.dto.AnalyticsDTO;
import com.hotelbooking.roombooking.entity.Booking;
import com.hotelbooking.roombooking.entity.BookingStatus;
import com.hotelbooking.roombooking.repository.BookingRepository;
import com.hotelbooking.roombooking.repository.HotelRepository;
import com.hotelbooking.roombooking.repository.RoomRepository;
import com.hotelbooking.roombooking.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private HotelRepository hotelRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private UserRepository userRepository;

    public AnalyticsDTO getSystemAnalytics() {
        List<Booking> bookings = bookingRepository.findAll();

        double totalRevenue = bookings.stream()
                .filter(b -> b.getBookingStatus() == BookingStatus.CONFIRMED)
                .mapToDouble(Booking::getTotalAmount)
                .sum();

        long totalBookings = bookings.size();
        long totalRooms = roomRepository.count();
        long totalUsers = userRepository.count();

        long activeBookings = bookings.stream()
                .filter(b -> b.getBookingStatus() == BookingStatus.CONFIRMED)
                .count();
        double occupancy = totalRooms > 0 ? ((double) activeBookings / totalRooms) * 100 : 0.0;

        Map<String, Long> statusSplit = bookings.stream()
                .collect(Collectors.groupingBy(b -> b.getBookingStatus().name(), Collectors.counting()));

        Map<String, Double> cityRevenue = bookings.stream()
                .filter(b -> b.getBookingStatus() == BookingStatus.CONFIRMED)
                .collect(Collectors.groupingBy(
                        b -> b.getRoom().getHotel().getCity(),
                        Collectors.summingDouble(Booking::getTotalAmount)
                ));

        return AnalyticsDTO.builder()
                .totalRevenue(Math.round(totalRevenue * 100.0) / 100.0)
                .totalBookings(totalBookings)
                .totalRooms(totalRooms)
                .totalUsers(totalUsers)
                .averageOccupancyRate(Math.round(occupancy * 10.0) / 10.0)
                .bookingsByStatus(statusSplit)
                .revenueByCity(cityRevenue)
                .build();
    }
}
