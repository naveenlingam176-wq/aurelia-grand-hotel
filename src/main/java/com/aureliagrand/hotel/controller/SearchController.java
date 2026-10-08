package com.aureliagrand.hotel.controller;

import com.aureliagrand.hotel.dto.ErrorResponse;
import com.aureliagrand.hotel.service.SearchService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/search")
@PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
@Tag(name = "Search", description = "Operational unified global search across rooms, suites, guest bookings, and reservations")
public class SearchController {

    private final SearchService searchService;

    public SearchController(SearchService searchService) {
        this.searchService = searchService;
    }

    @Operation(
            summary = "Global Operational Search",
            description = "Search across rooms, suites, guest accounts, and reservations with query keyword and category filters. **Access: ADMIN or STAFF only**",
            security = @SecurityRequirement(name = "BearerAuth")
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Search query processed and matching records returned"),
            @ApiResponse(responseCode = "401", description = "Unauthorized: Missing or invalid JWT token",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "Forbidden: Insufficient privileges (ADMIN or STAFF required)",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error occurred",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    })
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> search(
            @Parameter(description = "Search keyword query string (room number, guest name, confirmation code, etc.)", example = "Vance")
            @RequestParam(name = "q", required = false, defaultValue = "") String query,
            @Parameter(description = "Category to search within", example = "all", schema = @Schema(allowableValues = {"all", "rooms", "suites", "bookings", "halls"}))
            @RequestParam(name = "category", required = false, defaultValue = "all") String category) {
        return ResponseEntity.ok(searchService.executeSearch(query, category));
    }
}
