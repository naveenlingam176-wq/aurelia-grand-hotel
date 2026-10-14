package com.aureliagrand.hotel.dto;

import com.aureliagrand.hotel.entity.Role;
import com.aureliagrand.hotel.entity.User;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "User profile information data transfer object")
public class UserDto {

    @Schema(description = "User internal database ID", example = "1")
    private Long id;

    @Schema(description = "User full name", example = "Lady Eleanor Vance")
    private String name;

    @Schema(description = "User full name alias", example = "Lady Eleanor Vance")
    private String fullName;

    @Schema(description = "Registered email address", example = "eleanor.vance@example.com")
    private String email;

    @Schema(description = "Contact phone number", example = "+91 98765 43210")
    private String phone;

    @Schema(description = "Assigned security role", example = "GUEST", allowableValues = {"ADMIN", "STAFF", "GUEST"})
    private String role;

    @Schema(description = "Country of origin", example = "India")
    private String country;

    @Schema(description = "Preferred currency code", example = "INR")
    private String currency;

    @Schema(description = "Account active state indicator", example = "true")
    private Boolean active;

    @Schema(description = "Account approval status", example = "APPROVED", allowableValues = {"PENDING", "APPROVED", "REJECTED"})
    private String status;

    @Schema(description = "Account registration timestamp")
    private java.time.LocalDateTime createdAt;

    public UserDto() {
    }

    public UserDto(User user) {
        if (user != null) {
            this.id = user.getId();
            this.name = user.getName();
            this.fullName = user.getName();
            this.email = user.getEmail();
            this.phone = user.getPhone();
            this.role = user.getRole() != null ? user.getRole().name() : "GUEST";
            this.country = user.getCountry();
            this.currency = user.getCurrency();
            this.active = user.getActive();
            this.status = user.getStatus() != null ? user.getStatus().name() : "APPROVED";
            this.createdAt = user.getCreatedAt();
        }
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

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
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

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public java.time.LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(java.time.LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
