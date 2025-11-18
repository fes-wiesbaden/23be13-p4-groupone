package com.gradesave.backend.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.gradesave.backend.dto.CreateCourseRequest;
import com.gradesave.backend.models.Course;
import com.gradesave.backend.services.CourseService;
import com.gradesave.backend.services.UserService;

import jakarta.validation.Valid;

/**
 * @author: Noah Bach, Daniel Hess
 *          <p>
 *          Controller for handling Course ("Klassen") REST endpoints.
 *          Provides endpoints to create, retrieve, update, and delete courses.
 *          </p>
 *          Create, List, Delete function from Noah Bach rest updated by Daniel
 *          Hess
 **/

@RestController
@RequestMapping("/api/klassen")
public class CourseController {

    private final CourseService courseService;
    private final UserService userService;
    private static final Logger log = LoggerFactory.getLogger(CourseController.class);

    public CourseController(CourseService courseService, UserService userService) {
        this.courseService = courseService;
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<Course> createCourse(@Valid @RequestBody CreateCourseRequest req) {
        if (!userService.exists(req.teacherId())) {
            return ResponseEntity.badRequest().build();
        }
        try {
            Course course = new Course(req.courseName(), req.teacherId());
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
}
