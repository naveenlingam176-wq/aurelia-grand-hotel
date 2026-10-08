package com.aureliagrand.hotel.service;

import com.aureliagrand.hotel.entity.Favorite;
import com.aureliagrand.hotel.entity.Role;
import com.aureliagrand.hotel.entity.Room;
import com.aureliagrand.hotel.entity.User;
import com.aureliagrand.hotel.exception.ResourceNotFoundException;
import com.aureliagrand.hotel.repository.FavoriteRepository;
import com.aureliagrand.hotel.repository.RoomRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final RoomRepository roomRepository;
    private final AuthService authService;

    public FavoriteService(FavoriteRepository favoriteRepository,
                           RoomRepository roomRepository,
                           AuthService authService) {
        this.favoriteRepository = favoriteRepository;
        this.roomRepository = roomRepository;
        this.authService = authService;
    }

    public List<Room> getGuestFavorites() {
        User currentUser = validateGuestOnly();
        List<Favorite> favorites = favoriteRepository.findByGuest_IdOrderByCreatedAtDesc(currentUser.getId());
        return favorites.stream().map(Favorite::getRoom).collect(Collectors.toList());
    }

    public List<String> getGuestFavoriteRoomIds() {
        User currentUser = validateGuestOnly();
        List<Favorite> favorites = favoriteRepository.findByGuest_IdOrderByCreatedAtDesc(currentUser.getId());
        return favorites.stream().map(f -> f.getRoom().getId()).collect(Collectors.toList());
    }

    @Transactional
    public void addFavorite(String roomId) {
        User currentUser = validateGuestOnly();
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found: " + roomId));

        if (!favoriteRepository.existsByGuest_IdAndRoom_Id(currentUser.getId(), roomId)) {
            Favorite favorite = new Favorite(currentUser, room);
            favoriteRepository.save(favorite);
        }
    }

    @Transactional
    public void removeFavorite(String roomId) {
        User currentUser = validateGuestOnly();
        favoriteRepository.deleteByGuest_IdAndRoom_Id(currentUser.getId(), roomId);
    }

    @Transactional
    public boolean toggleFavorite(String roomId) {
        User currentUser = validateGuestOnly();
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found: " + roomId));
        if (favoriteRepository.existsByGuest_IdAndRoom_Id(currentUser.getId(), roomId)) {
            favoriteRepository.deleteByGuest_IdAndRoom_Id(currentUser.getId(), roomId);
            return false;
        } else {
            Favorite favorite = new Favorite(currentUser, room);
            favoriteRepository.save(favorite);
            return true;
        }
    }

    private User validateGuestOnly() {
        User user = authService.getCurrentAuthenticatedUser();
        if (user.getRole() != Role.GUEST) {
            throw new AccessDeniedException("Favorites feature is exclusively available for Guests");
        }
        return user;
    }
}
