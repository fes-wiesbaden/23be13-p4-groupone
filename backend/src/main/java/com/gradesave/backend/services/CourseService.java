package com.gradesave.backend.services;

import com.gradesave.backend.models.Course;
import com.gradesave.backend.dto.UpdateCourseRequest;
import com.gradesave.backend.models.User;
import com.gradesave.backend.repositories.CourseRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/*
 * @author: Noah Bach, Daniel Hess
 * <p>
 * Service for managing Course entities. Provides basic CRUD and query operations.
 * </p>
 * Updated by Daniel Hess
 */

@Service
@Transactional
public class CourseService {

    private final CourseRepository repo;
    private final UserService userService;

    public CourseService(CourseRepository repo, UserService userService) {
        this.repo = repo;
        this.userService = userService;
    }

    public Optional<Course> getByIdTest(UUID id) {
        return repo.findByIdTest(id);
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

        Optional<User> teacher = userService.getById(req.teacherId());
        if (teacher.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Teacher not found: " + req.teacherId());
        }

        existing.setCourseName(req.courseName());
        existing.setClassTeacher(teacher.get());

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
