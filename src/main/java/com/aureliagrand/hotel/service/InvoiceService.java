package com.aureliagrand.hotel.service;

import com.aureliagrand.hotel.entity.Invoice;
import com.aureliagrand.hotel.entity.Role;
import com.aureliagrand.hotel.entity.User;
import com.aureliagrand.hotel.exception.ResourceNotFoundException;
import com.aureliagrand.hotel.repository.InvoiceRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final AuthService authService;

    public InvoiceService(InvoiceRepository invoiceRepository, AuthService authService) {
        this.invoiceRepository = invoiceRepository;
        this.authService = authService;
    }

    public List<Invoice> getInvoices() {
        User currentUser = authService.getCurrentAuthenticatedUser();
        if (currentUser.getRole() == Role.GUEST) {
            return invoiceRepository.findByGuest_IdOrderByIssueDateDesc(currentUser.getId());
        }
        return invoiceRepository.findAll();
    }

    public Invoice getInvoiceById(Long id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found: " + id));

        User currentUser = authService.getCurrentAuthenticatedUser();
        if (currentUser.getRole() == Role.GUEST && !invoice.getGuest().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("Access denied: You can only view your own invoices");
        }
        return invoice;
    }

    public Invoice getInvoiceByBookingId(Long bookingId) {
        Invoice invoice = invoiceRepository.findByBooking_Id(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found for booking: " + bookingId));

        User currentUser = authService.getCurrentAuthenticatedUser();
        if (currentUser.getRole() == Role.GUEST && !invoice.getGuest().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("Access denied: You can only view your own invoices");
        }
        return invoice;
    }
}
