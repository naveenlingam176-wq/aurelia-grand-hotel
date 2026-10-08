package com.aureliagrand.hotel.controller;

import com.aureliagrand.hotel.dto.DiningOrderRequest;
import com.aureliagrand.hotel.dto.ErrorResponse;
import com.aureliagrand.hotel.entity.DiningOrder;
import com.aureliagrand.hotel.entity.MenuItem;
import com.aureliagrand.hotel.entity.Restaurant;
import com.aureliagrand.hotel.service.RestaurantService;
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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/restaurants")
@Tag(name = "Dining", description = "Endpoints for gourmet dining venues, restaurant menus, and in-room dining orders")
public class RestaurantController {

    private final RestaurantService restaurantService;

    public RestaurantController(RestaurantService restaurantService) {
        this.restaurantService = restaurantService;
    }

    @Operation(
            summary = "Get All Restaurants",
            description = "Retrieve the list of resort restaurants, bistros, and lounge venues with cuisine types, hours, and ambiance. **Access: Public**",
            security = {}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "List of restaurants retrieved successfully",
                    content = @Content(mediaType = "application/json", array = @ArraySchema(schema = @Schema(implementation = Restaurant.class)))),
            @ApiResponse(responseCode = "500", description = "Internal server error occurred",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    })
    @GetMapping
    public ResponseEntity<List<Restaurant>> getAllRestaurants() {
        return ResponseEntity.ok(restaurantService.getAllRestaurants());
    }

    @Operation(
            summary = "Get Restaurant By ID",
            description = "Retrieve details and information for a specific restaurant venue by its numeric ID. **Access: Public**",
            security = {}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Restaurant found and returned",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = Restaurant.class))),
            @ApiResponse(responseCode = "404", description = "Restaurant not found with the specified ID",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error occurred",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    })
    @GetMapping("/{id}")
    public ResponseEntity<Restaurant> getRestaurantById(
            @Parameter(description = "Numeric ID of the restaurant", required = true, example = "1")
            @PathVariable Long id) {
        return ResponseEntity.ok(restaurantService.getRestaurantById(id));
    }

    @Operation(
            summary = "Create Restaurant Venue",
            description = "Add a new restaurant or dining venue to the resort directory. **Access: ADMIN only**",
            security = @SecurityRequirement(name = "BearerAuth")
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Restaurant successfully registered",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = Restaurant.class))),
            @ApiResponse(responseCode = "400", description = "Bad Request: Invalid restaurant payload",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized: Missing or invalid JWT token",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "Forbidden: Insufficient privileges (ADMIN required)",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error occurred",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Restaurant> createRestaurant(@RequestBody Restaurant restaurant) {
        return new ResponseEntity<>(restaurantService.createRestaurant(restaurant), HttpStatus.CREATED);
    }

    @Operation(
            summary = "Update Restaurant Venue",
            description = "Update cuisine specialties, operating hours, seating capacity, or images of a restaurant. **Access: ADMIN only**",
            security = @SecurityRequirement(name = "BearerAuth")
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Restaurant updated successfully",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = Restaurant.class))),
            @ApiResponse(responseCode = "400", description = "Bad Request: Invalid update parameters",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized: Missing or invalid JWT token",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "Forbidden: User lacks ADMIN role",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Restaurant not found with the requested ID",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error occurred",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Restaurant> updateRestaurant(
            @Parameter(description = "ID of the restaurant to update", required = true, example = "1")
            @PathVariable Long id,
            @RequestBody Restaurant restaurant) {
        return ResponseEntity.ok(restaurantService.updateRestaurant(id, restaurant));
    }

    @Operation(
            summary = "Delete Restaurant Venue",
            description = "Permanently remove a restaurant from the hotel dining roster. **Access: ADMIN only**",
            security = @SecurityRequirement(name = "BearerAuth")
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Restaurant successfully deleted (No Content)"),
            @ApiResponse(responseCode = "401", description = "Unauthorized: Missing or invalid JWT token",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "Forbidden: User lacks ADMIN role",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Restaurant not found with the requested ID",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error occurred",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    })
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteRestaurant(
            @Parameter(description = "ID of the restaurant to delete", required = true, example = "1")
            @PathVariable Long id) {
        restaurantService.deleteRestaurant(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(
            summary = "Get Restaurant Menu Items",
            description = "Retrieve all active culinary dishes, beverages, and pricing for a specific dining venue. **Access: Public**",
            security = {}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Menu items retrieved successfully",
                    content = @Content(mediaType = "application/json", array = @ArraySchema(schema = @Schema(implementation = MenuItem.class)))),
            @ApiResponse(responseCode = "404", description = "Restaurant not found with the specified ID",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error occurred",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    })
    @GetMapping("/{id}/menu")
    public ResponseEntity<List<MenuItem>> getMenuItems(
            @Parameter(description = "Restaurant ID", required = true, example = "1")
            @PathVariable Long id) {
        return ResponseEntity.ok(restaurantService.getMenuItems(id));
    }

    @Operation(
            summary = "Place Dining Order",
            description = "Place an in-room dining order or table reservation order at a restaurant venue. **Access: Authenticated Users**",
            security = @SecurityRequirement(name = "BearerAuth")
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Dining order successfully created and confirmed",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = DiningOrder.class))),
            @ApiResponse(responseCode = "400", description = "Bad Request: Invalid order details or items payload",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized: Missing or invalid JWT token",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Restaurant specified in order does not exist",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error occurred",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    })
    @PostMapping("/orders")
    public ResponseEntity<DiningOrder> createDiningOrder(@Valid @RequestBody DiningOrderRequest request) {
        return new ResponseEntity<>(restaurantService.createDiningOrder(request), HttpStatus.CREATED);
    }

    @Operation(
            summary = "Get Dining Orders",
            description = "Retrieve list of dining orders. ADMIN/STAFF see all orders resort-wide; GUEST sees their own room service orders. **Access: Authenticated Users**",
            security = @SecurityRequirement(name = "BearerAuth")
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Dining orders retrieved successfully",
                    content = @Content(mediaType = "application/json", array = @ArraySchema(schema = @Schema(implementation = DiningOrder.class)))),
            @ApiResponse(responseCode = "401", description = "Unauthorized: Missing or invalid JWT token",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error occurred",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
    })
    @GetMapping("/orders")
    public ResponseEntity<List<DiningOrder>> getDiningOrders() {
        return ResponseEntity.ok(restaurantService.getDiningOrders());
    }
}
