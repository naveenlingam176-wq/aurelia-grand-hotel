package com.aureliagrand.hotel.service;

import com.aureliagrand.hotel.dto.BookingDto;
import com.aureliagrand.hotel.dto.BookingRequest;
import com.aureliagrand.hotel.entity.*;
import com.aureliagrand.hotel.exception.BadRequestException;
import com.aureliagrand.hotel.exception.ConflictException;
import com.aureliagrand.hotel.exception.ResourceNotFoundException;
import com.aureliagrand.hotel.repository.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final RoomRepository roomRepository;
    private final SuiteRepository suiteRepository;
    private final PartyHallRepository partyHallRepository;
    private final InvoiceRepository invoiceRepository;
    private final PaymentRepository paymentRepository;
    private final AuthService authService;

    public BookingService(BookingRepository bookingRepository,
                          RoomRepository roomRepository,
                          SuiteRepository suiteRepository,
                          PartyHallRepository partyHallRepository,
                          InvoiceRepository invoiceRepository,
                          PaymentRepository paymentRepository,
                          AuthService authService) {
        this.bookingRepository = bookingRepository;
        this.roomRepository = roomRepository;
        this.suiteRepository = suiteRepository;
        this.partyHallRepository = partyHallRepository;
        this.invoiceRepository = invoiceRepository;
        this.paymentRepository = paymentRepository;
        this.authService = authService;
    }

    public List<BookingDto> getBookings() {
        User currentUser = authService.getCurrentAuthenticatedUser();

        List<Booking> bookings;
        if (currentUser.getRole() == Role.GUEST) {
            bookings = bookingRepository.findByGuest_IdOrderByCreatedAtDesc(currentUser.getId());
        } else {
            bookings = bookingRepository.findAll();
        }

        return bookings.stream().map(BookingDto::new).collect(Collectors.toList());
    }

    public BookingDto getBookingById(String bookingId) {
        Booking booking = bookingRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + bookingId));

        validateBookingAccess(booking);
        return new BookingDto(booking);
    }

    @Transactional
    public BookingDto createBooking(BookingRequest request) {
        User currentUser = authService.getCurrentAuthenticatedUser();

        LocalDate checkIn = request.getCheckInDate();
        LocalDate checkOut = request.getCheckOutDate();

        if (checkIn == null || checkOut == null) {
            throw new BadRequestException("Check-in and Check-out dates are required");
        }

        // For room bookings, checkout must be strictly after checkin
        // For party hall bookings, checkin and checkout can be on the same day (1-day banquet)
        boolean isHall = "hall".equalsIgnoreCase(request.getType()) || (request.getHallId() != null && !request.getHallId().isBlank());
        if (!isHall && !checkOut.isAfter(checkIn)) {
            throw new BadRequestException("Check-out date must be after check-in date");
        }
        if (isHall && checkOut.isBefore(checkIn)) {
            throw new BadRequestException("Check-out date cannot be before check-in date");
        }

        int nights = (int) ChronoUnit.DAYS.between(checkIn, checkOut);
        if (nights <= 0) nights = 1;

        Booking booking = new Booking();
        booking.setGuest(currentUser);
        booking.setCheckInDate(checkIn);
        booking.setCheckOutDate(checkOut);
        booking.setNights(nights);
        booking.setAdults(request.getAdults() != null ? request.getAdults() : 1);
        booking.setChildren(request.getChildren() != null ? request.getChildren() : 0);
        booking.setGuests(request.getGuests() != null ? request.getGuests() : booking.getAdults() + booking.getChildren());
        booking.setCurrency(request.getCurrency() != null ? request.getCurrency() : currentUser.getCurrency());
        booking.setSpecialRequests(request.getSpecialRequests());
        booking.setPaymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : "Visa Infinite");

        booking.setGuestName(request.getGuestName() != null && !request.getGuestName().isBlank() ? request.getGuestName() : currentUser.getName());
        booking.setGuestEmail(request.getGuestEmail() != null && !request.getGuestEmail().isBlank() ? request.getGuestEmail() : currentUser.getEmail());
        booking.setGuestPhone(request.getGuestPhone() != null && !request.getGuestPhone().isBlank() ? request.getGuestPhone() : currentUser.getPhone());
        booking.setVipTier(request.getVipTier() != null ? request.getVipTier() : "gold");

        double basePrice = 0.0;

        if (isHall) {
            booking.setType("hall");
            String hallId = request.getHallId();
            PartyHall hall = partyHallRepository.findById(hallId)
                    .orElseThrow(() -> new ResourceNotFoundException("Party Hall not found: " + hallId));

            // Prevent double-booking for party hall
            List<Booking> conflicts = bookingRepository.findConflictingHallBookings(hallId, checkIn, checkOut, null);
            if (!conflicts.isEmpty()) {
                throw new ConflictException("Party Hall is not available for the selected dates");
            }

            booking.setPartyHall(hall);
            basePrice = hall.getPrice();
            booking.setImage(hall.getImage());
            booking.setBookingId("AG-PH-" + generateRandomDigits(5));
        } else {
            booking.setType("room");
            final String targetRoomId = (request.getRoomId() != null && !request.getRoomId().isBlank())
                    ? request.getRoomId()
                    : request.getSuiteId();

            if (targetRoomId == null || targetRoomId.isBlank()) {
                throw new BadRequestException("Room or Suite must be selected");
            }

            Room room = roomRepository.findById(targetRoomId)
                    .or(() -> {
                        String cleanNum = targetRoomId.replaceAll("[^0-9]", "");
                        return cleanNum.isEmpty() ? java.util.Optional.empty() : roomRepository.findByRoomNumber(cleanNum);
                    })
                    .orElse(null);
            if (room != null) {
                // Prevent double-booking for room
                List<Booking> conflicts = bookingRepository.findConflictingRoomBookings(room.getId(), checkIn, checkOut, null);
                if (!conflicts.isEmpty()) {
                    throw new ConflictException("Room is not available for the selected dates");
                }
                booking.setRoom(room);
                basePrice = room.getPrice();
                booking.setImage(room.getImage());
            } else {
                Suite suite = suiteRepository.findById(targetRoomId)
                        .or(() -> {
                            String cleanNum = targetRoomId.replaceAll("[^0-9]", "");
                            return cleanNum.isEmpty() ? java.util.Optional.empty() : suiteRepository.findBySuiteNumber(cleanNum);
                        })
                        .orElseThrow(() -> new ResourceNotFoundException("Room/Suite not found: " + targetRoomId));
                booking.setSuite(suite);
                basePrice = suite.getPrice();
                booking.setImage(suite.getImage());
            }

            booking.setBookingId("AG-2026-" + generateRandomDigits(5));
        }

        booking.setBaseAmount(basePrice);
        double subtotal = basePrice * nights;
        double tax = 0.0;
        double service = 0.0;
        double addons = 0.0;
        double total = subtotal + addons + tax + service;

        booking.setSubtotal(subtotal);
        booking.setAddonsAmount(addons);
        booking.setTaxAmount(tax);
        booking.setServiceCharge(service);
        booking.setTotalAmount(total);
        booking.setStatus(BookingStatus.CONFIRMED);
        booking.setPaymentStatus(PaymentStatus.PAID);

        Booking savedBooking = bookingRepository.save(booking);

        // Auto-create Ledger Invoice
        Invoice invoice = new Invoice();
        invoice.setInvoiceNumber("INV-" + savedBooking.getBookingId());
        invoice.setBooking(savedBooking);
        invoice.setGuest(currentUser);
        invoice.setSubtotal(subtotal);
        invoice.setTax(tax);
        invoice.setServiceCharge(service);
        invoice.setTotal(total);
        invoice.setCurrency(savedBooking.getCurrency());
        invoice.setIssueDate(LocalDate.now());
        invoice.setStatus(InvoiceStatus.PAID);
        invoiceRepository.save(invoice);

        // Auto-create Payment record (safe mock flow)
        Payment payment = new Payment();
        payment.setBooking(savedBooking);
        payment.setAmount(total);
        payment.setCurrency(savedBooking.getCurrency());
        payment.setPaymentMethod(savedBooking.getPaymentMethod());
        payment.setPaymentStatus(PaymentStatus.PAID);
        payment.setTransactionReference("TXN-" + System.currentTimeMillis());
        paymentRepository.save(payment);

        return new BookingDto(savedBooking);
    }

    @Transactional
    public BookingDto modifyBooking(String bookingId, BookingRequest request) {
        Booking booking = bookingRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingId));

        validateBookingAccess(booking);

        LocalDate newCheckIn = request.getCheckInDate() != null ? request.getCheckInDate() : booking.getCheckInDate();
        LocalDate newCheckOut = request.getCheckOutDate() != null ? request.getCheckOutDate() : booking.getCheckOutDate();

        if ("room".equals(booking.getType())) {
            if (!newCheckOut.isAfter(newCheckIn)) {
                throw new BadRequestException("Check-out date must be after check-in date");
            }
            if (booking.getRoom() != null) {
                List<Booking> conflicts = bookingRepository.findConflictingRoomBookings(
                        booking.getRoom().getId(), newCheckIn, newCheckOut, booking.getId());
                if (!conflicts.isEmpty()) {
                    throw new ConflictException("Room is not available for the requested modification dates");
                }
            }
        } else if ("hall".equals(booking.getType()) && booking.getPartyHall() != null) {
            List<Booking> conflicts = bookingRepository.findConflictingHallBookings(
                    booking.getPartyHall().getId(), newCheckIn, newCheckOut, booking.getId());
            if (!conflicts.isEmpty()) {
                throw new ConflictException("Party Hall is not available for the requested modification dates");
            }
        }

        booking.setCheckInDate(newCheckIn);
        booking.setCheckOutDate(newCheckOut);
        int nights = (int) ChronoUnit.DAYS.between(newCheckIn, newCheckOut);
        if (nights <= 0) nights = 1;
        booking.setNights(nights);

        if (request.getAdults() != null) booking.setAdults(request.getAdults());
        if (request.getChildren() != null) booking.setChildren(request.getChildren());
        if (request.getSpecialRequests() != null) booking.setSpecialRequests(request.getSpecialRequests());

        double subtotal = booking.getBaseAmount() * nights;
        booking.setSubtotal(subtotal);
        booking.setTotalAmount(subtotal + booking.getAddonsAmount() + booking.getTaxAmount() + booking.getServiceCharge());

        return new BookingDto(bookingRepository.save(booking));
    }

    @Transactional
    public BookingDto cancelBooking(String bookingId) {
        Booking booking = bookingRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingId));

        validateBookingAccess(booking);

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setPaymentStatus(PaymentStatus.REFUNDED);

        invoiceRepository.findByBooking_Id(booking.getId()).ifPresent(inv -> {
            inv.setStatus(InvoiceStatus.CANCELLED);
            invoiceRepository.save(inv);
        });

        return new BookingDto(bookingRepository.save(booking));
    }

    private void validateBookingAccess(Booking booking) {
        User currentUser = authService.getCurrentAuthenticatedUser();
        if (currentUser.getRole() == Role.GUEST) {
            if (!booking.getGuest().getId().equals(currentUser.getId())) {
                throw new AccessDeniedException("Access denied: You can only view and manage your own bookings");
            }
        }
    }

    private String generateRandomDigits(int length) {
        Random rand = new Random();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < length; i++) {
            sb.append(rand.nextInt(10));
        }
        return sb.toString();
    }
}
