package com.aureliagrand.hotel.repository;

import com.aureliagrand.hotel.entity.Suite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SuiteRepository extends JpaRepository<Suite, String> {

    List<Suite> findByAvailable(Boolean available);

    java.util.Optional<Suite> findBySuiteNumber(String suiteNumber);

    @Query("SELECT s FROM Suite s WHERE " +
           "LOWER(s.id) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(s.suiteName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(s.suiteNumber) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Suite> searchSuites(@Param("query") String query);
}
