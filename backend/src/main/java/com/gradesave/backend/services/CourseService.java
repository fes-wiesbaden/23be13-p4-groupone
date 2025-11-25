package com.gradesave.backend.services;

import com.gradesave.backend.models.Course;
import com.gradesave.backend.dto.UpdateCourseRequest;
import com.gradesave.backend.models.User;
import com.gradesave.backend.repositories.CourseRepository;

import com.gradesave.backend.repositories.UserRepository;
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
    private final UserRepository userRepo;

    public CourseService(CourseRepository repo, UserRepository userRepo) {
        this.repo = repo;
        this.userRepo = userRepo;
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

        Optional<User> teacher = userRepo.findById(req.teacherId());
        if (teacher.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Teacher not found: " + req.teacherId());
        }

        existing.setCourseName(req.courseName());
        existing.setClassTeacher(teacher.get());

        return repo.save(existing);
    }

    public boolean addStudent(Course course, User student) {
        if (!userRepo.existsById(student.getId())) return false;
        if (!repo.existsById(course.getId())) return false;

        course.getUsers().add(student);
        return true;
    }

    public void deleteById(UUID id) {
        if (!repo.existsById(id))
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found: " + id);
        repo.deleteById(id);
    }

    public Optional<Course> getByName(String name) {
        return repo.findByCourseName(name);
    }

    @Transactional(readOnly = true)
    public boolean exists(UUID id) {
        return repo.existsById(id);
    }

    @Transactional(readOnly = true)
    public long count() {
        return repo.count();
    }

    public boolean removeUserFromAllCourses(UUID userId) {
        Optional<User> userTemp = userRepo.findById(userId);
        if (userTemp.isEmpty()) return false;

        User user = userTemp.get();
        List<Course> courses = repo.findAllByUserId(userId);

        boolean removed = true;
        for (Course course : courses) {
            if (!course.getUsers().remove(user))
                removed = false;

            repo.save(course);
        }

        return removed;
    }
}
