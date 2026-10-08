package com.aureliagrand.hotel.service;

import com.aureliagrand.hotel.dto.PaymentRequest;
import com.aureliagrand.hotel.entity.Booking;
import com.aureliagrand.hotel.entity.Payment;
import com.aureliagrand.hotel.entity.PaymentStatus;
import com.aureliagrand.hotel.entity.Role;
import com.aureliagrand.hotel.entity.User;
import com.aureliagrand.hotel.exception.ResourceNotFoundException;
import com.aureliagrand.hotel.repository.BookingRepository;
import com.aureliagrand.hotel.repository.PaymentRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final AuthService authService;

    public PaymentService(PaymentRepository paymentRepository,
                          BookingRepository bookingRepository,
                          AuthService authService) {
        this.paymentRepository = paymentRepository;
        this.bookingRepository = bookingRepository;
        this.authService = authService;
    }

    public List<Payment> getPayments() {
        User currentUser = authService.getCurrentAuthenticatedUser();
        if (currentUser.getRole() == Role.GUEST) {
            return paymentRepository.findByBooking_Guest_IdOrderByCreatedAtDesc(currentUser.getId());
        }
        return paymentRepository.findAll();
    }

    public Payment getPaymentById(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found: " + id));

        User currentUser = authService.getCurrentAuthenticatedUser();
        if (currentUser.getRole() == Role.GUEST && !payment.getBooking().getGuest().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("Access denied: You can only view your own payments");
        }
        return payment;
    }

    @Transactional
    public Payment processMockPayment(PaymentRequest request) {
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + request.getBookingId()));

        User currentUser = authService.getCurrentAuthenticatedUser();
        if (currentUser.getRole() == Role.GUEST && !booking.getGuest().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("Access denied: You can only pay for your own booking");
        }

        Payment payment = new Payment();
        payment.setBooking(booking);
        payment.setAmount(request.getAmount());
        payment.setCurrency(request.getCurrency() != null ? request.getCurrency() : booking.getCurrency());
        payment.setPaymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : "Visa Infinite");
        payment.setPaymentStatus(PaymentStatus.PAID);
        payment.setTransactionReference("TXN-" + UUID.randomUUID().toString().substring(0, 10).toUpperCase());

        booking.setPaymentStatus(PaymentStatus.PAID);
        bookingRepository.save(booking);

        return paymentRepository.save(payment);
    }
}
