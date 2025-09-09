package com.gradesave.backend.services;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;

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
        Subject existingSubject = subjectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Subject not found"));
        existingSubject.setName(subject.getName());
        existingSubject.setDescription(subject.getDescription());
        existingSubject.setLearningField(subject.isLearningField());
        return subjectRepository.save(existingSubject);
    }

    @Override
    public void deleteById(UUID id) {
        subjectRepository.deleteById(id);
    }

    @Override
    public boolean exists(UUID id) {
        return false;
    }

    @Override
    public long count() {
        return 0;
    }
}
