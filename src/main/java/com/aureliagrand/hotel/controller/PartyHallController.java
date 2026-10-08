package com.aureliagrand.hotel.controller;

import com.aureliagrand.hotel.dto.ErrorResponse;
import com.aureliagrand.hotel.entity.PartyHall;
import com.aureliagrand.hotel.service.PartyHallService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/party-halls")
@Tag(name = "Party Halls", description = "Endpoints for banquet facilities, gala ballrooms, and event hall reservations and administration")
public class PartyHallController {

    private final PartyHallService partyHallService;

    public PartyHallController(PartyHallService partyHallService) {
        this.partyHallService = partyHallService;
    }

    @Operation(
            summary = "Get All Party Halls",
            description = "Browse all banquet, conference, and gala celebration halls with capacity, floor size, and pricing. **Access: Public**",
            security = {}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "List of party halls successfully retrieved",
                    content = @Content(mediaType = "application/json", array = @ArraySchema(schema = @Schema(implementation = PartyHall.class)))),
            @ApiResponse(responseCode = "500", description = "Internal server error occurred",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    })
    @GetMapping
    public ResponseEntity<List<PartyHall>> getAllPartyHalls() {
        return ResponseEntity.ok(partyHallService.getAllPartyHalls());
    }

    @Operation(
            summary = "Get Party Hall By ID",
            description = "Retrieve details and specs of a specific banquet or celebration hall by ID (e.g. HAL-001). **Access: Public**",
            security = {}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Party hall details found and returned",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = PartyHall.class))),
            @ApiResponse(responseCode = "404", description = "Party hall not found with the requested ID",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error occurred",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    })
    @GetMapping("/{id}")
    public ResponseEntity<PartyHall> getPartyHallById(
            @Parameter(description = "Unique alphanumeric Party Hall ID (e.g. HAL-001)", required = true, example = "HAL-001")
            @PathVariable String id) {
        return ResponseEntity.ok(partyHallService.getPartyHallById(id));
    }

    @Operation(
            summary = "Create Party Hall",
            description = "Register a new event hall or banquet venue in the hotel inventory. **Access: ADMIN only**",
            security = @SecurityRequirement(name = "BearerAuth")
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Party hall successfully created",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = PartyHall.class))),
            @ApiResponse(responseCode = "400", description = "Bad Request: Invalid party hall payload",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized: Missing or invalid JWT token",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "Forbidden: Insufficient privileges (ADMIN required)",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "409", description = "Conflict: Hall ID already exists",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error occurred",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PartyHall> createPartyHall(@RequestBody PartyHall partyHall) {
        return new ResponseEntity<>(partyHallService.createPartyHall(partyHall), HttpStatus.CREATED);
    }

    @Operation(
            summary = "Update Party Hall",
            description = "Update venue configuration, seating capacity, pricing, or images for an existing party hall. **Access: ADMIN only**",
            security = @SecurityRequirement(name = "BearerAuth")
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Party hall successfully updated",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = PartyHall.class))),
            @ApiResponse(responseCode = "400", description = "Bad Request: Invalid update parameters",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized: Missing or invalid JWT token",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "Forbidden: User lacks ADMIN role",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Party hall not found with the requested ID",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error occurred",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PartyHall> updatePartyHall(
            @Parameter(description = "ID of the party hall to update", required = true, example = "HAL-001")
            @PathVariable String id,
            @RequestBody PartyHall partyHall) {
        return ResponseEntity.ok(partyHallService.updatePartyHall(id, partyHall));
    }

    @Operation(
            summary = "Delete Party Hall",
            description = "Permanently remove a party hall from the hotel facility registry. **Access: ADMIN only**",
            security = @SecurityRequirement(name = "BearerAuth")
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Party hall successfully deleted (No Content)"),
            @ApiResponse(responseCode = "401", description = "Unauthorized: Missing or invalid JWT token",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "Forbidden: User lacks ADMIN role",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Party hall not found with the requested ID",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error occurred",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    })
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deletePartyHall(
            @Parameter(description = "ID of the party hall to delete", required = true, example = "HAL-001")
            @PathVariable String id) {
        partyHallService.deletePartyHall(id);
        return ResponseEntity.noContent().build();
    }
}
