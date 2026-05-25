package com.hotelbooking.roombooking.repository;

import com.hotelbooking.roombooking.entity.Room;
import com.hotelbooking.roombooking.entity.RoomStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {
    
    List<Room> findByHotelId(Long hotelId);
    
    List<Room> findByHotelIdAndStatus(Long hotelId, RoomStatus status);

    @Query("SELECT r FROM Room r WHERE r.hotel.id = :hotelId " +
           "AND r.status = 'AVAILABLE' " +
           "AND r.id NOT IN (" +
           "  SELECT b.room.id FROM Booking b " +
           "  WHERE b.room.hotel.id = :hotelId " +
           "  AND b.bookingStatus <> 'CANCELLED' " +
           "  AND b.checkInDate < :checkOutDate " +
           "  AND b.checkOutDate > :checkInDate" +
           ")")
    List<Room> findAvailableRoomsInHotel(@Param("hotelId") Long hotelId,
                                         @Param("checkInDate") LocalDate checkInDate,
                                         @Param("checkOutDate") LocalDate checkOutDate);
}
