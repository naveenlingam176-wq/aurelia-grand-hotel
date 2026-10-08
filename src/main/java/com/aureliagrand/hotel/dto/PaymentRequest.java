package com.aureliagrand.hotel.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

@Schema(description = "Payment processing transaction request payload")
public class PaymentRequest {

    @Schema(description = "Associated booking ID", example = "1", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull(message = "Booking ID is required")
    private Long bookingId;

    @Schema(description = "Payment transaction amount", example = "78105.0", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull(message = "Payment amount is required")
    @Positive(message = "Amount must be positive")
    private Double amount;

    @Schema(description = "Three-letter ISO currency code", example = "INR")
    private String currency = "INR";

    @Schema(description = "Payment instrument method", example = "Visa Infinite")
    private String paymentMethod = "Visa Infinite";

    public PaymentRequest() {
    }

    public Long getBookingId() {
        return bookingId;
    }

    public void setBookingId(Long bookingId) {
        this.bookingId = bookingId;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }
}
