package com.gradesave.backend.services;

import com.gradesave.backend.models.Course;
import com.gradesave.backend.repositories.CourseRepository;

import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public class CourseService implements CrudService<Course, UUID> {

    private final CourseRepository repo;

    public CourseService(CourseRepository repo) {
        this.repo = repo;
    }

    @Override
    public Course create(Course entity) {
        return null;
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Course> getById(UUID id) {
        return repo.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Course> getAll() {
        return repo.findAll();
    }

    @Override
    public Course update(UUID id, Course patch) {
        var existing = repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found: " + id));
        existing.setCourseName(patch.getCourseName());

        return repo.save(existing);
    }

    @Override
    public void deleteById(UUID id) {
        if (!repo.existsById(id)) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found: " + id);
        repo.deleteById(id);
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
