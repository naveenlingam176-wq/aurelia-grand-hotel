package com.aureliagrand.hotel.repository;

import com.aureliagrand.hotel.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);

    Optional<Invoice> findByBooking_Id(Long bookingId);

    List<Invoice> findByGuest_IdOrderByIssueDateDesc(Long guestId);
}
