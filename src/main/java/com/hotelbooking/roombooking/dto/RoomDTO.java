package com.hotelbooking.roombooking.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomDTO {
    private Long id;
    private String roomNumber;
    private String roomType;
    private Double pricePerNight;
    private Integer maxGuests;
    private String status;
    private Long hotelId;
    private String hotelName;
}
