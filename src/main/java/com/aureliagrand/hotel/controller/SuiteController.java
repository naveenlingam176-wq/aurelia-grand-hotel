package com.aureliagrand.hotel.controller;

import com.aureliagrand.hotel.dto.ErrorResponse;
import com.aureliagrand.hotel.entity.Suite;
import com.aureliagrand.hotel.service.SuiteService;
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
@RequestMapping("/api/suites")
@Tag(name = "Suites", description = "Endpoints for luxury suite accommodations, presidential suites, and administrative management")
public class SuiteController {

    private final SuiteService suiteService;

    public SuiteController(SuiteService suiteService) {
        this.suiteService = suiteService;
    }

    @Operation(
            summary = "Get All Suites",
            description = "Retrieve the complete catalog of luxury and presidential suites, including amenities, capacity, and current availability. **Access: Public**",
            security = {}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "List of suites successfully retrieved",
                    content = @Content(mediaType = "application/json", array = @ArraySchema(schema = @Schema(implementation = Suite.class)))),
            @ApiResponse(responseCode = "500", description = "Internal server error occurred",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    })
    @GetMapping
    public ResponseEntity<List<Suite>> getAllSuites() {
        return ResponseEntity.ok(suiteService.getAllSuites());
    }

    @Operation(
            summary = "Get Suite By ID",
            description = "Retrieve comprehensive details of a specific luxury suite by its ID (e.g. STE-301). **Access: Public**",
            security = {}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Suite details found and returned",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = Suite.class))),
            @ApiResponse(responseCode = "404", description = "Suite not found with the requested ID",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error occurred",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    })
    @GetMapping("/{id}")
    public ResponseEntity<Suite> getSuiteById(
            @Parameter(description = "Unique alphanumeric Suite ID (e.g. STE-301)", required = true, example = "STE-301")
            @PathVariable String id) {
        return ResponseEntity.ok(suiteService.getSuiteById(id));
    }

    @Operation(
            summary = "Create Suite",
            description = "Add a new luxury suite to the hotel inventory. **Access: ADMIN only**",
            security = @SecurityRequirement(name = "BearerAuth")
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Suite successfully created",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = Suite.class))),
            @ApiResponse(responseCode = "400", description = "Bad Request: Invalid suite payload",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized: Missing or invalid JWT token",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "Forbidden: Insufficient privileges (ADMIN required)",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "409", description = "Conflict: Suite ID or number already exists",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error occurred",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Suite> createSuite(@RequestBody Suite suite) {
        return new ResponseEntity<>(suiteService.createSuite(suite), HttpStatus.CREATED);
    }

    @Operation(
            summary = "Update Suite",
            description = "Update configuration, pricing, capacity, amenities, or images of an existing suite. **Access: ADMIN only**",
            security = @SecurityRequirement(name = "BearerAuth")
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Suite successfully updated",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = Suite.class))),
            @ApiResponse(responseCode = "400", description = "Bad Request: Invalid update parameters",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized: Missing or invalid JWT token",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "Forbidden: User lacks ADMIN role",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Suite not found with the requested ID",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error occurred",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Suite> updateSuite(
            @Parameter(description = "ID of the suite to update", required = true, example = "STE-301")
            @PathVariable String id,
            @RequestBody Suite suite) {
        return ResponseEntity.ok(suiteService.updateSuite(id, suite));
    }

    @Operation(
            summary = "Delete Suite",
            description = "Permanently remove a suite from the system. **Access: ADMIN only**",
            security = @SecurityRequirement(name = "BearerAuth")
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Suite successfully deleted (No Content)"),
            @ApiResponse(responseCode = "401", description = "Unauthorized: Missing or invalid JWT token",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "Forbidden: User lacks ADMIN role",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Suite not found with the requested ID",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error occurred",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    })
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteSuite(
            @Parameter(description = "ID of the suite to delete", required = true, example = "STE-301")
            @PathVariable String id) {
        suiteService.deleteSuite(id);
        return ResponseEntity.noContent().build();
    }
}
