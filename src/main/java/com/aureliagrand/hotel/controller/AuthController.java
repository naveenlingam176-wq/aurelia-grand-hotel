package com.aureliagrand.hotel.controller;

import com.aureliagrand.hotel.dto.ErrorResponse;
import com.aureliagrand.hotel.dto.LoginRequest;
import com.aureliagrand.hotel.dto.LoginResponse;
import com.aureliagrand.hotel.dto.RegisterRequest;
import com.aureliagrand.hotel.dto.UserDto;
import com.aureliagrand.hotel.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
@Tag(name = "Authentication", description = "Endpoints for user authentication, registration, session profile, and system health")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @Operation(
            summary = "User Login",
            description = "Authenticate user credentials (email & password) and receive a signed JWT Bearer token along with profile metadata. **Access: Public**",
            security = {}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Authentication successful, JWT token issued",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = LoginResponse.class))),
            @ApiResponse(responseCode = "400", description = "Validation error (missing or malformed fields)",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Invalid email or password credentials",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error occurred",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PostMapping("/auth/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Register New User Account",
            description = "Register a new guest or staff user with email, password, contact, and country preferences. **Access: Public**",
            security = {}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User successfully registered",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = UserDto.class))),
            @ApiResponse(responseCode = "400", description = "Validation failure (invalid email format, password too short)",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "409", description = "Conflict: An account with this email address already exists",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error occurred",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PostMapping("/auth/register")
    public ResponseEntity<UserDto> register(@Valid @RequestBody RegisterRequest request) {
        UserDto response = authService.register(request);
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Get Current User Profile",
            description = "Retrieve identity, role, contact, and currency preference of the currently authenticated user from JWT context. **Access: Authenticated Users (ADMIN, STAFF, GUEST)**",
            security = @SecurityRequirement(name = "BearerAuth")
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Current authenticated user profile returned successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized: Missing, invalid, or expired JWT token",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "User record not found in system",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error occurred",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    })
    @GetMapping("/auth/me")
    public ResponseEntity<Map<String, Object>> getCurrentUser() {
        UserDto userDto = authService.getCurrentUserProfile();
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("user", userDto);
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Update User Preferences",
            description = "Update the active user's regional preferences such as country of residence and default currency (e.g. INR, USD, EUR, GBP). **Access: Authenticated Users**",
            security = @SecurityRequirement(name = "BearerAuth")
    )
    @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "Preferences payload specifying country and currency",
            content = @Content(
                    mediaType = "application/json",
                    examples = @ExampleObject(value = "{\n  \"country\": \"India\",\n  \"currency\": \"INR\"\n}")
            )
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Preferences updated successfully",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = UserDto.class))),
            @ApiResponse(responseCode = "400", description = "Bad Request: Invalid preference values supplied",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized: Missing or invalid JWT token",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error occurred",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PutMapping("/auth/preferences")
    public ResponseEntity<UserDto> updatePreferences(@RequestBody Map<String, String> prefs) {
        String country = prefs.get("country");
        String currency = prefs.get("currency");
        UserDto updated = authService.updateUserPreferences(country, currency);
        return ResponseEntity.ok(updated);
    }

    @Operation(
            summary = "User Logout",
            description = "Clear current user session state. Client discards local JWT token storage. **Access: Public / Authenticated**",
            security = @SecurityRequirement(name = "BearerAuth")
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully logged out")
    })
    @PostMapping("/auth/logout")
    public ResponseEntity<Map<String, Object>> logout() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Logged out successfully");
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Service Health Check",
            description = "Verify operational health status and connectivity of the Aurelia Grand Luxury Hotel Management System backend. **Access: Public**",
            security = {}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "System is healthy and responsive")
    })
    @GetMapping({"/health", "/auth/health"})
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "healthy");
        response.put("service", "Aurelia Grand Luxury Hotel Management System");
        response.put("timestamp", java.time.Instant.now().toString());
        return ResponseEntity.ok(response);
    }
}
