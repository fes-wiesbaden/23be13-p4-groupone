package com.gradesave.backend.services;

import com.gradesave.backend.models.Course;
import com.gradesave.backend.dto.UpdateCourseRequest;
import com.gradesave.backend.repositories.CourseRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class CourseService {

    private final CourseRepository repo;

    public CourseService(CourseRepository repo) {
        this.repo = repo;
    }

    public Course create(Course entity) {
        return repo.save(entity);
    }

    @Transactional(readOnly = true)
    public Optional<Course> getById(UUID id) {
        return repo.findById(id);
    }

    @Transactional(readOnly = true)
    public List<Course> getAll() {
        return repo.findAll();
    }

    public Course update(UUID id, UpdateCourseRequest req) {
        var existing = repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found: " + id));
        existing.setCourseName(req.courseName());
        if (req.teacherId() != null) {
            existing.setTeacherId(req.teacherId());
        }

        return repo.save(existing);
    }

    public void deleteById(UUID id) {
        if (!repo.existsById(id))
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found: " + id);
        repo.deleteById(id);
    }

    @Transactional(readOnly = true)
    public boolean exists(UUID id) {
        return repo.existsById(id);
    }

    @Transactional(readOnly = true)
    public long count() {
        return repo.count();
    }
}
