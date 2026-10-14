package com.aureliagrand.hotel.dto;

import com.aureliagrand.hotel.entity.User;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Authentication response payload containing JWT token and user profile details")
public class LoginResponse {

    @Schema(description = "Indicates if authentication succeeded", example = "true")
    private boolean success = true;

    @Schema(description = "Status or welcome message", example = "Login successful")
    private String message = "Login successful";

    @Schema(description = "JWT Bearer access token", example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbkBhdXJlbGlhZ3JhbmQuY29tIiwicm9sZSI6IkFETUlOIiwidXNlcklkIjoxLCJuYW1lIjoiQXVyZWxpYSBBZG1pbiJ9.sample_signature")
    private String token;

    @Schema(description = "User unique ID", example = "1")
    private Long id;

    @Schema(description = "User display name", example = "Aurelia Admin")
    private String name;

    @Schema(description = "User full name alias", example = "Aurelia Admin")
    private String fullName;

    @Schema(description = "User email address", example = "admin@aureliagrand.com")
    private String email;

    @Schema(description = "Assigned security role", example = "ADMIN", allowableValues = {"ADMIN", "STAFF", "GUEST"})
    private String role;

    @Schema(description = "Country of residence", example = "India")
    private String country;

    @Schema(description = "Preferred currency code", example = "INR")
    private String currency;

    @Schema(description = "Account approval status", example = "APPROVED")
    private String status = "APPROVED";

    @Schema(description = "Nested user profile DTO")
    private UserDto user;

    public LoginResponse() {
    }

    public LoginResponse(String token, User userEntity) {
        this.token = token;
        this.success = true;
        this.message = "Login successful";
        if (userEntity != null) {
            this.id = userEntity.getId();
            this.name = userEntity.getName();
            this.fullName = userEntity.getName();
            this.email = userEntity.getEmail();
            this.role = userEntity.getRole() != null ? userEntity.getRole().name() : "GUEST";
            this.country = userEntity.getCountry();
            this.currency = userEntity.getCurrency();
            this.status = userEntity.getStatus() != null ? userEntity.getStatus().name() : "APPROVED";
            this.user = new UserDto(userEntity);
        }
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
        this.fullName = name;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
        this.name = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public UserDto getUser() {
        return user;
    }

    public void setUser(UserDto user) {
        this.user = user;
    }
}
