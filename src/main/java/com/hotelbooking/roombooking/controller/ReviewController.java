package com.hotelbooking.roombooking.controller;

import com.hotelbooking.roombooking.dto.ReviewDTO;
import com.hotelbooking.roombooking.dto.ReviewRequest;
import com.hotelbooking.roombooking.service.ReviewService;
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
@RequestMapping("/api/reviews")
@Tag(name = "Reviews", description = "Endpoints for posting and reading reviews")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @GetMapping("/hotel/{hotelId}")
    @Operation(summary = "Get reviews by hotel", description = "Retrieves all user reviews posted for a specific hotel")
    public ResponseEntity<List<ReviewDTO>> getReviewsByHotel(@PathVariable Long hotelId) {
        List<ReviewDTO> reviews = reviewService.getReviewsByHotel(hotelId);
        return ResponseEntity.ok(reviews);
    }

    @PostMapping("/hotel/{hotelId}")
    @Operation(summary = "Post hotel review", description = "Creates a new review with comment and 1-5 rating, and updates the hotel aggregate score.")
    public ResponseEntity<ReviewDTO> addReview(
            @PathVariable Long hotelId,
            @Valid @RequestBody ReviewRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        ReviewDTO review = reviewService.addReview(hotelId, userDetails.getUsername(), request);
        return new ResponseEntity<>(review, HttpStatus.CREATED);
    }
}
