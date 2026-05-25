package com.hotelbooking.roombooking.controller;

import com.hotelbooking.roombooking.dto.AnalyticsDTO;
import com.hotelbooking.roombooking.dto.BookingDTO;
import com.hotelbooking.roombooking.dto.CouponDTO;
import com.hotelbooking.roombooking.dto.RoomDTO;
import com.hotelbooking.roombooking.service.AnalyticsService;
import com.hotelbooking.roombooking.service.BookingService;
import com.hotelbooking.roombooking.service.CouponService;
import com.hotelbooking.roombooking.service.RoomService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/manager")
@Tag(name = "Manager Panel", description = "Endpoints restricted to Hotel Managers and Admins")
public class ManagerController {

    @Autowired
    private RoomService roomService;

    @Autowired
    private CouponService couponService;

    @Autowired
    private BookingService bookingService;

    @Autowired
    private AnalyticsService analyticsService;

    @PostMapping("/rooms/hotel/{hotelId}")
    @Operation(summary = "Add a new room", description = "Adds a room to a specific hotel")
    public ResponseEntity<RoomDTO> createRoom(@PathVariable Long hotelId, @Valid @RequestBody RoomDTO roomDTO) {
        RoomDTO room = roomService.createRoom(hotelId, roomDTO);
        return new ResponseEntity<>(room, HttpStatus.CREATED);
    }

    @PutMapping("/rooms/{id}")
    @Operation(summary = "Update room details", description = "Updates pricing, capacity, number, or status of a room")
    public ResponseEntity<RoomDTO> updateRoom(@PathVariable Long id, @Valid @RequestBody RoomDTO roomDTO) {
        RoomDTO updated = roomService.updateRoom(id, roomDTO);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/rooms/{id}")
    @Operation(summary = "Delete room", description = "Deletes a room from the system")
    public ResponseEntity<Void> deleteRoom(@PathVariable Long id) {
        roomService.deleteRoom(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/coupons")
    @Operation(summary = "Create a coupon code", description = "Generates a new promotional discount coupon")
    public ResponseEntity<CouponDTO> createCoupon(@Valid @RequestBody CouponDTO couponDTO) {
        CouponDTO created = couponService.createCoupon(couponDTO);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @DeleteMapping("/coupons/{id}")
    @Operation(summary = "Delete coupon", description = "Deletes a promotional coupon")
    public ResponseEntity<Void> deleteCoupon(@PathVariable Long id) {
        couponService.deleteCoupon(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/bookings")
    @Operation(summary = "Monitor reservations", description = "Enables managers to view and audit all reservations across hotels")
    public ResponseEntity<List<BookingDTO>> getAllBookings() {
        List<BookingDTO> bookings = bookingService.getAllBookings();
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/analytics")
    @Operation(summary = "Manager dashboard analytics", description = "Fetches metrics and statistics like revenues, occupancy, and splits")
    public ResponseEntity<AnalyticsDTO> getDashboardAnalytics() {
        AnalyticsDTO analytics = analyticsService.getSystemAnalytics();
        return ResponseEntity.ok(analytics);
    }
}
