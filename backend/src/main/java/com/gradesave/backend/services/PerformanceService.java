package com.gradesave.backend.services;

import com.gradesave.backend.models.Performance;
import com.gradesave.backend.repositories.PerformanceRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * @author: Michael Holl
 * <p>
 *   Business logic for performances
 * </p>
 *
 **/

@Service
@Transactional
public class PerformanceService implements CrudService<Performance, UUID> {

    private final PerformanceRepository performanceRepository;

    public PerformanceService(PerformanceRepository performanceRepository) {
        this.performanceRepository = performanceRepository;
    }

    @Override
    public Performance create(Performance entity) {
        return performanceRepository.save(entity);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Performance> getById(UUID id) {
        return performanceRepository.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Performance> getAll() {
        return performanceRepository.findAll();
    }

    @Override
    public Performance update(UUID id, Performance patch) {
        Performance existing = performanceRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Performance not found: " + id
                ));


        if (patch.getName() != null) {
            existing.setName(patch.getName());
        } else {
            existing.setName(null);
        }

        if (patch.getShortName() != null) {
            existing.setShortName(patch.getShortName());
        } else {
            existing.setShortName(null);
        }

        if (patch.getWeight() != null) {
            existing.setWeight(patch.getWeight());
        } else {
            existing.setWeight(null);
        }

        existing.setAssignedTeacher(patch.getAssignedTeacher());

        return performanceRepository.save(existing);
    }

    @Override
    public void deleteById(UUID id) {
        if (!performanceRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Performance not found: " + id);
        }
        performanceRepository.deleteById(id);
    }

    @Override
    public boolean deleteIfExists(UUID uuid) {
        Optional<Performance> performanceOpt = this.getById(uuid);
        if (performanceOpt.isEmpty())
            return false;

        performanceRepository.delete(performanceOpt.get());

        return true;
    }

    @Override
    @Transactional(readOnly = true)
    public boolean exists(UUID id) {
        return performanceRepository.existsById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public long count() {
        return performanceRepository.count();
    }

    public Optional<Performance> findById(UUID performanceId) {
        return performanceRepository.findById(performanceId);
    }

}
