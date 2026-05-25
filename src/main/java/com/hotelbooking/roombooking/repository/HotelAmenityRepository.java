package com.hotelbooking.roombooking.repository;

import com.hotelbooking.roombooking.entity.HotelAmenity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HotelAmenityRepository extends JpaRepository<HotelAmenity, Long> {
    List<HotelAmenity> findByHotelId(Long hotelId);
    void deleteByHotelId(Long hotelId);
}
