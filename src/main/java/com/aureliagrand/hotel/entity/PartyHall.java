package com.aureliagrand.hotel.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "party_halls", indexes = {
    @Index(name = "idx_hall_status", columnList = "status")
})
public class PartyHall {

    @Id
    @Column(length = 50)
    private String id;

    @Column(nullable = false, length = 150)
    private String hallName;

    @Column(nullable = false, length = 100)
    private String hallType;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private Integer capacity;

    @Column(nullable = false)
    private Double price;

    @Column(length = 50)
    private String size;

    @Column(length = 50)
    private String floor;

    private Double rating = 4.9;

    @Column(length = 500)
    private String image;

    @Column(columnDefinition = "TEXT")
    private String amenities;

    @Column(columnDefinition = "TEXT")
    private String suitableFor;

    @Column(nullable = false)
    private Boolean available = true;

    @Column(nullable = false, length = 30)
    private String status = "AVAILABLE";

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public PartyHall() {
    }

    public PartyHall(String id, String hallName, String hallType, String description, Integer capacity,
                     Double price, String size, String floor, Double rating, String image,
                     String amenities, String suitableFor, Boolean available, String status) {
        this.id = id;
        this.hallName = hallName;
        this.hallType = hallType;
        this.description = description;
        this.capacity = capacity;
        this.price = price;
        this.size = size;
        this.floor = floor;
        this.rating = rating;
        this.image = image;
        this.amenities = amenities;
        this.suitableFor = suitableFor;
        this.available = available;
        this.status = status;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.available == null) this.available = true;
        if (this.status == null) this.status = "AVAILABLE";
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

    public String getHallName() {
        return hallName;
    }

    public void setHallName(String hallName) {
        this.hallName = hallName;
    }

    // Compatibility aliases
    public String getName() {
        return hallName;
    }

    public void setName(String name) {
        this.hallName = name;
    }

    public String getHallType() {
        return hallType;
    }

    public void setHallType(String hallType) {
        this.hallType = hallType;
    }

    public String getType() {
        return hallType;
    }

    public void setType(String type) {
        this.hallType = type;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public String getSize() {
        return size;
    }

    public void setSize(String size) {
        this.size = size;
    }

    public String getFloor() {
        return floor;
    }

    public void setFloor(String floor) {
        this.floor = floor;
    }

    public Double getRating() {
        return rating;
    }

    public void setRating(Double rating) {
        this.rating = rating;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public String getAmenities() {
        return amenities;
    }

    public void setAmenities(String amenities) {
        this.amenities = amenities;
    }

    public String getSuitableFor() {
        return suitableFor;
    }

    public void setSuitableFor(String suitableFor) {
        this.suitableFor = suitableFor;
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
        this.available = "AVAILABLE".equalsIgnoreCase(status);
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
