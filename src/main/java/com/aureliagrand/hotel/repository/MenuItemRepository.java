package com.aureliagrand.hotel.repository;

import com.aureliagrand.hotel.entity.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {

    List<MenuItem> findByRestaurant_IdAndAvailable(Long restaurantId, Boolean available);
}
