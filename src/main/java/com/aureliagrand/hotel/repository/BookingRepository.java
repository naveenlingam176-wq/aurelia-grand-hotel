package com.aureliagrand.hotel.repository;

import com.aureliagrand.hotel.entity.Booking;
import com.aureliagrand.hotel.entity.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    Optional<Booking> findByBookingId(String bookingId);

    List<Booking> findByGuest_IdOrderByCreatedAtDesc(Long guestId);

    List<Booking> findByStatus(BookingStatus status);

    List<Booking> findByType(String type);

    // Overlapping room bookings check (excluding cancelled)
    @Query("SELECT b FROM Booking b WHERE b.room.id = :roomId " +
           "AND b.status != 'CANCELLED' " +
           "AND b.checkInDate < :checkOut " +
           "AND b.checkOutDate > :checkIn " +
           "AND (:excludeBookingId IS NULL OR b.id != :excludeBookingId)")
    List<Booking> findConflictingRoomBookings(@Param("roomId") String roomId,
                                            @Param("checkIn") LocalDate checkIn,
                                            @Param("checkOut") LocalDate checkOut,
                                            @Param("excludeBookingId") Long excludeBookingId);

    // Overlapping party hall bookings check (excluding cancelled)
    @Query("SELECT b FROM Booking b WHERE b.partyHall.id = :hallId " +
           "AND b.status != 'CANCELLED' " +
           "AND b.checkInDate <= :checkOut " +
           "AND b.checkOutDate >= :checkIn " +
           "AND (:excludeBookingId IS NULL OR b.id != :excludeBookingId)")
    List<Booking> findConflictingHallBookings(@Param("hallId") String hallId,
                                            @Param("checkIn") LocalDate checkIn,
                                            @Param("checkOut") LocalDate checkOut,
                                            @Param("excludeBookingId") Long excludeBookingId);

    // Advanced search across guest, bookingId, room, suite, and hall
    @Query("SELECT b FROM Booking b " +
           "LEFT JOIN b.room r " +
           "LEFT JOIN b.suite s " +
           "LEFT JOIN b.partyHall p " +
           "LEFT JOIN b.guest g " +
           "WHERE LOWER(b.bookingId) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(b.guestName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(b.guestEmail) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "(b.guestPhone IS NOT NULL AND LOWER(b.guestPhone) LIKE LOWER(CONCAT('%', :query, '%'))) OR " +
           "(g IS NOT NULL AND (CAST(g.id AS string) LIKE CONCAT('%', :query, '%') OR LOWER(CONCAT('gst-', CAST(g.id AS string))) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(g.name) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(g.email) LIKE LOWER(CONCAT('%', :query, '%')) OR (g.phone IS NOT NULL AND LOWER(g.phone) LIKE LOWER(CONCAT('%', :query, '%'))))) OR " +
           "(r IS NOT NULL AND (LOWER(r.roomName) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(r.roomNumber) LIKE LOWER(CONCAT('%', :query, '%')))) OR " +
           "(s IS NOT NULL AND (LOWER(s.suiteName) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(s.suiteNumber) LIKE LOWER(CONCAT('%', :query, '%')))) OR " +
           "(p IS NOT NULL AND LOWER(p.hallName) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Booking> searchBookings(@Param("query") String query);

    @Query("SELECT b FROM Booking b WHERE LOWER(b.bookingId) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Booking> searchBookingsByBookingId(@Param("query") String query);

    @Query("SELECT b FROM Booking b LEFT JOIN b.guest g WHERE " +
           "LOWER(b.guestName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "(g IS NOT NULL AND LOWER(g.name) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Booking> searchBookingsByGuestName(@Param("query") String query);

    @Query("SELECT b FROM Booking b LEFT JOIN b.guest g WHERE " +
           "(g IS NOT NULL AND (CAST(g.id AS string) LIKE CONCAT('%', :query, '%') OR LOWER(CONCAT('gst-', CAST(g.id AS string))) LIKE LOWER(CONCAT('%', :query, '%'))))")
    List<Booking> searchBookingsByGuestId(@Param("query") String query);

    @Query("SELECT b FROM Booking b LEFT JOIN b.guest g WHERE " +
           "LOWER(b.guestEmail) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "(b.guestPhone IS NOT NULL AND LOWER(b.guestPhone) LIKE LOWER(CONCAT('%', :query, '%'))) OR " +
           "(g IS NOT NULL AND (LOWER(g.email) LIKE LOWER(CONCAT('%', :query, '%')) OR (g.phone IS NOT NULL AND LOWER(g.phone) LIKE LOWER(CONCAT('%', :query, '%')))))")
    List<Booking> searchBookingsByContact(@Param("query") String query);

    List<Booking> findByGuestEmailIgnoreCaseOrderByCreatedAtDesc(String email);
}
