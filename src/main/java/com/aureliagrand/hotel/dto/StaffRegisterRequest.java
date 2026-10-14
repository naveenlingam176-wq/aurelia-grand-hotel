package com.aureliagrand.hotel.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Staff registration application request payload")
public class StaffRegisterRequest {

    @Schema(description = "Full legal name of the staff applicant", example = "Matteo Rossi", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "Full name is required")
    private String name;

    @Schema(description = "Corporate or personal contact email address", example = "matteo.rossi@aureliagrand.com", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "Email address is required")
    @Email(message = "Please enter a valid email address")
    private String email;

    @Schema(description = "Contact phone number", example = "+91 98765 00099")
    @NotBlank(message = "Phone number is required")
    private String phone;

    @Schema(description = "Operational department / role assignment", example = "Front Desk & Concierge")
    private String department = "Hotel Operations";

    @Schema(description = "Account security password (minimum 6 characters)", example = "StaffSecret2026!", accessMode = Schema.AccessMode.WRITE_ONLY, requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    @Schema(description = "Password confirmation matching the password field", example = "StaffSecret2026!", accessMode = Schema.AccessMode.WRITE_ONLY)
    private String confirmPassword;

    public StaffRegisterRequest() {
    }

    public StaffRegisterRequest(String name, String email, String phone, String department, String password, String confirmPassword) {
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.department = department;
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

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
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
}
