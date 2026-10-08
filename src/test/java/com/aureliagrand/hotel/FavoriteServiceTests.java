package com.aureliagrand.hotel;

import com.aureliagrand.hotel.dto.LoginRequest;
import com.aureliagrand.hotel.entity.Room;
import com.aureliagrand.hotel.service.AuthService;
import com.aureliagrand.hotel.service.FavoriteService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.access.AccessDeniedException;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class FavoriteServiceTests {

    @Autowired
    private FavoriteService favoriteService;

    @Autowired
    private AuthService authService;

    @Test
    void testGuestCanManageFavorites() {
        authService.login(new LoginRequest("user@aureliagrand.com", "UserPassword123!"));

        favoriteService.addFavorite("R-701");
        List<Room> favorites = favoriteService.getGuestFavorites();

        assertNotNull(favorites);
        assertTrue(favorites.stream().anyMatch(r -> "R-701".equals(r.getId())));

        favoriteService.removeFavorite("R-701");
        List<Room> afterRemoval = favoriteService.getGuestFavorites();
        assertFalse(afterRemoval.stream().anyMatch(r -> "R-701".equals(r.getId())));
    }

    @Test
    void testAdminCannotAccessFavorites() {
        authService.login(new LoginRequest("admin@aureliagrand.com", "AdminPassword123!"));
        assertThrows(AccessDeniedException.class, () -> favoriteService.getGuestFavorites());
    }
}
