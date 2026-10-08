package com.aureliagrand.hotel.dto;

import com.aureliagrand.hotel.entity.Booking;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Booking and reservation comprehensive details data transfer object")
public class BookingDto {

    @Schema(description = "Unique alphanumeric booking confirmation reference code", example = "AG-2026-00124")
    private String id; // bookingId e.g. AG-2026-00124

    @Schema(description = "Internal auto-increment primary key ID", example = "1")
    private Long internalId;

    @Schema(description = "Guest reference code", example = "GST-1")
    private String guestId;

    @Schema(description = "Booking category: room, suite, or hall", example = "room")
    private String type;

    @Schema(description = "Room identifier if a standard room was booked", example = "RM-101")
    private String roomId;

    @Schema(description = "Party hall identifier if a hall was booked", example = "HAL-001")
    private String hallId;

    @Schema(description = "Suite identifier if a suite was booked", example = "STE-301")
    private String suiteId;

    @Schema(description = "Display title of the booked accommodation or facility", example = "The Aurelia Grand Presidential Suite")
    private String title;

    @Schema(description = "Assigned room or hall number", example = "101")
    private String roomNumber;

    @Schema(description = "Guest full name", example = "Lady Eleanor Vance")
    private String guestName;

    @Schema(description = "Guest contact email", example = "eleanor.vance@example.com")
    private String guestEmail;

    @Schema(description = "Guest contact phone number", example = "+91 98765 43210")
    private String guestPhone;

    @Schema(description = "Guest loyalty VIP tier", example = "gold", allowableValues = {"silver", "gold", "platinum"})
    private String vipTier;

    @Schema(description = "Check-in date formatted as yyyy-MM-dd", example = "2026-10-01")
    private String checkIn;

    @Schema(description = "Check-out date formatted as yyyy-MM-dd", example = "2026-10-05")
    private String checkOut;

    @Schema(description = "Total number of nights stayed", example = "4")
    private Integer nights;

    @Schema(description = "Number of adult guests", example = "2")
    private Integer adults;

    @Schema(description = "Number of child guests", example = "0")
    private Integer children;

    @Schema(description = "Base price per night in local currency", example = "15000.0")
    private Double basePrice;

    @Schema(description = "Subtotal accommodation charge", example = "60000.0")
    private Double subtotal;

    @Schema(description = "Total charges for selected add-ons and services", example = "3500.0")
    private Double addonsTotal;

    @Schema(description = "Applicable luxury and hospitality tax", example = "11430.0")
    private Double tax;

    @Schema(description = "Service charge amount", example = "3175.0")
    private Double serviceCharge;

    @Schema(description = "Grand total booking amount including all taxes and fees", example = "78105.0")
    private Double totalAmount;

    @Schema(description = "Booking reservation status", example = "CONFIRMED", allowableValues = {"PENDING", "CONFIRMED", "ACTIVE", "COMPLETED", "CANCELLED"})
    private String status;

    @Schema(description = "Payment processing status", example = "PAID", allowableValues = {"PENDING", "PAID", "REFUNDED", "FAILED"})
    private String paymentStatus;

    @Schema(description = "Selected payment instrument", example = "Visa Infinite (Luxury Folio)")
    private String paymentMethod;

    @Schema(description = "Special guest requests and preferences", example = "High floor ocean view")
    private String specialRequests;

    @Schema(description = "Hero image URL for the booked accommodation", example = "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b")
    private String image;

    @Schema(description = "Timestamp when the booking was initiated", example = "2026-09-21T18:00:00Z")
    private String createdAt;

    public BookingDto() {
    }

    public BookingDto(Booking b) {
        if (b != null) {
            this.id = b.getBookingId();
            this.internalId = b.getId();
            this.guestId = b.getGuest() != null ? "GST-" + b.getGuest().getId() : "GST-0";
            this.type = b.getType();
            this.roomId = b.getRoom() != null ? b.getRoom().getId() : (b.getSuite() != null ? b.getSuite().getId() : null);
            this.hallId = b.getPartyHall() != null ? b.getPartyHall().getId() : null;
            this.suiteId = b.getSuite() != null ? b.getSuite().getId() : null;

            if (b.getRoom() != null) {
                this.title = b.getRoom().getRoomName();
                this.roomNumber = b.getRoom().getRoomNumber();
                this.image = b.getRoom().getImage();
            } else if (b.getSuite() != null) {
                this.title = b.getSuite().getSuiteName();
                this.roomNumber = b.getSuite().getSuiteNumber();
                this.image = b.getSuite().getImage();
            } else if (b.getPartyHall() != null) {
                this.title = b.getPartyHall().getHallName();
                this.roomNumber = b.getPartyHall().getId();
                this.image = b.getPartyHall().getImage();
            }

            this.guestName = b.getGuestName() != null ? b.getGuestName() : (b.getGuest() != null ? b.getGuest().getName() : "");
            this.guestEmail = b.getGuestEmail() != null ? b.getGuestEmail() : (b.getGuest() != null ? b.getGuest().getEmail() : "");
            this.guestPhone = b.getGuestPhone() != null ? b.getGuestPhone() : (b.getGuest() != null ? b.getGuest().getPhone() : "");
            this.vipTier = b.getVipTier() != null ? b.getVipTier() : "gold";
            this.checkIn = b.getCheckInDate() != null ? b.getCheckInDate().toString() : "";
            this.checkOut = b.getCheckOutDate() != null ? b.getCheckOutDate().toString() : "";
            this.nights = b.getNights();
            this.adults = b.getAdults();
            this.children = b.getChildren();
            this.basePrice = b.getBaseAmount();
            this.subtotal = b.getBaseAmount() * (b.getNights() != null && b.getNights() > 0 ? b.getNights() : 1);
            this.addonsTotal = b.getAddonsAmount() != null ? b.getAddonsAmount() : 0.0;
            this.tax = b.getTaxAmount() != null ? b.getTaxAmount() : 0.0;
            this.serviceCharge = b.getServiceCharge() != null ? b.getServiceCharge() : 0.0;
            this.totalAmount = b.getTotalAmount();
            this.status = b.getStatus() != null ? b.getStatus().name() : "CONFIRMED";
            this.paymentStatus = b.getPaymentStatus() != null ? b.getPaymentStatus().name() : "PAID";
            this.paymentMethod = b.getPaymentMethod();
            this.specialRequests = b.getSpecialRequests();
            if (b.getImage() != null) {
                this.image = b.getImage();
            }
            this.createdAt = b.getCreatedAt() != null ? b.getCreatedAt().toString() : "";
        }
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Long getInternalId() {
        return internalId;
    }

    public void setInternalId(Long internalId) {
        this.internalId = internalId;
    }

    public String getGuestId() {
        return guestId;
    }

    public void setGuestId(String guestId) {
        this.guestId = guestId;
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

    public String getHallId() {
        return hallId;
    }

    public void setHallId(String hallId) {
        this.hallId = hallId;
    }

    public String getSuiteId() {
        return suiteId;
    }

    public void setSuiteId(String suiteId) {
        this.suiteId = suiteId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getRoomNumber() {
        return roomNumber;
    }

    public void setRoomNumber(String roomNumber) {
        this.roomNumber = roomNumber;
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

    public String getCheckIn() {
        return checkIn;
    }

    public void setCheckIn(String checkIn) {
        this.checkIn = checkIn;
    }

    public String getCheckOut() {
        return checkOut;
    }

    public void setCheckOut(String checkOut) {
        this.checkOut = checkOut;
    }

    public Integer getNights() {
        return nights;
    }

    public void setNights(Integer nights) {
        this.nights = nights;
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

    public Double getBasePrice() {
        return basePrice;
    }

    public void setBasePrice(Double basePrice) {
        this.basePrice = basePrice;
    }

    public Double getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(Double subtotal) {
        this.subtotal = subtotal;
    }

    public Double getAddonsTotal() {
        return addonsTotal;
    }

    public void setAddonsTotal(Double addonsTotal) {
        this.addonsTotal = addonsTotal;
    }

    public Double getTax() {
        return tax;
    }

    public void setTax(Double tax) {
        this.tax = tax;
    }

    public Double getServiceCharge() {
        return serviceCharge;
    }

    public void setServiceCharge(Double serviceCharge) {
        this.serviceCharge = serviceCharge;
    }

    public Double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(Double totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getSpecialRequests() {
        return specialRequests;
    }

    public void setSpecialRequests(String specialRequests) {
        this.specialRequests = specialRequests;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }
}
