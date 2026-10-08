package com.aureliagrand.hotel.controller;

import com.aureliagrand.hotel.dto.BookingDto;
import com.aureliagrand.hotel.dto.BookingRequest;
import com.aureliagrand.hotel.dto.ErrorResponse;
import com.aureliagrand.hotel.service.BookingService;
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
@RequestMapping({"/api/bookings", "/api/booking", "/bookings"})
@Tag(name = "Bookings", description = "Endpoints for hotel reservations, luxury suite bookings, banquet hall reservations, and cancellations")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @Operation(
            summary = "Get Bookings",
            description = "Retrieve reservations. ADMIN and STAFF users receive all guest bookings across the resort; GUEST users receive only their own reservations. **Access: Authenticated Users**",
            security = @SecurityRequirement(name = "BearerAuth")
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Bookings retrieved successfully",
                    content = @Content(mediaType = "application/json", array = @ArraySchema(schema = @Schema(implementation = BookingDto.class)))),
            @ApiResponse(responseCode = "401", description = "Unauthorized: Missing or invalid JWT token",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error occurred",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    })
    @GetMapping({"", "/"})
    public ResponseEntity<List<BookingDto>> getBookings() {
        return ResponseEntity.ok(bookingService.getBookings());
    }

    @Operation(
            summary = "Get Booking By ID",
            description = "Retrieve detailed reservation folio by reference code (e.g. AG-2026-00124) or internal ID. **Access: Authenticated Users**",
            security = @SecurityRequirement(name = "BearerAuth")
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Booking found and returned",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = BookingDto.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized: Missing or invalid JWT token",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "Forbidden: Access denied to other guests' bookings",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Booking not found with the requested ID",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error occurred",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    })
    @GetMapping("/{id}")
    public ResponseEntity<BookingDto> getBookingById(
            @Parameter(description = "Booking reference code (e.g. AG-2026-00124) or internal ID", required = true, example = "AG-2026-00124")
            @PathVariable String id) {
        return ResponseEntity.ok(bookingService.getBookingById(id));
    }

    @Operation(
            summary = "Create Booking",
            description = "Create a new reservation for a luxury room, suite, or party hall. Calculates pricing, taxes, and generates folio confirmation code. **Access: Authenticated Users**",
            security = @SecurityRequirement(name = "BearerAuth")
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Booking successfully created",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = BookingDto.class))),
            @ApiResponse(responseCode = "400", description = "Bad Request: Dates are invalid or room not available",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized: Authentication required",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Room, suite, or party hall specified does not exist",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "409", description = "Conflict: Target accommodation already reserved for requested dates",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error occurred",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PostMapping({"", "/"})
    public ResponseEntity<BookingDto> createBooking(@Valid @RequestBody BookingRequest request) {
        return new ResponseEntity<>(bookingService.createBooking(request), HttpStatus.CREATED);
    }

    @Operation(
            summary = "Modify Booking",
            description = "Modify dates, guest counts, or special requests of an existing active reservation. **Access: Authenticated Users**",
            security = @SecurityRequirement(name = "BearerAuth")
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Booking successfully modified",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = BookingDto.class))),
            @ApiResponse(responseCode = "400", description = "Bad Request: Invalid update details",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized: Missing or invalid JWT token",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "Forbidden: Insufficient privileges",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Booking not found with the requested ID",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error occurred",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PutMapping("/{id}")
    public ResponseEntity<BookingDto> modifyBooking(
            @Parameter(description = "Booking reference code or numeric ID", required = true, example = "AG-2026-00124")
            @PathVariable String id,
            @RequestBody BookingRequest request) {
        return ResponseEntity.ok(bookingService.modifyBooking(id, request));
    }

    @Operation(
            summary = "Cancel Booking",
            description = "Cancel an existing reservation. Updates status to CANCELLED and marks accommodation available. **Access: Authenticated Users**",
            security = @SecurityRequirement(name = "BearerAuth")
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Booking successfully cancelled",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = BookingDto.class))),
            @ApiResponse(responseCode = "400", description = "Bad Request: Booking already completed or cancelled",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized: Missing or invalid JWT token",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "Forbidden: Access denied to cancel this booking",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Booking not found with the requested ID",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error occurred",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<BookingDto> cancelBooking(
            @Parameter(description = "Booking reference code or numeric ID", required = true, example = "AG-2026-00124")
            @PathVariable String id) {
        return ResponseEntity.ok(bookingService.cancelBooking(id));
    }
}
