package com.hotelbooking.roombooking.controller;

import com.hotelbooking.roombooking.dto.BookingDTO;
import com.hotelbooking.roombooking.dto.BookingRequest;
import com.hotelbooking.roombooking.service.BookingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@Tag(name = "Bookings", description = "Endpoints for creating and managing room bookings")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @PostMapping
    @Operation(summary = "Create a booking reservation", description = "Places a room booking reservation. Checks overlap bounds using a pessimistic lock and sends async confirmation email.")
    public ResponseEntity<BookingDTO> createBooking(
            @Valid @RequestBody BookingRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        BookingDTO booking = bookingService.createBooking(request, userDetails.getUsername());
        return new ResponseEntity<>(booking, HttpStatus.CREATED);
    }

    @GetMapping("/history")
    @Operation(summary = "Get user booking history", description = "Fetches the full booking history of the authenticated user")
    public ResponseEntity<List<BookingDTO>> getBookingHistory(
            @RequestParam Long userId,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        List<BookingDTO> history = bookingService.getBookingsByUser(userId);
        return ResponseEntity.ok(history);
    }

    @GetMapping("/reservation/{resNum}")
    @Operation(summary = "Get reservation details", description = "Fetches complete detail of a specific booking via its reservation code")
    public ResponseEntity<BookingDTO> getBookingByReservationNumber(@PathVariable String resNum) {
        BookingDTO booking = bookingService.getBookingByReservationNumber(resNum);
        return ResponseEntity.ok(booking);
    }

    @PutMapping("/{id}/cancel")
    @Operation(summary = "Cancel booking", description = "Cancels an existing booking reservation, releasing locked days and deducting earned loyalty points")
    public ResponseEntity<BookingDTO> cancelBooking(@PathVariable Long id) {
        BookingDTO cancelled = bookingService.cancelBooking(id);
        return ResponseEntity.ok(cancelled);
    }
}
