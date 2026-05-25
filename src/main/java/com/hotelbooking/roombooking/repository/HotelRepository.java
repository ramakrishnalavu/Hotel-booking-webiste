package com.hotelbooking.roombooking.repository;

import com.hotelbooking.roombooking.entity.Hotel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HotelRepository extends JpaRepository<Hotel, Long> {
    
    List<Hotel> findByCityIgnoreCase(String city);

    @Query("SELECT DISTINCT h FROM Hotel h " +
           "LEFT JOIN HotelAmenity ha ON ha.hotel.id = h.id " +
           "WHERE (:city IS NULL OR LOWER(h.city) = LOWER(:city)) " +
           "AND (:minRating IS NULL OR h.rating >= :minRating)")
    List<Hotel> searchHotels(@Param("city") String city,
                             @Param("minRating") Double minRating);
}
