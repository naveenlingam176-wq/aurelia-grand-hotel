package com.aureliagrand.hotel.repository;

import com.aureliagrand.hotel.entity.DiningOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DiningOrderRepository extends JpaRepository<DiningOrder, Long> {

    List<DiningOrder> findByGuest_IdOrderByCreatedAtDesc(Long guestId);

    Optional<DiningOrder> findByOrderReference(String orderReference);
}
