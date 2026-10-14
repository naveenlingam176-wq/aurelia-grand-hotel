package com.aureliagrand.hotel.repository;

import com.aureliagrand.hotel.entity.AccountStatus;
import com.aureliagrand.hotel.entity.Role;
import com.aureliagrand.hotel.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    List<User> findByRole(Role role);

    List<User> findByRoleAndStatus(Role role, AccountStatus status);

    List<User> findByRoleOrderByCreatedAtDesc(Role role);

    @Query("SELECT u FROM User u WHERE " +
           "LOWER(u.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(u.email) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "(u.phone IS NOT NULL AND LOWER(u.phone) LIKE LOWER(CONCAT('%', :query, '%'))) OR " +
           "CAST(u.id AS string) LIKE CONCAT('%', :query, '%') OR " +
           "LOWER(CONCAT('gst-', CAST(u.id AS string))) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<User> searchUsers(@Param("query") String query);

    @Query("SELECT u FROM User u WHERE LOWER(u.name) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<User> searchUsersByName(@Param("query") String query);

    @Query("SELECT u FROM User u WHERE " +
           "LOWER(u.email) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "(u.phone IS NOT NULL AND LOWER(u.phone) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<User> searchUsersByContact(@Param("query") String query);

    @Query("SELECT u FROM User u WHERE " +
           "CAST(u.id AS string) LIKE CONCAT('%', :query, '%') OR " +
           "LOWER(CONCAT('gst-', CAST(u.id AS string))) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<User> searchUsersByGuestId(@Param("query") String query);
}
