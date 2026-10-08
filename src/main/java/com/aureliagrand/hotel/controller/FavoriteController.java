package com.aureliagrand.hotel.controller;

import com.aureliagrand.hotel.dto.ErrorResponse;
import com.aureliagrand.hotel.entity.Room;
import com.aureliagrand.hotel.service.FavoriteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/favorites")
@PreAuthorize("hasRole('GUEST')")
@Tag(name = "Favorites", description = "Endpoints for guest wishlist, favorite luxury rooms, and accommodation bookmarks")
public class FavoriteController {

    private final FavoriteService favoriteService;

    public FavoriteController(FavoriteService favoriteService) {
        this.favoriteService = favoriteService;
    }

    @Operation(
            summary = "Get Guest Favorite Rooms",
            description = "Retrieve the full Room entity details for all rooms saved to the current guest's wishlist. **Access: GUEST only**",
            security = @SecurityRequirement(name = "BearerAuth")
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "List of favorite rooms retrieved",
                    content = @Content(mediaType = "application/json", array = @ArraySchema(schema = @Schema(implementation = Room.class)))),
            @ApiResponse(responseCode = "401", description = "Unauthorized: Missing or invalid JWT token",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "Forbidden: Requires GUEST role",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error occurred",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    })
    @GetMapping
    public ResponseEntity<List<Room>> getFavorites() {
        return ResponseEntity.ok(favoriteService.getGuestFavorites());
    }

    @Operation(
            summary = "Get Favorite Room IDs",
            description = "Retrieve an array of Room IDs bookmarked by the current guest for quick UI badge rendering. **Access: GUEST only**",
            security = @SecurityRequirement(name = "BearerAuth")
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "List of room ID strings returned",
                    content = @Content(mediaType = "application/json", array = @ArraySchema(schema = @Schema(type = "string", example = "RM-101")))),
            @ApiResponse(responseCode = "401", description = "Unauthorized: Missing or invalid JWT token",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "Forbidden: User is not a GUEST",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error occurred",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    })
    @GetMapping("/ids")
    public ResponseEntity<List<String>> getFavoriteRoomIds() {
        return ResponseEntity.ok(favoriteService.getGuestFavoriteRoomIds());
    }

    @Operation(
            summary = "Add Room To Favorites",
            description = "Bookmark a room by providing its ID in the JSON body. **Access: GUEST only**",
            security = @SecurityRequirement(name = "BearerAuth")
    )
    @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "JSON payload containing the roomId to bookmark",
            content = @Content(
                    mediaType = "application/json",
                    examples = @ExampleObject(value = "{\n  \"roomId\": \"RM-101\"\n}")
            )
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Room successfully added to favorites"),
            @ApiResponse(responseCode = "400", description = "Bad Request: roomId parameter missing or blank",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized: Missing or invalid JWT token",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "Forbidden: User is not a GUEST",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Room not found with the requested ID",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error occurred",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PostMapping
    public ResponseEntity<Map<String, Object>> addFavorite(@RequestBody Map<String, String> body) {
        String roomId = body.get("roomId");
        if (roomId == null || roomId.isBlank()) {
            roomId = body.get("id");
        }
        favoriteService.addFavorite(roomId);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Room added to favorites");
        response.put("roomId", roomId);
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Remove Room From Favorites",
            description = "Remove a room from the guest's saved favorites list by room ID path variable. **Access: GUEST only**",
            security = @SecurityRequirement(name = "BearerAuth")
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Room successfully removed from favorites"),
            @ApiResponse(responseCode = "401", description = "Unauthorized: Missing or invalid JWT token",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "Forbidden: User is not a GUEST",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error occurred",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    })
    @DeleteMapping("/{roomId}")
    public ResponseEntity<Map<String, Object>> removeFavorite(
            @Parameter(description = "ID of the room to remove from favorites", required = true, example = "RM-101")
            @PathVariable String roomId) {
        favoriteService.removeFavorite(roomId);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Room removed from favorites");
        response.put("roomId", roomId);
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Toggle Room Favorite Status",
            description = "Convenient toggle endpoint: adds the room if not already favorited, or removes it if already present. Returns new isFavorite state. **Access: GUEST only**",
            security = @SecurityRequirement(name = "BearerAuth")
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Room favorite state toggled successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized: Missing or invalid JWT token",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "Forbidden: User is not a GUEST",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Room not found with the requested ID",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error occurred",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PostMapping("/toggle/{roomId}")
    public ResponseEntity<Map<String, Object>> toggleFavorite(
            @Parameter(description = "ID of the room to toggle favorite status for", required = true, example = "RM-101")
            @PathVariable String roomId) {
        boolean isFav = favoriteService.toggleFavorite(roomId);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("isFavorite", isFav);
        response.put("roomId", roomId);
        response.put("message", isFav ? "Room added to favorites" : "Room removed from favorites");
        return ResponseEntity.ok(response);
    }
}
