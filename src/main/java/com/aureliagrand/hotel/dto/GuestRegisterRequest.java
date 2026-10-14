package com.aureliagrand.hotel.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Guest registration request payload")
public class GuestRegisterRequest {

    @Schema(description = "Full legal name of the guest", example = "Lady Eleanor Vance", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "Full name is required")
    private String name;

    @Schema(description = "Valid email address for reservations and login", example = "eleanor.vance@example.com", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "Email address is required")
    @Email(message = "Please enter a valid email address")
    private String email;

    @Schema(description = "Contact phone number", example = "+91 98765 43210")
    @NotBlank(message = "Phone number is required")
    private String phone;

    @Schema(description = "Account password (minimum 6 characters)", example = "VanceLuxury2026!", accessMode = Schema.AccessMode.WRITE_ONLY, requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    @Schema(description = "Password confirmation matching the password field", example = "VanceLuxury2026!", accessMode = Schema.AccessMode.WRITE_ONLY)
    private String confirmPassword;

    @Schema(description = "Country of origin", example = "India")
    private String country = "India";

    @Schema(description = "Preferred billing currency", example = "INR")
    private String currency = "INR";

    public GuestRegisterRequest() {
    }

    public GuestRegisterRequest(String name, String email, String phone, String password, String confirmPassword) {
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.password = password;
        this.confirmPassword = confirmPassword;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getFullName() {
        return name;
    }

    public void setFullName(String fullName) {
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

    public String getPhoneNumber() {
        return phone;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phone = phoneNumber;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getConfirmPassword() {
        return confirmPassword;
    }

    public void setConfirmPassword(String confirmPassword) {
        this.confirmPassword = confirmPassword;
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
}
