package com.hotelbooking.roombooking.controller;

import com.hotelbooking.roombooking.dto.CouponDTO;
import com.hotelbooking.roombooking.entity.Coupon;
import com.hotelbooking.roombooking.service.CouponService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/coupons")
@Tag(name = "Coupons", description = "Endpoints for managing and validating coupons")
public class CouponController {

    @Autowired
    private CouponService couponService;

    @GetMapping("/validate/{code}")
    @Operation(summary = "Validate a coupon code", description = "Checks whether a promotional coupon is currently valid and active, and returns its discount percentage")
    public ResponseEntity<CouponDTO> validateCoupon(@PathVariable String code) {
        Coupon coupon = couponService.validateAndGetCoupon(code);
        CouponDTO dto = CouponDTO.builder()
                .id(coupon.getId())
                .code(coupon.getCode())
                .discountPercent(coupon.getDiscountPercent())
                .expiryDate(coupon.getExpiryDate())
                .build();
        return ResponseEntity.ok(dto);
    }
}
