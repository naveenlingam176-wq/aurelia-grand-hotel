package com.aureliagrand.hotel.controller;

import com.aureliagrand.hotel.dto.ErrorResponse;
import com.aureliagrand.hotel.entity.Invoice;
import com.aureliagrand.hotel.service.InvoiceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/invoices")
@Tag(name = "Invoices", description = "Endpoints for guest billing statements, tax invoices, and folio receipts")
public class InvoiceController {

    private final InvoiceService invoiceService;

    public InvoiceController(InvoiceService invoiceService) {
        this.invoiceService = invoiceService;
    }

    @Operation(
            summary = "Get All Invoices",
            description = "Retrieve list of all invoices. ADMIN/STAFF see resort-wide invoices; GUEST sees only invoices issued for their bookings. **Access: Authenticated Users**",
            security = @SecurityRequirement(name = "BearerAuth")
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Invoices list successfully retrieved",
                    content = @Content(mediaType = "application/json", array = @ArraySchema(schema = @Schema(implementation = Invoice.class)))),
            @ApiResponse(responseCode = "401", description = "Unauthorized: Missing or invalid JWT token",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error occurred",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    })
    @GetMapping
    public ResponseEntity<List<Invoice>> getInvoices() {
        return ResponseEntity.ok(invoiceService.getInvoices());
    }

    @Operation(
            summary = "Get Invoice By ID",
            description = "Retrieve detailed tax invoice and charges breakdown by numeric invoice ID. **Access: Authenticated Users**",
            security = @SecurityRequirement(name = "BearerAuth")
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Invoice found and returned",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = Invoice.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized: Missing or invalid JWT token",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Invoice not found with the requested ID",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error occurred",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    })
    @GetMapping("/{id}")
    public ResponseEntity<Invoice> getInvoiceById(
            @Parameter(description = "Numeric invoice primary key ID", required = true, example = "1")
            @PathVariable Long id) {
        return ResponseEntity.ok(invoiceService.getInvoiceById(id));
    }

    @Operation(
            summary = "Get Invoice By Booking ID",
            description = "Retrieve the billing invoice associated with a specific booking numeric ID. **Access: Authenticated Users**",
            security = @SecurityRequirement(name = "BearerAuth")
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Invoice found for booking",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = Invoice.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized: Missing or invalid JWT token",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Invoice or booking not found",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error occurred",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    })
    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<Invoice> getInvoiceByBookingId(
            @Parameter(description = "Associated Booking ID", required = true, example = "1")
            @PathVariable Long bookingId) {
        return ResponseEntity.ok(invoiceService.getInvoiceByBookingId(bookingId));
    }
}
