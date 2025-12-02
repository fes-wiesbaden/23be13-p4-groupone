package com.gradesave.backend.services;

import com.gradesave.backend.models.Subject;
import com.gradesave.backend.repositories.SubjectRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

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
        return subjectRepository.findById(id);
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
    public boolean deleteIfExists(UUID uuid) {
        Optional<Subject> subject = this.getById(uuid);
        if (subject.isEmpty())
            return false;

        subjectRepository.delete(subject.get());

        return true;
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
