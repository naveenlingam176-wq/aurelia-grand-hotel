package com.aureliagrand.hotel.controller;

import com.aureliagrand.hotel.dto.ErrorResponse;
import com.aureliagrand.hotel.dto.PaymentRequest;
import com.aureliagrand.hotel.entity.Payment;
import com.aureliagrand.hotel.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@Tag(name = "Payments", description = "Endpoints for luxury folio payment processing, transaction records, and payment history")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @Operation(
            summary = "Get All Payments",
            description = "Retrieve transaction payment logs across the resort. **Access: Authenticated Users (ADMIN, STAFF)**",
            security = @SecurityRequirement(name = "BearerAuth")
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Payments history retrieved",
                    content = @Content(mediaType = "application/json", array = @ArraySchema(schema = @Schema(implementation = Payment.class)))),
            @ApiResponse(responseCode = "401", description = "Unauthorized: Missing or invalid JWT token",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error occurred",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    })
    @GetMapping
    public ResponseEntity<List<Payment>> getPayments() {
        return ResponseEntity.ok(paymentService.getPayments());
    }

    @Operation(
            summary = "Get Payment By ID",
            description = "Retrieve a specific payment transaction record by its numeric primary key ID. **Access: Authenticated Users**",
            security = @SecurityRequirement(name = "BearerAuth")
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Payment record found",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = Payment.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized: Missing or invalid JWT token",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Payment record not found with the requested ID",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error occurred",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    })
    @GetMapping("/{id}")
    public ResponseEntity<Payment> getPaymentById(
            @Parameter(description = "Numeric ID of the payment record", required = true, example = "1")
            @PathVariable Long id) {
        return ResponseEntity.ok(paymentService.getPaymentById(id));
    }

    @Operation(
            summary = "Process Payment",
            description = "Process a payment transaction against a reservation folio. Updates booking payment status and generates payment transaction reference. **Access: Authenticated Users**",
            security = @SecurityRequirement(name = "BearerAuth")
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Payment processed and confirmed successfully",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = Payment.class))),
            @ApiResponse(responseCode = "400", description = "Bad Request: Invalid payment amount or details",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized: Missing or invalid JWT token",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Associated booking not found",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error occurred",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PostMapping
    public ResponseEntity<Payment> processPayment(@Valid @RequestBody PaymentRequest request) {
        return new ResponseEntity<>(paymentService.processMockPayment(request), HttpStatus.CREATED);
    }
}
