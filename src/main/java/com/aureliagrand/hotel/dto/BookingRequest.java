package com.aureliagrand.hotel.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

@Schema(description = "Reservation booking creation or modification request payload")
public class BookingRequest {

    @Schema(description = "Booking type: room, suite, or hall", example = "room", allowableValues = {"room", "suite", "hall"})
    private String type = "room";

    @Schema(description = "Room ID if booking a room", example = "RM-101")
    private String roomId;

    @Schema(description = "Suite ID if booking a luxury suite", example = "STE-301")
    private String suiteId;

    @Schema(description = "Party Hall ID if booking an event hall", example = "HAL-001")
    private String hallId;

    @Schema(description = "Check-in date (yyyy-MM-dd)", example = "2026-10-01", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull(message = "Check-in date is required")
    @JsonAlias({"checkIn", "checkInDate"})
    private LocalDate checkInDate;

    @Schema(description = "Check-out date (yyyy-MM-dd)", example = "2026-10-05", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull(message = "Check-out date is required")
    @JsonAlias({"checkOut", "checkOutDate"})
    private LocalDate checkOutDate;

    @Schema(description = "Number of adults", example = "2")
    private Integer adults = 1;

    @Schema(description = "Number of children", example = "0")
    private Integer children = 0;

    @Schema(description = "Total number of guests", example = "2")
    private Integer guests = 1;

    @Schema(description = "Guest full name for folio", example = "Lady Eleanor Vance")
    private String guestName;

    @Schema(description = "Guest email address", example = "eleanor.vance@example.com")
    private String guestEmail;

    @Schema(description = "Guest contact phone number", example = "+91 98765 43210")
    private String guestPhone;

    @Schema(description = "Guest VIP membership tier", example = "gold", allowableValues = {"silver", "gold", "platinum"})
    private String vipTier = "gold";

    @Schema(description = "Special dietary, room, or concierge requests", example = "High floor, quiet room, late check-out requested")
    private String specialRequests;

    @Schema(description = "Selected payment method", example = "Visa Infinite (Luxury Folio)")
    private String paymentMethod = "Visa Infinite (Luxury Folio)";

    @Schema(description = "Billing currency code", example = "INR")
    private String currency = "INR";

    @Schema(description = "Selected packages or add-ons description", example = "Airport Transfer, Champagne Welcome")
    private String addons;

    public BookingRequest() {
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getRoomId() {
        return roomId;
    }

    public void setRoomId(String roomId) {
        this.roomId = roomId;
    }

    public String getSuiteId() {
        return suiteId;
    }

    public void setSuiteId(String suiteId) {
        this.suiteId = suiteId;
    }

    public String getHallId() {
        return hallId;
    }

    public void setHallId(String hallId) {
        this.hallId = hallId;
    }

    public LocalDate getCheckInDate() {
        return checkInDate;
    }

    public void setCheckInDate(LocalDate checkInDate) {
        this.checkInDate = checkInDate;
    }

    public LocalDate getCheckOutDate() {
        return checkOutDate;
    }

    public void setCheckOutDate(LocalDate checkOutDate) {
        this.checkOutDate = checkOutDate;
    }

    public Integer getAdults() {
        return adults;
    }

    public void setAdults(Integer adults) {
        this.adults = adults;
    }

    public Integer getChildren() {
        return children;
    }

    public void setChildren(Integer children) {
        this.children = children;
    }

    public Integer getGuests() {
        return guests;
    }

    public void setGuests(Integer guests) {
        this.guests = guests;
    }

    public String getGuestName() {
        return guestName;
    }

    public void setGuestName(String guestName) {
        this.guestName = guestName;
    }

    public String getGuestEmail() {
        return guestEmail;
    }

    public void setGuestEmail(String guestEmail) {
        this.guestEmail = guestEmail;
    }

    public String getGuestPhone() {
        return guestPhone;
    }

    public void setGuestPhone(String guestPhone) {
        this.guestPhone = guestPhone;
    }

    public String getVipTier() {
        return vipTier;
    }

    public void setVipTier(String vipTier) {
        this.vipTier = vipTier;
    }

    public String getSpecialRequests() {
        return specialRequests;
    }

    public void setSpecialRequests(String specialRequests) {
        this.specialRequests = specialRequests;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public String getAddons() {
        return addons;
    }

    public void setAddons(String addons) {
        this.addons = addons;
    }
}
