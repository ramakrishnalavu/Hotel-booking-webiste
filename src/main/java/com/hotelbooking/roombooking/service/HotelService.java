package com.hotelbooking.roombooking.service;

import com.hotelbooking.roombooking.dto.HotelDTO;
import com.hotelbooking.roombooking.dto.RoomDTO;
import com.hotelbooking.roombooking.entity.Amenity;
import com.hotelbooking.roombooking.entity.Hotel;
import com.hotelbooking.roombooking.entity.HotelAmenity;
import com.hotelbooking.roombooking.entity.Room;
import com.hotelbooking.roombooking.exception.ResourceNotFoundException;
import com.hotelbooking.roombooking.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class HotelService {
    private static final Logger logger = LoggerFactory.getLogger(HotelService.class);

    @Autowired
    private HotelRepository hotelRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private AmenityRepository amenityRepository;

    @Autowired
    private HotelAmenityRepository hotelAmenityRepository;

    @Cacheable(value = "hotels", key = "#city + '-' + #minRating")
    public List<HotelDTO> searchHotels(String city, Double minRating) {
        logger.info("Executing searchHotels query in database for city: {}, minRating: {} (Cache Miss)", city, minRating);
        List<Hotel> hotels = hotelRepository.searchHotels(city, minRating);
        return hotels.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<HotelDTO> getAllHotels() {
        return hotelRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public HotelDTO getHotelById(Long id) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found with ID: " + id));
        
        HotelDTO dto = convertToDTO(hotel);
        
        List<RoomDTO> rooms = roomRepository.findByHotelId(id).stream()
                .map(room -> RoomDTO.builder()
                        .id(room.getId())
                        .roomNumber(room.getRoomNumber())
                        .roomType(room.getRoomType().name())
                        .pricePerNight(room.getPricePerNight())
                        .maxGuests(room.getMaxGuests())
                        .status(room.getStatus().name())
                        .hotelId(id)
                        .hotelName(hotel.getHotelName())
                        .build())
                .collect(Collectors.toList());
        dto.setRooms(rooms);
        
        return dto;
    }

    @Transactional
    @CacheEvict(value = "hotels", allEntries = true)
    public HotelDTO createHotel(HotelDTO hotelDTO) {
        logger.info("Creating hotel and evicting hotel cache");
        Hotel hotel = Hotel.builder()
                .hotelName(hotelDTO.getHotelName())
                .description(hotelDTO.getDescription())
                .city(hotelDTO.getCity())
                .address(hotelDTO.getAddress())
                .rating(0.0)
                .build();

        hotel = hotelRepository.save(hotel);

        if (hotelDTO.getAmenities() != null) {
            for (String amenityName : hotelDTO.getAmenities()) {
                Amenity amenity = amenityRepository.findByNameIgnoreCase(amenityName)
                        .orElseGet(() -> amenityRepository.save(Amenity.builder().name(amenityName).build()));
                
                hotelAmenityRepository.save(HotelAmenity.builder()
                        .hotel(hotel)
                        .amenity(amenity)
                        .build());
            }
        }

        return convertToDTO(hotel);
    }

    @Transactional
    @CacheEvict(value = "hotels", allEntries = true)
    public HotelDTO updateHotel(Long id, HotelDTO hotelDTO) {
        logger.info("Updating hotel and evicting hotel cache");
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found with ID: " + id));

        hotel.setHotelName(hotelDTO.getHotelName());
        hotel.setDescription(hotelDTO.getDescription());
        hotel.setCity(hotelDTO.getCity());
        hotel.setAddress(hotelDTO.getAddress());

        hotel = hotelRepository.save(hotel);

        if (hotelDTO.getAmenities() != null) {
            hotelAmenityRepository.deleteByHotelId(id);
            for (String amenityName : hotelDTO.getAmenities()) {
                Amenity amenity = amenityRepository.findByNameIgnoreCase(amenityName)
                        .orElseGet(() -> amenityRepository.save(Amenity.builder().name(amenityName).build()));
                
                hotelAmenityRepository.save(HotelAmenity.builder()
                        .hotel(hotel)
                        .amenity(amenity)
                        .build());
            }
        }

        return convertToDTO(hotel);
    }

    @Transactional
    @CacheEvict(value = "hotels", allEntries = true)
    public void deleteHotel(Long id) {
        logger.info("Deleting hotel and evicting hotel cache");
        if (!hotelRepository.existsById(id)) {
            throw new ResourceNotFoundException("Hotel not found with ID: " + id);
        }
        hotelRepository.deleteById(id);
    }

    private HotelDTO convertToDTO(Hotel hotel) {
        List<String> amenities = hotelAmenityRepository.findByHotelId(hotel.getId()).stream()
                .map(ha -> ha.getAmenity().getName())
                .collect(Collectors.toList());

        return HotelDTO.builder()
                .id(hotel.getId())
                .hotelName(hotel.getHotelName())
                .description(hotel.getDescription())
                .city(hotel.getCity())
                .address(hotel.getAddress())
                .rating(hotel.getRating())
                .amenities(amenities)
                .build();
    }
}
