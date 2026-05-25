package com.hotelbooking.roombooking.controller;

import com.hotelbooking.roombooking.dto.HotelDTO;
import com.hotelbooking.roombooking.service.HotelService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hotels")
@Tag(name = "Hotels", description = "Endpoints for browsing and searching hotels")
public class HotelController {

    @Autowired
    private HotelService hotelService;

    @GetMapping
    @Operation(summary = "Search or list hotels", description = "Returns a list of hotels, with optional location (city) and minimum rating filters")
    public ResponseEntity<List<HotelDTO>> searchHotels(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) Double minRating) {
        
        if (city == null && minRating == null) {
            return ResponseEntity.ok(hotelService.getAllHotels());
        }
        
        List<HotelDTO> hotels = hotelService.searchHotels(city, minRating);
        return ResponseEntity.ok(hotels);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get hotel details", description = "Retrieves complete hotel info, including its list of rooms and amenities")
    public ResponseEntity<HotelDTO> getHotelById(@PathVariable Long id) {
        HotelDTO hotel = hotelService.getHotelById(id);
        return ResponseEntity.ok(hotel);
    }
}
