package com.aureliagrand.hotel.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "suites")
public class Suite {

    @Id
    @Column(length = 50)
    private String id;

    @Column(nullable = false, length = 100)
    private String suiteName;

    @Column(nullable = false, length = 50)
    private String suiteNumber;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private Double price;

    @Column(length = 50)
    private String capacity = "2-4 Guests";

    @Column(columnDefinition = "TEXT")
    private String amenities;

    @Column(length = 500)
    private String image;

    @Column(nullable = false)
    private Boolean available = true;

    @Column(nullable = false, length = 30)
    private String status = "available";

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Suite() {
    }

    public Suite(String id, String suiteName, String suiteNumber, String description, Double price,
                 String capacity, String amenities, String image, Boolean available, String status) {
        this.id = id;
        this.suiteName = suiteName;
        this.suiteNumber = suiteNumber;
        this.description = description;
        this.price = price;
        this.capacity = capacity;
        this.amenities = amenities;
        this.image = image;
        this.available = available;
        this.status = status;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.available == null) this.available = true;
        if (this.status == null) this.status = "available";
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getSuiteName() {
        return suiteName;
    }

    public void setSuiteName(String suiteName) {
        this.suiteName = suiteName;
    }

    public String getSuiteNumber() {
        return suiteNumber;
    }

    public void setSuiteNumber(String suiteNumber) {
        this.suiteNumber = suiteNumber;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public String getCapacity() {
        return capacity;
    }

    public void setCapacity(String capacity) {
        this.capacity = capacity;
    }

    public String getAmenities() {
        return amenities;
    }

    public void setAmenities(String amenities) {
        this.amenities = amenities;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public Boolean getAvailable() {
        return available;
    }

    public void setAvailable(Boolean available) {
        this.available = available;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
        this.available = "available".equalsIgnoreCase(status);
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
