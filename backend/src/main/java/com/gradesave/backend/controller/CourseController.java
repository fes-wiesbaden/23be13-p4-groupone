package com.gradesave.backend.controller;

import com.gradesave.backend.dto.CreateCourseRequest;
import com.gradesave.backend.dto.course.CourseBareDTO;
import com.gradesave.backend.dto.user.StudentDTO;
import com.gradesave.backend.models.Course;
import com.gradesave.backend.models.User;
import com.gradesave.backend.services.CourseService;
import com.gradesave.backend.services.UserService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

/**
 * @author: Noah Bach, Daniel Hess
 * <p>
 * Controller for handling Course ("Klassen") REST endpoints.
 * Provides endpoints to create, retrieve, update, and delete courses.
 * </p>
 * Create, List, Delete function from Noah Bach rest updated by Daniel
 * Hess
 * <p>
 * DTO changes by Paul Geisthardt
 **/

@RestController
@RequestMapping("/api/klassen")
public class CourseController {

    private static final Logger log = LoggerFactory.getLogger(CourseController.class);
    private final CourseService courseService;
    private final UserService userService;

    public CourseController(CourseService courseService, UserService userService) {
        this.courseService = courseService;
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<Course> createCourse(@Valid @RequestBody CreateCourseRequest req) {
        Optional<User> teacher = userService.getById(req.teacherId());
        if (teacher.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        try {
            Course course = new Course();
            course.setCourseName(req.courseName());
            course.setClassTeacher(teacher.get());
            Course createdCourse = courseService.create(course);
            return new ResponseEntity<>(createdCourse, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            log.warn("IllegalArgumentException when creating course: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Unexpected error when creating course: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping
    public ResponseEntity<List<Course>> getAllCourses() {
        List<Course> courses = courseService.getAll();
        return ResponseEntity.ok(courses);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Course> updateCourse(@PathVariable UUID id,
                                               @Valid @RequestBody com.gradesave.backend.dto.UpdateCourseRequest req) {
        if (!userService.exists(req.teacherId())) {
            return ResponseEntity.badRequest().build();
        }
        try {
            Course updated = courseService.update(id, req);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            log.warn("IllegalArgumentException when updating course with id {}: {}", id, e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Course> deleteCourse(@PathVariable UUID id) {
        courseService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/all/bare")
    public ResponseEntity<CourseBareDTO[]> getAllCoursesBare() {
        List<Course> courses = courseService.getAll();

        CourseBareDTO[] dtos = courses.stream()
                .map(c -> new CourseBareDTO(
                        c.getId(),
                        c.getCourseName(),
                        c.getClassTeacher().getFirstName() + " " + c.getClassTeacher().getLastName()
                ))
                .toArray(CourseBareDTO[]::new);

        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{id}/students")
    public ResponseEntity<StudentDTO[]> getStudents(@PathVariable UUID id) {
        Optional<Course> courseOpt = courseService.getById(id);
        if (courseOpt.isEmpty())
            return ResponseEntity.notFound().build();

        Course course = courseOpt.get();

        Set<User> users = course.getUsers();

        StudentDTO[] students = users.stream()
                .map(s -> new StudentDTO(
                        s.getId(),
                        s.getUsername(),
                        s.getFirstName(),
                        s.getLastName()
                ))
                .toArray(StudentDTO[]::new);


        return ResponseEntity.ok(students);
    }
}

//public record CourseBareDTO(org.gradle.internal.impldep.jcifs.dcerpc.UUID id, String courseName, String classTeacherName) {
