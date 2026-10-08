package com.aureliagrand.hotel.repository;

import com.aureliagrand.hotel.entity.PartyHall;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PartyHallRepository extends JpaRepository<PartyHall, String> {

    List<PartyHall> findByAvailable(Boolean available);

    List<PartyHall> findByStatusIgnoreCase(String status);

    @Query("SELECT h FROM PartyHall h WHERE " +
           "LOWER(h.id) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(h.hallName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(h.hallType) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<PartyHall> searchPartyHalls(@Param("query") String query);
}
