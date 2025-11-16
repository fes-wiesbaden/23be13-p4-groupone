package com.gradesave.backend.services;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gradesave.backend.models.Subject;
import com.gradesave.backend.repositories.SubjectRepository;

/**
 * @author: Michael Holl
 * <p>
 * Business logic for subjects
 * </p>
 *
 *
 */
@Service
public class SubjectService implements CrudService<Subject, UUID> {

    private final SubjectRepository subjectRepository;

    public SubjectService(SubjectRepository subjectRepository) {
        this.subjectRepository = subjectRepository;
    }

    @Override
    public Subject create(Subject subject) {
        return subjectRepository.save(subject);
    }

    @Override
    public Optional<Subject> getById(UUID id) {
        return Optional.empty();
    }

    @Override
    public List<Subject> getAll() {
        return subjectRepository.findAll();
    }

    @Override
    public Subject update(UUID id, Subject subject) {
        if (!exists(id)) {
            throw new IllegalArgumentException("Subject with id " + id + " does not exist");
        }
        return subjectRepository.save(subject);
    }

    @Override
    public void deleteById(UUID id) {
        subjectRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean exists(UUID id) {
        return subjectRepository.existsById(id);
    }

    @Override
    public long count() {
        return 0;
    }
}
