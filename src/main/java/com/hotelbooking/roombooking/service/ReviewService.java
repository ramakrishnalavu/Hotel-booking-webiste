package com.hotelbooking.roombooking.service;

import com.hotelbooking.roombooking.dto.ReviewDTO;
import com.hotelbooking.roombooking.dto.ReviewRequest;
import com.hotelbooking.roombooking.entity.Hotel;
import com.hotelbooking.roombooking.entity.Review;
import com.hotelbooking.roombooking.entity.User;
import com.hotelbooking.roombooking.exception.ResourceNotFoundException;
import com.hotelbooking.roombooking.repository.HotelRepository;
import com.hotelbooking.roombooking.repository.ReviewRepository;
import com.hotelbooking.roombooking.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private HotelRepository hotelRepository;

    @Autowired
    private UserRepository userRepository;

    public List<ReviewDTO> getReviewsByHotel(Long hotelId) {
        return reviewRepository.findByHotelIdOrderByCreatedAtDesc(hotelId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ReviewDTO addReview(Long hotelId, String email, ReviewRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found with ID: " + hotelId));

        Review review = Review.builder()
                .rating(request.getRating())
                .comment(request.getComment())
                .user(user)
                .hotel(hotel)
                .build();

        review = reviewRepository.save(review);

        Double avgRating = reviewRepository.getAverageRatingForHotel(hotelId);
        if (avgRating != null) {
            hotel.setRating(Math.round(avgRating * 10.0) / 10.0);
            hotelRepository.save(hotel);
        }

        return convertToDTO(review);
    }

    private ReviewDTO convertToDTO(Review review) {
        return ReviewDTO.builder()
                .id(review.getId())
                .rating(review.getRating())
                .comment(review.getComment())
                .userId(review.getUser().getId())
                .userFullName(review.getUser().getFullName())
                .hotelId(review.getHotel().getId())
                .hotelName(review.getHotel().getHotelName())
                .createdAt(review.getCreatedAt())
                .build();
    }
}
