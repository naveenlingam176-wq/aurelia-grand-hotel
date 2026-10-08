package com.aureliagrand.hotel.repository;

import com.aureliagrand.hotel.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoomRepository extends JpaRepository<Room, String> {

    List<Room> findByAvailable(Boolean available);

    List<Room> findByCategoryIgnoreCase(String category);

    List<Room> findByStatusIgnoreCase(String status);

    Optional<Room> findByRoomNumber(String roomNumber);

    @Query("SELECT r FROM Room r WHERE " +
           "LOWER(r.id) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(r.roomName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(r.roomNumber) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(r.roomType) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Room> searchRooms(@Param("query") String query);
}
