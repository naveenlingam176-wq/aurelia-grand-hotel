package com.aureliagrand.hotel.service;

import com.aureliagrand.hotel.entity.PartyHall;
import com.aureliagrand.hotel.exception.ConflictException;
import com.aureliagrand.hotel.exception.ResourceNotFoundException;
import com.aureliagrand.hotel.repository.PartyHallRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PartyHallService {

    private final PartyHallRepository partyHallRepository;

    public PartyHallService(PartyHallRepository partyHallRepository) {
        this.partyHallRepository = partyHallRepository;
    }

    public List<PartyHall> getAllPartyHalls() {
        return partyHallRepository.findAll();
    }

    public PartyHall getPartyHallById(String id) {
        return partyHallRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Party Hall not found with ID: " + id));
    }

    @Transactional
    public PartyHall createPartyHall(PartyHall partyHall) {
        if (partyHallRepository.existsById(partyHall.getId())) {
            throw new ConflictException("Party Hall with ID already exists: " + partyHall.getId());
        }
        return partyHallRepository.save(partyHall);
    }

    @Transactional
    public PartyHall updatePartyHall(String id, PartyHall updated) {
        PartyHall hall = getPartyHallById(id);

        if (updated.getHallName() != null) hall.setHallName(updated.getHallName());
        if (updated.getHallType() != null) hall.setHallType(updated.getHallType());
        if (updated.getDescription() != null) hall.setDescription(updated.getDescription());
        if (updated.getCapacity() != null) hall.setCapacity(updated.getCapacity());
        if (updated.getPrice() != null) hall.setPrice(updated.getPrice());
        if (updated.getSize() != null) hall.setSize(updated.getSize());
        if (updated.getFloor() != null) hall.setFloor(updated.getFloor());
        if (updated.getImage() != null) hall.setImage(updated.getImage());
        if (updated.getAmenities() != null) hall.setAmenities(updated.getAmenities());
        if (updated.getSuitableFor() != null) hall.setSuitableFor(updated.getSuitableFor());
        if (updated.getStatus() != null) hall.setStatus(updated.getStatus());
        if (updated.getAvailable() != null) hall.setAvailable(updated.getAvailable());

        return partyHallRepository.save(hall);
    }

    @Transactional
    public void deletePartyHall(String id) {
        if (!partyHallRepository.existsById(id)) {
            throw new ResourceNotFoundException("Party Hall not found with ID: " + id);
        }
        partyHallRepository.deleteById(id);
    }
}
