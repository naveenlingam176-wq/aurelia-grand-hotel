package com.aureliagrand.hotel.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Schema(description = "Restaurant dining order or in-room dining service request payload")
public class DiningOrderRequest {

    @Schema(description = "Restaurant identifier", example = "1", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull(message = "Restaurant ID is required")
    private Long restaurantId;

    @Schema(description = "Requested reservation or delivery timestamp", example = "2026-10-02T19:30:00")
    private LocalDateTime orderDate;

    @Schema(description = "Dining table number (for dine-in)", example = "T-14")
    private String tableNumber;

    @Schema(description = "Suite or room number (for in-room dining delivery)", example = "RM-101")
    private String suiteDelivery;

    @Schema(description = "Number of dining guests", example = "2")
    private Integer partySize = 2;

    @Schema(description = "Special dietary restrictions or preparation instructions", example = "Gluten free, extra cutlery")
    private String specialRequests;

    @Schema(description = "Serialized JSON string of ordered menu items", example = "[{\"id\":1,\"name\":\"Truffle Risotto\",\"quantity\":2,\"price\":1800}]")
    private String itemsJson;

    @Schema(description = "Total dining order amount", example = "3600.0")
    private Double totalAmount = 0.0;

    @Schema(description = "Billing currency code", example = "INR")
    private String currency = "INR";

    public DiningOrderRequest() {
    }

    public Long getRestaurantId() {
        return restaurantId;
    }

    public void setRestaurantId(Long restaurantId) {
        this.restaurantId = restaurantId;
    }

    public LocalDateTime getOrderDate() {
        return orderDate;
    }

    public void setOrderDate(LocalDateTime orderDate) {
        this.orderDate = orderDate;
    }

    public String getTableNumber() {
        return tableNumber;
    }

    public void setTableNumber(String tableNumber) {
        this.tableNumber = tableNumber;
    }

    public String getSuiteDelivery() {
        return suiteDelivery;
    }

    public void setSuiteDelivery(String suiteDelivery) {
        this.suiteDelivery = suiteDelivery;
    }

    public Integer getPartySize() {
        return partySize;
    }

    public void setPartySize(Integer partySize) {
        this.partySize = partySize;
    }

    public String getSpecialRequests() {
        return specialRequests;
    }

    public void setSpecialRequests(String specialRequests) {
        this.specialRequests = specialRequests;
    }

    public String getItemsJson() {
        return itemsJson;
    }

    public void setItemsJson(String itemsJson) {
        this.itemsJson = itemsJson;
    }

    public Double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(Double totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }
}
