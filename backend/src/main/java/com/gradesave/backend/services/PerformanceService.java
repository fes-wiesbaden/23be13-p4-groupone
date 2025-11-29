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

    private final PerformanceRepository repo;

    public PerformanceService(PerformanceRepository repo) {
        this.repo = repo;
    }

    @Override
    public Performance create(Performance entity) {
        return repo.save(entity);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Performance> getById(UUID id) {
        return repo.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Performance> getAll() {
        return repo.findAll();
    }

    @Override
    public Performance update(UUID id, Performance patch) {
        Performance existing = repo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Performance not found: " + id));
        existing.setName(patch.getName());
        existing.setShortName(patch.getShortName());
        existing.setWeight(patch.getWeight());
        return repo.save(existing);
    }

    @Override
    public void deleteById(UUID id) {
        if (!repo.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found: " + id);
        }
        repo.deleteById(id);
    }

    @Override
    public boolean deleteIfExists(UUID uuid) {
        return false;
    }

    @Override
    @Transactional(readOnly = true)
    public boolean exists(UUID id) {
        return repo.existsById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public long count() {
        return repo.count();
    }
}
