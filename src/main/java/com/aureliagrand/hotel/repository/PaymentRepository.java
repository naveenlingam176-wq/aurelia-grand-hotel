package com.aureliagrand.hotel.repository;

import com.aureliagrand.hotel.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    List<Payment> findByBooking_Id(Long bookingId);

    List<Payment> findByBooking_Guest_IdOrderByCreatedAtDesc(Long guestId);

    Optional<Payment> findByTransactionReference(String transactionReference);
}
