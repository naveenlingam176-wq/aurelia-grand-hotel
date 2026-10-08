package com.aureliagrand.hotel.service;

import com.aureliagrand.hotel.entity.Room;
import com.aureliagrand.hotel.exception.ConflictException;
import com.aureliagrand.hotel.exception.ResourceNotFoundException;
import com.aureliagrand.hotel.repository.RoomRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class RoomService {

    private final RoomRepository roomRepository;

    public RoomService(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
    }

    public List<Room> getAllRooms() {
        return roomRepository.findAll();
    }

    public Room getRoomById(String id) {
        return roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with ID: " + id));
    }

    @Transactional
    public Room createRoom(Room room) {
        if (roomRepository.existsById(room.getId())) {
            throw new ConflictException("Room with ID already exists: " + room.getId());
        }
        return roomRepository.save(room);
    }

    @Transactional
    public Room updateRoom(String id, Room updatedRoom) {
        Room room = getRoomById(id);

        if (updatedRoom.getRoomName() != null) room.setRoomName(updatedRoom.getRoomName());
        if (updatedRoom.getRoomNumber() != null) room.setRoomNumber(updatedRoom.getRoomNumber());
        if (updatedRoom.getRoomType() != null) room.setRoomType(updatedRoom.getRoomType());
        if (updatedRoom.getCategory() != null) room.setCategory(updatedRoom.getCategory());
        if (updatedRoom.getPrice() != null) room.setPrice(updatedRoom.getPrice());
        if (updatedRoom.getDescription() != null) room.setDescription(updatedRoom.getDescription());
        if (updatedRoom.getCapacity() != null) room.setCapacity(updatedRoom.getCapacity());
        if (updatedRoom.getAmenities() != null) room.setAmenities(updatedRoom.getAmenities());
        if (updatedRoom.getImage() != null) room.setImage(updatedRoom.getImage());
        if (updatedRoom.getGallery() != null) room.setGallery(updatedRoom.getGallery());
        if (updatedRoom.getFloor() != null) room.setFloor(updatedRoom.getFloor());
        if (updatedRoom.getSize() != null) room.setSize(updatedRoom.getSize());
        if (updatedRoom.getStatus() != null) room.setStatus(updatedRoom.getStatus());
        if (updatedRoom.getAvailable() != null) room.setAvailable(updatedRoom.getAvailable());

        return roomRepository.save(room);
    }

    @Transactional
    public void deleteRoom(String id) {
        if (!roomRepository.existsById(id)) {
            throw new ResourceNotFoundException("Room not found with ID: " + id);
        }
        roomRepository.deleteById(id);
    }

    @Transactional
    public Room toggleRoomStatus(String id) {
        Room room = getRoomById(id);
        if ("available".equalsIgnoreCase(room.getStatus())) {
            room.setStatus("occupied");
        } else {
            room.setStatus("available");
        }
        return roomRepository.save(room);
    }
}
