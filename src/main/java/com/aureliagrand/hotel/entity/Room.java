package com.aureliagrand.hotel.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "rooms", indexes = {
    @Index(name = "idx_room_number", columnList = "roomNumber"),
    @Index(name = "idx_room_type", columnList = "roomType"),
    @Index(name = "idx_room_status", columnList = "status")
})
public class Room {

    @Id
    @Column(length = 50)
    private String id;

    @Column(nullable = false, length = 100)
    private String roomName;

    @Column(nullable = false, length = 50)
    private String roomNumber;

    @Column(nullable = false, length = 50)
    private String roomType;

    @Column(length = 50)
    private String category;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private Double price;

    @Column(length = 50)
    private String capacity = "2 Guests";

    @Column(columnDefinition = "TEXT")
    private String amenities;

    @Column(length = 500)
    private String image;

    @Column(columnDefinition = "TEXT")
    private String gallery;

    @Column(length = 50)
    private String floor;

    @Column(length = 50)
    private String size;

    private Double rating = 5.0;

    @Column(nullable = false)
    private Boolean available = true;

    @Column(nullable = false, length = 30)
    private String status = "available";

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Room() {
    }

    public Room(String id, String roomName, String roomNumber, String roomType, String category, String description,
                Double price, String capacity, String amenities, String image, String gallery, String floor,
                String size, Double rating, Boolean available, String status) {
        this.id = id;
        this.roomName = roomName;
        this.roomNumber = roomNumber;
        this.roomType = roomType;
        this.category = category;
        this.description = description;
        this.price = price;
        this.capacity = capacity;
        this.amenities = amenities;
        this.image = image;
        this.gallery = gallery;
        this.floor = floor;
        this.size = size;
        this.rating = rating;
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

    public String getRoomName() {
        return roomName;
    }

    public void setRoomName(String roomName) {
        this.roomName = roomName;
    }

    // Alias for frontend compatibility
    public String getName() {
        return roomName;
    }

    public void setName(String name) {
        this.roomName = name;
    }

    public String getRoomNumber() {
        return roomNumber;
    }

    public void setRoomNumber(String roomNumber) {
        this.roomNumber = roomNumber;
    }

    // Alias for frontend compatibility
    public String getNumber() {
        return roomNumber;
    }

    public void setNumber(String number) {
        this.roomNumber = number;
    }

    public String getRoomType() {
        return roomType;
    }

    public void setRoomType(String roomType) {
        this.roomType = roomType;
    }

    // Alias for frontend compatibility
    public String getType() {
        return roomType;
    }

    public void setType(String type) {
        this.roomType = type;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
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

    public String getGallery() {
        return gallery;
    }

    public void setGallery(String gallery) {
        this.gallery = gallery;
    }

    public String getFloor() {
        return floor;
    }

    public void setFloor(String floor) {
        this.floor = floor;
    }

    public String getSize() {
        return size;
    }

    public void setSize(String size) {
        this.size = size;
    }

    public Double getRating() {
        return rating;
    }

    public void setRating(Double rating) {
        this.rating = rating;
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
