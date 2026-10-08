package com.aureliagrand.hotel.service;

import com.aureliagrand.hotel.dto.DiningOrderRequest;
import com.aureliagrand.hotel.entity.DiningOrder;
import com.aureliagrand.hotel.entity.MenuItem;
import com.aureliagrand.hotel.entity.Restaurant;
import com.aureliagrand.hotel.entity.Role;
import com.aureliagrand.hotel.entity.User;
import com.aureliagrand.hotel.exception.ResourceNotFoundException;
import com.aureliagrand.hotel.repository.DiningOrderRepository;
import com.aureliagrand.hotel.repository.MenuItemRepository;
import com.aureliagrand.hotel.repository.RestaurantRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class RestaurantService {

    private final RestaurantRepository restaurantRepository;
    private final MenuItemRepository menuItemRepository;
    private final DiningOrderRepository diningOrderRepository;
    private final AuthService authService;

    public RestaurantService(RestaurantRepository restaurantRepository,
                             MenuItemRepository menuItemRepository,
                             DiningOrderRepository diningOrderRepository,
                             AuthService authService) {
        this.restaurantRepository = restaurantRepository;
        this.menuItemRepository = menuItemRepository;
        this.diningOrderRepository = diningOrderRepository;
        this.authService = authService;
    }

    public List<Restaurant> getAllRestaurants() {
        return restaurantRepository.findAll();
    }

    public Restaurant getRestaurantById(Long id) {
        return restaurantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found: " + id));
    }

    @Transactional
    public Restaurant createRestaurant(Restaurant restaurant) {
        return restaurantRepository.save(restaurant);
    }

    @Transactional
    public Restaurant updateRestaurant(Long id, Restaurant updated) {
        Restaurant restaurant = getRestaurantById(id);
        if (updated.getName() != null) restaurant.setName(updated.getName());
        if (updated.getCuisine() != null) restaurant.setCuisine(updated.getCuisine());
        if (updated.getDescription() != null) restaurant.setDescription(updated.getDescription());
        if (updated.getImage() != null) restaurant.setImage(updated.getImage());
        if (updated.getOpeningHours() != null) restaurant.setOpeningHours(updated.getOpeningHours());
        if (updated.getActive() != null) restaurant.setActive(updated.getActive());
        return restaurantRepository.save(restaurant);
    }

    @Transactional
    public void deleteRestaurant(Long id) {
        if (!restaurantRepository.existsById(id)) {
            throw new ResourceNotFoundException("Restaurant not found: " + id);
        }
        restaurantRepository.deleteById(id);
    }

    public List<MenuItem> getMenuItems(Long restaurantId) {
        return menuItemRepository.findByRestaurant_IdAndAvailable(restaurantId, true);
    }

    @Transactional
    public DiningOrder createDiningOrder(DiningOrderRequest request) {
        User currentUser = authService.getCurrentAuthenticatedUser();
        Restaurant restaurant = getRestaurantById(request.getRestaurantId());

        DiningOrder order = new DiningOrder();
        order.setOrderReference("DINE-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        order.setGuest(currentUser);
        order.setRestaurant(restaurant);
        order.setOrderDate(request.getOrderDate());
        order.setTableNumber(request.getTableNumber());
        order.setSuiteDelivery(request.getSuiteDelivery());
        order.setPartySize(request.getPartySize() != null ? request.getPartySize() : 2);
        order.setTotalAmount(request.getTotalAmount() != null ? request.getTotalAmount() : 0.0);
        order.setCurrency(request.getCurrency() != null ? request.getCurrency() : currentUser.getCurrency());
        order.setSpecialRequests(request.getSpecialRequests());
        order.setItemsJson(request.getItemsJson());
        order.setStatus("CONFIRMED");

        return diningOrderRepository.save(order);
    }

    public List<DiningOrder> getDiningOrders() {
        User currentUser = authService.getCurrentAuthenticatedUser();
        if (currentUser.getRole() == Role.GUEST) {
            return diningOrderRepository.findByGuest_IdOrderByCreatedAtDesc(currentUser.getId());
        }
        return diningOrderRepository.findAll();
    }
}
