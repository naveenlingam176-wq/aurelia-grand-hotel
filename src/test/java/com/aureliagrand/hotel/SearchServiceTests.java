package com.aureliagrand.hotel;

import com.aureliagrand.hotel.service.SearchService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class SearchServiceTests {

    @Autowired
    private SearchService searchService;

    @Test
    void testSearchByGuestName() {
        List<Map<String, Object>> results = searchService.executeSearch("John", "all");
        assertNotNull(results);
        assertFalse(results.isEmpty());
        assertTrue(results.stream().anyMatch(r -> String.valueOf(r.get("title")).contains("John")));
    }

    @Test
    void testSearchByBookingId() {
        List<Map<String, Object>> results = searchService.executeSearch("AG-2026-00124", "bookingid");
        assertNotNull(results);
        assertFalse(results.isEmpty());
        assertEquals("AG-2026-00124", results.get(0).get("id"));
    }

    @Test
    void testSearchByRoomName() {
        List<Map<String, Object>> results = searchService.executeSearch("Imperial", "room");
        assertNotNull(results);
        assertFalse(results.isEmpty());
    }

    @Test
    void testSearchByPartyHall() {
        List<Map<String, Object>> results = searchService.executeSearch("Ballroom", "hall");
        assertNotNull(results);
        assertFalse(results.isEmpty());
    }

    @Test
    void testEmptySearchQueryReturnsEmptyList() {
        List<Map<String, Object>> results = searchService.executeSearch("", "all");
        assertNotNull(results);
        assertTrue(results.isEmpty());
    }

    @Test
    void testSearchByGuestIdPrefixed() {
        List<Map<String, Object>> results = searchService.executeSearch("GST-4", "guestid");
        assertNotNull(results);
        assertFalse(results.isEmpty());
        assertTrue(results.stream().anyMatch(r -> "GST-4".equalsIgnoreCase(String.valueOf(r.get("guestId")))));
    }

    @Test
    void testSearchByGuestIdNumeric() {
        List<Map<String, Object>> results = searchService.executeSearch("4", "guestid");
        assertNotNull(results);
        assertFalse(results.isEmpty());
        assertTrue(results.stream().anyMatch(r -> "GST-4".equalsIgnoreCase(String.valueOf(r.get("guestId")))));
    }

    @Test
    void testSearchByEmailContactCategory() {
        List<Map<String, Object>> results = searchService.executeSearch("guest@aureliagrand.com", "contact");
        assertNotNull(results);
        assertFalse(results.isEmpty());
        assertTrue(results.stream().anyMatch(r -> "guest@aureliagrand.com".equalsIgnoreCase(String.valueOf(r.get("guestEmail")))));
    }

    @Test
    void testSearchByPhoneContactCategory() {
        List<Map<String, Object>> results = searchService.executeSearch("43211", "contact");
        assertNotNull(results);
        assertFalse(results.isEmpty());
        assertTrue(results.stream().anyMatch(r -> String.valueOf(r.get("guestPhone")).contains("43211")));
    }

    @Test
    void testGuestResultContainsRelevantBookingInfo() {
        List<Map<String, Object>> results = searchService.executeSearch("Lord Arthur", "guest");
        assertNotNull(results);
        assertFalse(results.isEmpty());
        Map<String, Object> guestResult = results.stream()
                .filter(r -> "guest".equals(r.get("type")))
                .findFirst()
                .orElse(null);
        assertNotNull(guestResult, "Expected guest result for Lord Arthur");
        assertTrue(guestResult.containsKey("bookingCount"));
        assertTrue(guestResult.containsKey("bookings"));
        List<?> bookings = (List<?>) guestResult.get("bookings");
        assertNotNull(bookings);
        assertFalse(bookings.isEmpty(), "Lord Arthur should have associated bookings");
    }

    @Test
    void testNoSensitiveAuthenticationDataExposed() {
        List<Map<String, Object>> results = searchService.executeSearch("Lord Arthur", "all");
        for (Map<String, Object> r : results) {
            assertFalse(r.containsKey("password"), "Results must never expose password");
            assertFalse(r.containsKey("token"), "Results must never expose token");
            assertFalse(r.containsKey("jwt"), "Results must never expose jwt");
        }
    }
}
