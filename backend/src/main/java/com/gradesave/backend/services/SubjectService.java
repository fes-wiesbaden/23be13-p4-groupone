package com.gradesave.backend.services;

import com.gradesave.backend.models.Subject;
import com.gradesave.backend.repositories.SubjectRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * @author: Michael Holl
 * <p>
 *   Business logic for subjects
 * </p>
 *
 **/
@Service
public class SubjectService implements CrudService<Subject, Long>{
    private final SubjectRepository subjectRepository;

    public SubjectService(SubjectRepository subjectRepository) {
        this.subjectRepository = subjectRepository;
    }

    @Override
    public Subject create(Subject entity) {
        return null;
    }

    @Override
    public Optional<Subject> getById(Long aLong) {
        return Optional.empty();
    }

    @Override
    public List<Subject> getAll() {
        return subjectRepository.findAll();
    }

    @Override
    public Subject update(Long aLong, Subject entity) {
        return null;
    }

    @Override
    public void deleteById(Long aLong) {

    }

    @Override
    public boolean exists(Long aLong) {
        return false;
    }

    @Override
    public long count() {
        return 0;
    }
}
