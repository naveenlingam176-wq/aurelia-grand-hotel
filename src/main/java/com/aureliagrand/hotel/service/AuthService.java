package com.aureliagrand.hotel.service;

import com.aureliagrand.hotel.dto.LoginRequest;
import com.aureliagrand.hotel.dto.LoginResponse;
import com.aureliagrand.hotel.dto.RegisterRequest;
import com.aureliagrand.hotel.dto.UserDto;
import com.aureliagrand.hotel.entity.Role;
import com.aureliagrand.hotel.entity.User;
import com.aureliagrand.hotel.exception.BadRequestException;
import com.aureliagrand.hotel.exception.ConflictException;
import com.aureliagrand.hotel.exception.ResourceNotFoundException;
import com.aureliagrand.hotel.repository.UserRepository;
import com.aureliagrand.hotel.security.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
    }

    public LoginResponse login(LoginRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, request.getPassword())
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);
        } catch (Exception ex) {
            throw new BadCredentialsException("Invalid email or password");
        }

        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        String roleName = user.getRole() != null ? user.getRole().name() : "GUEST";
        String token = tokenProvider.generateToken(user.getEmail(), roleName, user.getId(), user.getName());

        return new LoginResponse(token, user);
    }

    @Transactional
    public UserDto register(RegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new ConflictException("Email is already registered: " + email);
        }

        User user = new User();
        user.setName(request.getName() != null ? request.getName().trim() : "Valued Guest");
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone());
        user.setRole(request.getRole() != null ? request.getRole() : Role.GUEST);
        user.setCountry(request.getCountry() != null ? request.getCountry() : "India");
        user.setCurrency(request.getCurrency() != null ? request.getCurrency() : "INR");
        user.setActive(true);

        User saved = userRepository.save(user);
        return new UserDto(saved);
    }

    public User getCurrentAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            throw new org.springframework.security.access.AccessDeniedException("No authenticated user in current context");
        }
        String email = auth.getName();
        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found in database: " + email));
    }

    public UserDto getCurrentUserProfile() {
        return new UserDto(getCurrentAuthenticatedUser());
    }

    @Transactional
    public UserDto updateUserPreferences(String country, String currency) {
        User user = getCurrentAuthenticatedUser();
        if (country != null && !country.isBlank()) {
            user.setCountry(country);
        }
        if (currency != null && !currency.isBlank()) {
            user.setCurrency(currency);
        }
        User updated = userRepository.save(user);
        return new UserDto(updated);
    }
}
