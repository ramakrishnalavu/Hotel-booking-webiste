package com.hotelbooking.roombooking.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HotelDTO {
    private Long id;
    private String hotelName;
    private String description;
    private String city;
    private String address;
    private Double rating;
    private List<String> amenities;
    private List<RoomDTO> rooms;
}
