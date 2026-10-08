package com.aureliagrand.hotel.controller;

import com.aureliagrand.hotel.dto.ErrorResponse;
import com.aureliagrand.hotel.entity.Room;
import com.aureliagrand.hotel.service.RoomService;
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
@RequestMapping("/api/rooms")
@Tag(name = "Rooms", description = "Endpoints for browsing room inventory, detailed room specifications, and administrative management")
public class RoomController {

    private final RoomService roomService;

    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    @Operation(
            summary = "Get All Rooms",
            description = "Retrieve the complete catalog of luxury hotel rooms with amenities, pricing, floor levels, and real-time availability. **Access: Public**",
            security = {}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "List of rooms successfully retrieved",
                    content = @Content(mediaType = "application/json", array = @ArraySchema(schema = @Schema(implementation = Room.class)))),
            @ApiResponse(responseCode = "500", description = "Internal server error occurred",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    })
    @GetMapping
    public ResponseEntity<List<Room>> getAllRooms() {
        return ResponseEntity.ok(roomService.getAllRooms());
    }

    @Operation(
            summary = "Get Room By ID",
            description = "Retrieve full details and specifications of a specific room by its unique alphanumeric ID (e.g. RM-101). **Access: Public**",
            security = {}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Room details found and returned",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = Room.class))),
            @ApiResponse(responseCode = "404", description = "Room not found with the requested ID",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error occurred",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    })
    @GetMapping("/{id}")
    public ResponseEntity<Room> getRoomById(
            @Parameter(description = "Unique alphanumeric Room ID (e.g. RM-101)", required = true, example = "RM-101")
            @PathVariable String id) {
        return ResponseEntity.ok(roomService.getRoomById(id));
    }

    @Operation(
            summary = "Create Room",
            description = "Provision and configure a new luxury room in the hotel inventory. **Access: ADMIN only**",
            security = @SecurityRequirement(name = "BearerAuth")
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Room successfully created",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = Room.class))),
            @ApiResponse(responseCode = "400", description = "Bad Request: Invalid room payload",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized: Missing or invalid JWT token",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "Forbidden: User lacks ADMIN role",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "409", description = "Conflict: Room with specified ID or number already exists",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error occurred",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Room> createRoom(@RequestBody Room room) {
        return new ResponseEntity<>(roomService.createRoom(room), HttpStatus.CREATED);
    }

    @Operation(
            summary = "Update Room",
            description = "Update configuration, pricing, capacity, amenities, or image assets for an existing room. **Access: ADMIN only**",
            security = @SecurityRequirement(name = "BearerAuth")
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Room successfully updated",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = Room.class))),
            @ApiResponse(responseCode = "400", description = "Bad Request: Invalid update parameters",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized: Missing or invalid JWT token",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "Forbidden: Requires ADMIN privilege",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Room not found with the requested ID",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error occurred",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Room> updateRoom(
            @Parameter(description = "ID of the room to update", required = true, example = "RM-101")
            @PathVariable String id,
            @RequestBody Room room) {
        return ResponseEntity.ok(roomService.updateRoom(id, room));
    }

    @Operation(
            summary = "Delete Room",
            description = "Permanently remove a room from the inventory system. **Access: ADMIN only**",
            security = @SecurityRequirement(name = "BearerAuth")
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Room successfully deleted (No Content)"),
            @ApiResponse(responseCode = "401", description = "Unauthorized: Missing or invalid JWT token",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "Forbidden: Insufficient privileges (ADMIN required)",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Room not found with the requested ID",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error occurred",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    })
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteRoom(
            @Parameter(description = "ID of the room to delete", required = true, example = "RM-101")
            @PathVariable String id) {
        roomService.deleteRoom(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(
            summary = "Update Room Status",
            description = "Update room occupancy or maintenance state (e.g. available, occupied, cleaning, maintenance). If status query parameter is omitted, toggles between available and occupied. **Access: ADMIN or STAFF**",
            security = @SecurityRequirement(name = "BearerAuth")
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Room status successfully updated",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = Room.class))),
            @ApiResponse(responseCode = "400", description = "Bad Request: Invalid status value",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized: Missing or invalid JWT token",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "Forbidden: User lacks ADMIN or STAFF role",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Room not found with the requested ID",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error occurred",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<Room> updateRoomStatus(
            @Parameter(description = "Target room ID", required = true, example = "RM-101")
            @PathVariable String id,
            @Parameter(description = "New room status (e.g. available, occupied, maintenance, cleaning). Leave empty to toggle.", example = "occupied")
            @RequestParam(required = false) String status) {
        if (status != null && !status.isBlank()) {
            Room room = roomService.getRoomById(id);
            room.setStatus(status.trim().toLowerCase());
            return ResponseEntity.ok(roomService.updateRoom(id, room));
        }
        return ResponseEntity.ok(roomService.toggleRoomStatus(id));
    }
}
