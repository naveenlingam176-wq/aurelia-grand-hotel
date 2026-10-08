package com.aureliagrand.hotel.repository;

import com.aureliagrand.hotel.entity.Favorite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, Long> {

    List<Favorite> findByGuest_IdOrderByCreatedAtDesc(Long guestId);

    Optional<Favorite> findByGuest_IdAndRoom_Id(Long guestId, String roomId);

    boolean existsByGuest_IdAndRoom_Id(Long guestId, String roomId);

    void deleteByGuest_IdAndRoom_Id(Long guestId, String roomId);
}
