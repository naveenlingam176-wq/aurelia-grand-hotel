package com.aureliagrand.hotel;

import com.aureliagrand.hotel.dto.BookingDto;
import com.aureliagrand.hotel.dto.BookingRequest;
import com.aureliagrand.hotel.dto.LoginRequest;
import com.aureliagrand.hotel.dto.LoginResponse;
import com.aureliagrand.hotel.exception.ConflictException;
import com.aureliagrand.hotel.service.AuthService;
import com.aureliagrand.hotel.service.BookingService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class BookingServiceTests {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private AuthService authService;

    @BeforeEach
    void setUp() {
        // Log in as guest to set SecurityContext
        authService.login(new LoginRequest("user@aureliagrand.com", "UserPassword123!"));
    }

    @Test
    void testCreateBookingAndPreventDoubleBooking() {
        LocalDate checkIn = LocalDate.now().plusYears(1).plusDays((long) (Math.random() * 100));
        LocalDate checkOut = checkIn.plusDays(4);

        BookingRequest request = new BookingRequest();
        request.setRoomId("R-702");
        request.setType("room");
        request.setCheckInDate(checkIn);
        request.setCheckOutDate(checkOut);
        request.setAdults(2);

        BookingDto created = bookingService.createBooking(request);
        assertNotNull(created);
        assertNotNull(created.getId());
        assertTrue(created.getId().startsWith("AG-2026-"));

        // Second booking on overlapping dates for same room MUST throw ConflictException
        BookingRequest duplicate = new BookingRequest();
        duplicate.setRoomId("R-702");
        duplicate.setType("room");
        duplicate.setCheckInDate(checkIn.plusDays(1));
        duplicate.setCheckOutDate(checkOut.plusDays(1));

        assertThrows(ConflictException.class, () -> bookingService.createBooking(duplicate));
    }
}
