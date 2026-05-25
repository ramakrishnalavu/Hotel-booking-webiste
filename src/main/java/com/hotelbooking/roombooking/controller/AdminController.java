package com.hotelbooking.roombooking.controller;

import com.hotelbooking.roombooking.dto.AnalyticsDTO;
import com.hotelbooking.roombooking.dto.BookingDTO;
import com.hotelbooking.roombooking.dto.HotelDTO;
import com.hotelbooking.roombooking.dto.UserDTO;
import com.hotelbooking.roombooking.service.AnalyticsService;
import com.hotelbooking.roombooking.service.AuthService;
import com.hotelbooking.roombooking.service.BookingService;
import com.hotelbooking.roombooking.service.HotelService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@Tag(name = "Admin Panel", description = "Endpoints restricted to System Administrators")
public class AdminController {

    @Autowired
    private HotelService hotelService;

    @Autowired
    private AuthService authService;

    @Autowired
    private BookingService bookingService;

    @Autowired
    private AnalyticsService analyticsService;

    @PostMapping("/hotels")
    @Operation(summary = "Add a new hotel", description = "Registers a new hotel in the system with associated amenities")
    public ResponseEntity<HotelDTO> createHotel(@Valid @RequestBody HotelDTO hotelDTO) {
        HotelDTO created = hotelService.createHotel(hotelDTO);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/hotels/{id}")
    @Operation(summary = "Update hotel details", description = "Updates hotel descriptions, locations, or amenities, evicting associated Redis caches")
    public ResponseEntity<HotelDTO> updateHotel(@PathVariable Long id, @Valid @RequestBody HotelDTO hotelDTO) {
        HotelDTO updated = hotelService.updateHotel(id, hotelDTO);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/hotels/{id}")
    @Operation(summary = "Delete hotel", description = "Removes a hotel from the system completely, releasing all associated rooms and bookings")
    public ResponseEntity<Void> deleteHotel(@PathVariable Long id) {
        hotelService.deleteHotel(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/users")
    @Operation(summary = "List all users", description = "Retrieves all registered user profiles inside the system")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        return ResponseEntity.ok(authService.getAllUsers());
    }

    @PutMapping("/users/{id}/status")
    @Operation(summary = "Block or unblock user", description = "Toggles user activation status to allow blocking misbehaving users or fraud patterns")
    public ResponseEntity<UserDTO> updateUserStatus(
            @PathVariable Long id,
            @RequestParam boolean block) {
        UserDTO user = authService.updateUserStatus(id, block);
        return ResponseEntity.ok(user);
    }

    @GetMapping("/bookings")
    @Operation(summary = "Monitor all bookings", description = "Enables system admins to browse and audit reservations globally")
    public ResponseEntity<List<BookingDTO>> getAllBookings() {
        List<BookingDTO> bookings = bookingService.getAllBookings();
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/analytics")
    @Operation(summary = "System global analytics", description = "Enables admins to pull system-wide performance and financial diagnostics")
    public ResponseEntity<AnalyticsDTO> getGlobalAnalytics() {
        AnalyticsDTO analytics = analyticsService.getSystemAnalytics();
        return ResponseEntity.ok(analytics);
    }

    @GetMapping("/logs")
    @Operation(summary = "System logs mock", description = "Simulates standard file diagnostic prints for system diagnostics")
    public ResponseEntity<List<String>> getSystemLogs() {
        List<String> logs = List.of(
                "[INFO] 2026-05-25 12:44:00 - RateLimitingFilter initialized successfully.",
                "[INFO] 2026-05-25 12:44:15 - RedisCacheManager connected on localhost:6379.",
                "[DEBUG] 2026-05-25 12:45:02 - Pessimistic lock verified for room transaction RES-902.",
                "[WARN] 2026-05-25 12:46:11 - Rate limit warning triggered for mock IP 127.0.0.1.",
                "[INFO] 2026-05-25 12:47:33 - Async booking confirmation email thread spawned."
        );
        return ResponseEntity.ok(logs);
    }
}
