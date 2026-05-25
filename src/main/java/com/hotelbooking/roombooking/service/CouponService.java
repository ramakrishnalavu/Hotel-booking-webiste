package com.hotelbooking.roombooking.service;

import com.hotelbooking.roombooking.dto.CouponDTO;
import com.hotelbooking.roombooking.entity.Coupon;
import com.hotelbooking.roombooking.exception.InvalidCouponException;
import com.hotelbooking.roombooking.exception.ResourceNotFoundException;
import com.hotelbooking.roombooking.repository.CouponRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CouponService {

    @Autowired
    private CouponRepository couponRepository;

    public List<CouponDTO> getAllCoupons() {
        return couponRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public CouponDTO getCouponById(Long id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found with ID: " + id));
        return convertToDTO(coupon);
    }

    public CouponDTO createCoupon(CouponDTO couponDTO) {
        if (couponRepository.findByCode(couponDTO.getCode()).isPresent()) {
            throw new IllegalArgumentException("Coupon code already exists");
        }

        Coupon coupon = Coupon.builder()
                .code(couponDTO.getCode().toUpperCase())
                .discountPercent(couponDTO.getDiscountPercent())
                .expiryDate(couponDTO.getExpiryDate())
                .build();

        coupon = couponRepository.save(coupon);
        return convertToDTO(coupon);
    }

    public void deleteCoupon(Long id) {
        if (!couponRepository.existsById(id)) {
            throw new ResourceNotFoundException("Coupon not found with ID: " + id);
        }
        couponRepository.deleteById(id);
    }

    public Coupon validateAndGetCoupon(String code) {
        Coupon coupon = couponRepository.findByCode(code.toUpperCase())
                .orElseThrow(() -> new InvalidCouponException("Invalid coupon code"));

        if (coupon.getExpiryDate().isBefore(LocalDate.now())) {
            throw new InvalidCouponException("Coupon code has expired");
        }

        return coupon;
    }

    private CouponDTO convertToDTO(Coupon coupon) {
        return CouponDTO.builder()
                .id(coupon.getId())
                .code(coupon.getCode())
                .discountPercent(coupon.getDiscountPercent())
                .expiryDate(coupon.getExpiryDate())
                .build();
    }
}
