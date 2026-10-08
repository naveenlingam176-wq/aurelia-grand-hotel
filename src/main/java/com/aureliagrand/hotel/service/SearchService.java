package com.aureliagrand.hotel.service;

import com.aureliagrand.hotel.entity.*;
import com.aureliagrand.hotel.repository.*;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class SearchService {

    private final BookingRepository bookingRepository;
    private final RoomRepository roomRepository;
    private final SuiteRepository suiteRepository;
    private final PartyHallRepository partyHallRepository;
    private final UserRepository userRepository;

    public SearchService(BookingRepository bookingRepository,
                         RoomRepository roomRepository,
                         SuiteRepository suiteRepository,
                         PartyHallRepository partyHallRepository,
                         UserRepository userRepository) {
        this.bookingRepository = bookingRepository;
        this.roomRepository = roomRepository;
        this.suiteRepository = suiteRepository;
        this.partyHallRepository = partyHallRepository;
        this.userRepository = userRepository;
    }

    public List<Map<String, Object>> executeSearch(String rawQuery, String category) {
        if (rawQuery == null || rawQuery.trim().isEmpty()) {
            return Collections.emptyList();
        }

        String query = rawQuery.trim().toLowerCase();
        String cat = (category != null && !category.isBlank())
                ? category.trim().toLowerCase().replace("-", "").replace("_", "")
                : "all";

        // Normalize category alias names
        if ("guest".equals(cat) || "guests".equals(cat)) {
            cat = "guest";
        } else if ("guestid".equals(cat)) {
            cat = "guestid";
        } else if ("booking".equals(cat) || "bookings".equals(cat) || "bookingid".equals(cat)) {
            cat = "bookingid";
        } else if ("contact".equals(cat) || "phone".equals(cat) || "email".equals(cat)) {
            cat = "contact";
        } else if ("room".equals(cat) || "rooms".equals(cat) || "suite".equals(cat) || "suites".equals(cat)) {
            cat = "room";
        } else if ("hall".equals(cat) || "halls".equals(cat) || "partyhall".equals(cat)) {
            cat = "hall";
        } else {
            cat = "all";
        }

        // Try extracting numeric guest ID if query is numeric or "gst-<num>"
        Long parsedNumericId = null;
        if (query.matches("^(gst-)?\\d+$")) {
            try {
                parsedNumericId = Long.parseLong(query.replaceFirst("^gst-", ""));
            } catch (NumberFormatException ignored) {}
        }

        List<Map<String, Object>> results = new ArrayList<>();
        Set<String> seenUserIds = new HashSet<>();
        Set<String> seenBookingIds = new HashSet<>();

        // 1. Search Users / Guests directly
        if ("all".equals(cat) || "guest".equals(cat) || "guestid".equals(cat) || "contact".equals(cat)) {
            List<User> matchingUsers = new ArrayList<>();

            if ("guest".equals(cat)) {
                matchingUsers.addAll(userRepository.searchUsersByName(query));
            } else if ("guestid".equals(cat)) {
                if (parsedNumericId != null) {
                    userRepository.findById(parsedNumericId).ifPresent(matchingUsers::add);
                }
                List<User> byIdPattern = userRepository.searchUsersByGuestId(query);
                for (User u : byIdPattern) {
                    if (!matchingUsers.contains(u)) matchingUsers.add(u);
                }
            } else if ("contact".equals(cat)) {
                matchingUsers.addAll(userRepository.searchUsersByContact(query));
            } else {
                // "all"
                if (parsedNumericId != null) {
                    userRepository.findById(parsedNumericId).ifPresent(matchingUsers::add);
                }
                List<User> allMatches = userRepository.searchUsers(query);
                for (User u : allMatches) {
                    if (!matchingUsers.contains(u)) matchingUsers.add(u);
                }
            }

            for (User u : matchingUsers) {
                String gId = "GST-" + u.getId();
                if (seenUserIds.contains(gId)) continue;
                seenUserIds.add(gId);

                // Fetch real associated booking records for this guest
                List<Booking> userBookings = bookingRepository.findByGuest_IdOrderByCreatedAtDesc(u.getId());
                if (userBookings.isEmpty() && u.getEmail() != null) {
                    userBookings = bookingRepository.findByGuestEmailIgnoreCaseOrderByCreatedAtDesc(u.getEmail());
                }

                List<Map<String, Object>> bookingSummaries = new ArrayList<>();
                for (Booking b : userBookings) {
                    Map<String, Object> bs = new LinkedHashMap<>();
                    bs.put("id", b.getBookingId());
                    bs.put("bookingId", b.getBookingId());
                    bs.put("type", b.getType() != null ? b.getType() : "room");
                    bs.put("status", b.getStatus() != null ? b.getStatus().name() : "CONFIRMED");
                    String resTitle = b.getRoom() != null ? b.getRoom().getRoomName() :
                            (b.getPartyHall() != null ? b.getPartyHall().getHallName() :
                            (b.getSuite() != null ? b.getSuite().getSuiteName() : "Luxury Suite"));
                    bs.put("title", resTitle);
                    bs.put("roomNumber", b.getRoom() != null ? b.getRoom().getRoomNumber() :
                            (b.getSuite() != null ? b.getSuite().getSuiteNumber() : null));
                    bs.put("checkIn", b.getCheckInDate() != null ? b.getCheckInDate().toString() : "");
                    bs.put("checkOut", b.getCheckOutDate() != null ? b.getCheckOutDate().toString() : "");
                    bs.put("nights", b.getNights());
                    bs.put("totalAmount", b.getTotalAmount());
                    bs.put("currency", b.getCurrency() != null ? b.getCurrency() : "INR");
                    bookingSummaries.add(bs);
                }

                Map<String, Object> item = new LinkedHashMap<>();
                item.put("id", gId);
                item.put("type", "guest");
                item.put("badge", "VIP GUEST");
                item.put("title", u.getName() + " (" + gId + ")");
                item.put("guestName", u.getName());
                item.put("guestId", gId);
                item.put("guestEmail", u.getEmail());
                item.put("guestPhone", u.getPhone() != null ? u.getPhone() : "");
                item.put("country", u.getCountry() != null ? u.getCountry() : "India");
                item.put("currency", u.getCurrency() != null ? u.getCurrency() : "INR");
                item.put("role", u.getRole() != null ? u.getRole().name() : "GUEST");
                item.put("bookingCount", userBookings.size());
                item.put("bookings", bookingSummaries);
                item.put("subtitle", u.getEmail() +
                        (u.getPhone() != null && !u.getPhone().isBlank() ? " • " + u.getPhone() : "") +
                        " • " + userBookings.size() + " Reservation" + (userBookings.size() == 1 ? "" : "s"));

                results.add(item);
            }
        }

        // 2. Search Bookings
        if ("all".equals(cat) || "bookingid".equals(cat) || "guest".equals(cat) || "guestid".equals(cat) || "contact".equals(cat)) {
            List<Booking> bookings = new ArrayList<>();

            if ("bookingid".equals(cat)) {
                bookings.addAll(bookingRepository.searchBookingsByBookingId(query));
            } else if ("guest".equals(cat)) {
                bookings.addAll(bookingRepository.searchBookingsByGuestName(query));
            } else if ("guestid".equals(cat)) {
                bookings.addAll(bookingRepository.searchBookingsByGuestId(query));
                if (parsedNumericId != null) {
                    List<Booking> byGid = bookingRepository.findByGuest_IdOrderByCreatedAtDesc(parsedNumericId);
                    for (Booking b : byGid) {
                        if (!bookings.contains(b)) bookings.add(b);
                    }
                }
            } else if ("contact".equals(cat)) {
                bookings.addAll(bookingRepository.searchBookingsByContact(query));
            } else {
                // "all"
                bookings.addAll(bookingRepository.searchBookings(query));
                if (parsedNumericId != null) {
                    List<Booking> byGid = bookingRepository.findByGuest_IdOrderByCreatedAtDesc(parsedNumericId);
                    for (Booking b : byGid) {
                        if (!bookings.contains(b)) bookings.add(b);
                    }
                }
            }

            for (Booking b : bookings) {
                if (seenBookingIds.contains(b.getBookingId())) continue;
                seenBookingIds.add(b.getBookingId());

                boolean isHall = "hall".equalsIgnoreCase(b.getType());
                String resourceName = b.getRoom() != null ? b.getRoom().getRoomName() :
                        (b.getPartyHall() != null ? b.getPartyHall().getHallName() :
                        (b.getSuite() != null ? b.getSuite().getSuiteName() : "Luxury Suite"));

                String gName = (b.getGuestName() != null && !b.getGuestName().isBlank())
                        ? b.getGuestName()
                        : (b.getGuest() != null ? b.getGuest().getName() : "Distinguished Guest");
                String gEmail = (b.getGuestEmail() != null && !b.getGuestEmail().isBlank())
                        ? b.getGuestEmail()
                        : (b.getGuest() != null ? b.getGuest().getEmail() : "");
                String gPhone = (b.getGuestPhone() != null && !b.getGuestPhone().isBlank())
                        ? b.getGuestPhone()
                        : (b.getGuest() != null && b.getGuest().getPhone() != null ? b.getGuest().getPhone() : "");
                String gId = b.getGuest() != null ? "GST-" + b.getGuest().getId() : "GST-0";

                Map<String, Object> item = new LinkedHashMap<>();
                item.put("id", b.getBookingId());
                item.put("bookingId", b.getBookingId());
                item.put("type", isHall ? "hall_booking" : "booking");
                item.put("badge", isHall ? "BANQUET" : "BOOKING");
                item.put("title", gName + " (" + b.getBookingId() + ")");
                item.put("subtitle", resourceName + " • " + b.getCheckInDate() + " to " + b.getCheckOutDate());
                item.put("guestName", gName);
                item.put("guestId", gId);
                item.put("guestEmail", gEmail);
                item.put("guestPhone", gPhone);
                item.put("checkIn", b.getCheckInDate() != null ? b.getCheckInDate().toString() : "");
                item.put("checkOut", b.getCheckOutDate() != null ? b.getCheckOutDate().toString() : "");
                item.put("nights", b.getNights() != null ? b.getNights() : 1);
                item.put("adults", b.getAdults() != null ? b.getAdults() : 1);
                item.put("children", b.getChildren() != null ? b.getChildren() : 0);
                item.put("roomNumber", b.getRoom() != null ? b.getRoom().getRoomNumber() :
                        (b.getSuite() != null ? b.getSuite().getSuiteNumber() : null));
                item.put("roomId", b.getRoom() != null ? b.getRoom().getId() :
                        (b.getSuite() != null ? b.getSuite().getId() : null));
                item.put("hallId", b.getPartyHall() != null ? b.getPartyHall().getId() : null);
                item.put("hallName", b.getPartyHall() != null ? b.getPartyHall().getHallName() : null);
                item.put("status", b.getStatus() != null ? b.getStatus().name() : "CONFIRMED");
                item.put("totalAmount", b.getTotalAmount());
                item.put("currency", b.getCurrency());
                results.add(item);
            }
        }

        // 3. Search Rooms & Suites
        if ("all".equals(cat) || "room".equals(cat) || "suite".equals(cat)) {
            List<Room> rooms = roomRepository.searchRooms(query);
            for (Room r : rooms) {
                Map<String, Object> item = new LinkedHashMap<>();
                item.put("id", r.getId());
                item.put("type", "room");
                item.put("badge", "SUITE");
                item.put("title", r.getRoomName() + " (Suite " + r.getRoomNumber() + ")");
                item.put("subtitle", r.getRoomType() + " • " + r.getCapacity() + " • " + r.getStatus());
                item.put("price", r.getPrice());
                item.put("status", r.getStatus());
                results.add(item);
            }
        }

        // 4. Search Party Halls
        if ("all".equals(cat) || "hall".equals(cat) || "partyhall".equals(cat)) {
            List<PartyHall> halls = partyHallRepository.searchPartyHalls(query);
            for (PartyHall h : halls) {
                Map<String, Object> item = new LinkedHashMap<>();
                item.put("id", h.getId());
                item.put("type", "hall");
                item.put("badge", "BANQUET");
                item.put("title", h.getHallName());
                item.put("subtitle", h.getHallType() + " • Capacity: " + h.getCapacity() + " • " + h.getStatus());
                item.put("price", h.getPrice());
                item.put("status", h.getStatus());
                results.add(item);
            }
        }

        return results;
    }
}
