package com.hotelbooking.roombooking.service;

import com.hotelbooking.roombooking.dto.AuthResponse;
import com.hotelbooking.roombooking.dto.LoginRequest;
import com.hotelbooking.roombooking.dto.RegisterRequest;
import com.hotelbooking.roombooking.dto.UserDTO;
import com.hotelbooking.roombooking.entity.Role;
import com.hotelbooking.roombooking.entity.User;
import com.hotelbooking.roombooking.exception.UnauthorizedException;
import com.hotelbooking.roombooking.repository.UserRepository;
import com.hotelbooking.roombooking.security.JwtUtils;
import com.hotelbooking.roombooking.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtils jwtUtils;

    public AuthResponse login(LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtils.generateJwtToken(authentication);

            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            User user = userRepository.findById(userDetails.getId()).orElseThrow();

            return AuthResponse.builder()
                    .token(jwt)
                    .id(user.getId())
                    .email(user.getEmail())
                    .fullName(user.getFullName())
                    .role(user.getRole().name())
                    .loyaltyPoints(user.getLoyaltyPoints())
                    .build();
        } catch (Exception e) {
            throw new UnauthorizedException("Invalid email or password");
        }
    }

    public UserDTO register(RegisterRequest registerRequest) {
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new IllegalArgumentException("Email is already registered");
        }

        Role userRole = Role.ROLE_USER;
        if (registerRequest.getRole() != null && !registerRequest.getRole().trim().isEmpty()) {
            String roleStr = registerRequest.getRole().trim().toUpperCase();
            if (!roleStr.startsWith("ROLE_")) {
                roleStr = "ROLE_" + roleStr;
            }
            try {
                userRole = Role.valueOf(roleStr);
            } catch (Exception e) {
                // Default to ROLE_USER
            }
        }

        User user = User.builder()
                .fullName(registerRequest.getFullName())
                .email(registerRequest.getEmail())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .phone(registerRequest.getPhone())
                .role(userRole)
                .loyaltyPoints(0)
                .build();

        user = userRepository.save(user);

        return convertToDTO(user);
    }

    public UserDTO getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("User not logged in"));
        return convertToDTO(user);
    }

    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public UserDTO updateUserStatus(Long id, boolean block) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        if (block) {
            if (!user.getFullName().contains("(BLOCKED)")) {
                user.setFullName(user.getFullName() + " (BLOCKED)");
            }
        } else {
            user.setFullName(user.getFullName().replace(" (BLOCKED)", ""));
        }
        
        return convertToDTO(userRepository.save(user));
    }

    private UserDTO convertToDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole().name())
                .loyaltyPoints(user.getLoyaltyPoints())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
