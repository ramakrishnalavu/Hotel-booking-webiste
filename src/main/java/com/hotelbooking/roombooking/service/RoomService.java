package com.hotelbooking.roombooking.service;

import com.hotelbooking.roombooking.dto.RoomDTO;
import com.hotelbooking.roombooking.entity.Hotel;
import com.hotelbooking.roombooking.entity.Room;
import com.hotelbooking.roombooking.entity.RoomStatus;
import com.hotelbooking.roombooking.entity.RoomType;
import com.hotelbooking.roombooking.exception.ResourceNotFoundException;
import com.hotelbooking.roombooking.repository.HotelRepository;
import com.hotelbooking.roombooking.repository.RoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RoomService {

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private HotelRepository hotelRepository;

    public List<RoomDTO> getRoomsByHotel(Long hotelId) {
        return roomRepository.findByHotelId(hotelId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<RoomDTO> getAvailableRooms(Long hotelId, LocalDate checkIn, LocalDate checkOut) {
        if (checkIn == null || checkOut == null) {
            return roomRepository.findByHotelIdAndStatus(hotelId, RoomStatus.AVAILABLE).stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
        }
        return roomRepository.findAvailableRoomsInHotel(hotelId, checkIn, checkOut).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public RoomDTO getRoomById(Long id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with ID: " + id));
        return convertToDTO(room);
    }

    @Transactional
    @CacheEvict(value = "hotels", allEntries = true)
    public RoomDTO createRoom(Long hotelId, RoomDTO roomDTO) {
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found with ID: " + hotelId));

        Room room = Room.builder()
                .roomNumber(roomDTO.getRoomNumber())
                .roomType(RoomType.valueOf(roomDTO.getRoomType().toUpperCase()))
                .pricePerNight(roomDTO.getPricePerNight())
                .maxGuests(roomDTO.getMaxGuests())
                .status(RoomStatus.valueOf(roomDTO.getStatus().toUpperCase()))
                .hotel(hotel)
                .build();

        room = roomRepository.save(room);
        return convertToDTO(room);
    }

    @Transactional
    @CacheEvict(value = "hotels", allEntries = true)
    public RoomDTO updateRoom(Long id, RoomDTO roomDTO) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with ID: " + id));

        room.setRoomNumber(roomDTO.getRoomNumber());
        room.setRoomType(RoomType.valueOf(roomDTO.getRoomType().toUpperCase()));
        room.setPricePerNight(roomDTO.getPricePerNight());
        room.setMaxGuests(roomDTO.getMaxGuests());
        room.setStatus(RoomStatus.valueOf(roomDTO.getStatus().toUpperCase()));

        room = roomRepository.save(room);
        return convertToDTO(room);
    }

    @Transactional
    @CacheEvict(value = "hotels", allEntries = true)
    public void deleteRoom(Long id) {
        if (!roomRepository.existsById(id)) {
            throw new ResourceNotFoundException("Room not found with ID: " + id);
        }
        roomRepository.deleteById(id);
    }

    private RoomDTO convertToDTO(Room room) {
        return RoomDTO.builder()
                .id(room.getId())
                .roomNumber(room.getRoomNumber())
                .roomType(room.getRoomType().name())
                .pricePerNight(room.getPricePerNight())
                .maxGuests(room.getMaxGuests())
                .status(room.getStatus().name())
                .hotelId(room.getHotel().getId())
                .hotelName(room.getHotel().getHotelName())
                .build();
    }
}
