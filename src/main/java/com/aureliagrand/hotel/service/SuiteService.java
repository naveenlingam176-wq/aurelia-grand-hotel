package com.aureliagrand.hotel.service;

import com.aureliagrand.hotel.entity.Suite;
import com.aureliagrand.hotel.exception.ConflictException;
import com.aureliagrand.hotel.exception.ResourceNotFoundException;
import com.aureliagrand.hotel.repository.SuiteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SuiteService {

    private final SuiteRepository suiteRepository;

    public SuiteService(SuiteRepository suiteRepository) {
        this.suiteRepository = suiteRepository;
    }

    public List<Suite> getAllSuites() {
        return suiteRepository.findAll();
    }

    public Suite getSuiteById(String id) {
        return suiteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Suite not found with ID: " + id));
    }

    @Transactional
    public Suite createSuite(Suite suite) {
        if (suiteRepository.existsById(suite.getId())) {
            throw new ConflictException("Suite with ID already exists: " + suite.getId());
        }
        return suiteRepository.save(suite);
    }

    @Transactional
    public Suite updateSuite(String id, Suite updatedSuite) {
        Suite suite = getSuiteById(id);

        if (updatedSuite.getSuiteName() != null) suite.setSuiteName(updatedSuite.getSuiteName());
        if (updatedSuite.getSuiteNumber() != null) suite.setSuiteNumber(updatedSuite.getSuiteNumber());
        if (updatedSuite.getDescription() != null) suite.setDescription(updatedSuite.getDescription());
        if (updatedSuite.getPrice() != null) suite.setPrice(updatedSuite.getPrice());
        if (updatedSuite.getCapacity() != null) suite.setCapacity(updatedSuite.getCapacity());
        if (updatedSuite.getAmenities() != null) suite.setAmenities(updatedSuite.getAmenities());
        if (updatedSuite.getImage() != null) suite.setImage(updatedSuite.getImage());
        if (updatedSuite.getStatus() != null) suite.setStatus(updatedSuite.getStatus());
        if (updatedSuite.getAvailable() != null) suite.setAvailable(updatedSuite.getAvailable());

        return suiteRepository.save(suite);
    }

    @Transactional
    public void deleteSuite(String id) {
        if (!suiteRepository.existsById(id)) {
            throw new ResourceNotFoundException("Suite not found with ID: " + id);
        }
        suiteRepository.deleteById(id);
    }
}
