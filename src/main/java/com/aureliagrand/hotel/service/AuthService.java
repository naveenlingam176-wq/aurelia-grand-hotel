package com.aureliagrand.hotel.service;

import com.aureliagrand.hotel.dto.GuestRegisterRequest;
import com.aureliagrand.hotel.dto.LoginRequest;
import com.aureliagrand.hotel.dto.LoginResponse;
import com.aureliagrand.hotel.dto.RegisterRequest;
import com.aureliagrand.hotel.dto.StaffRegisterRequest;
import com.aureliagrand.hotel.dto.UserDto;
import com.aureliagrand.hotel.entity.AccountStatus;
import com.aureliagrand.hotel.entity.Role;
import com.aureliagrand.hotel.entity.User;
import com.aureliagrand.hotel.exception.AccountPendingException;
import com.aureliagrand.hotel.exception.AccountRejectedException;
import com.aureliagrand.hotel.exception.BadRequestException;
import com.aureliagrand.hotel.exception.ConflictException;
import com.aureliagrand.hotel.exception.ResourceNotFoundException;
import com.aureliagrand.hotel.repository.UserRepository;
import com.aureliagrand.hotel.security.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
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

        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        if (user.getStatus() == AccountStatus.PENDING) {
            throw new AccountPendingException("Your staff account application is currently PENDING administrative approval. Please await executive review.");
        }

        if (user.getStatus() == AccountStatus.REJECTED) {
            throw new AccountRejectedException("Your staff account application has been REJECTED. Access is not permitted.");
        }

        if (!Boolean.TRUE.equals(user.getActive())) {
            throw new DisabledException("Account is disabled. Please contact hotel management.");
        }

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, request.getPassword())
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);
        } catch (Exception ex) {
            throw new BadCredentialsException("Invalid email or password");
        }

        String roleName = user.getRole() != null ? user.getRole().name() : "GUEST";
        String token = tokenProvider.generateToken(user.getEmail(), roleName, user.getId(), user.getName());

        return new LoginResponse(token, user);
    }

    @Transactional
    public UserDto registerGuest(GuestRegisterRequest request) {
        if (request.getConfirmPassword() != null && !request.getConfirmPassword().isBlank()
                && !request.getPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Passwords do not match. Please re-enter your password.");
        }

        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new ConflictException("Email is already registered: " + email);
        }

        User user = new User();
        user.setName(request.getName() != null ? request.getName().trim() : "Valued Guest");
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone());
        user.setRole(Role.GUEST); // Strictly server-enforced GUEST role
        user.setCountry(request.getCountry() != null ? request.getCountry() : "India");
        user.setCurrency(request.getCurrency() != null ? request.getCurrency() : "INR");
        user.setStatus(AccountStatus.APPROVED);
        user.setActive(true);

        User saved = userRepository.save(user);
        return new UserDto(saved);
    }

    @Transactional
    public UserDto registerStaff(StaffRegisterRequest request) {
        if (request.getConfirmPassword() != null && !request.getConfirmPassword().isBlank()
                && !request.getPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Passwords do not match. Please re-enter your password.");
        }

        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new ConflictException("Email is already registered: " + email);
        }

        User user = new User();
        user.setName(request.getName() != null ? request.getName().trim() : "Staff Member");
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone());
        user.setRole(Role.STAFF); // Strictly server-enforced STAFF role; NEVER ADMIN
        user.setCountry("India");
        user.setCurrency("INR");
        user.setStatus(AccountStatus.PENDING); // Staff accounts require Admin review
        user.setActive(false); // Inactive until approved

        User saved = userRepository.save(user);
        return new UserDto(saved);
    }

    @Transactional
    public UserDto register(RegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new ConflictException("Email is already registered: " + email);
        }

        if (request.getRole() == Role.ADMIN) {
            throw new BadRequestException("Public administrative account creation is strictly forbidden.");
        }

        User user = new User();
        user.setName(request.getName() != null ? request.getName().trim() : "Valued Guest");
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone());
        user.setCountry(request.getCountry() != null ? request.getCountry() : "India");
        user.setCurrency(request.getCurrency() != null ? request.getCurrency() : "INR");

        if (request.getRole() == Role.STAFF) {
            user.setRole(Role.STAFF);
            user.setStatus(AccountStatus.PENDING);
            user.setActive(false);
        } else {
            user.setRole(Role.GUEST);
            user.setStatus(AccountStatus.APPROVED);
            user.setActive(true);
        }

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
