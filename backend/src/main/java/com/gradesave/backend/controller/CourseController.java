package com.gradesave.backend.controller;

import com.gradesave.backend.dto.course.CreateCourseRequest;
import com.gradesave.backend.dto.course.UpdateCourseRequest;
import com.gradesave.backend.dto.course.*;
import com.gradesave.backend.dto.user.StudentDTO;
import com.gradesave.backend.models.Course;
import com.gradesave.backend.models.Role;
import com.gradesave.backend.models.User;
import com.gradesave.backend.services.CourseService;
import com.gradesave.backend.services.UserService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gradesave.backend.dto.course.CourseSelectionDto;

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
@RequestMapping("/api/course")
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
                                               @Valid @RequestBody UpdateCourseRequest req) {
        if (req.teacherId() != null) {
            if (!userService.exists(req.teacherId())) {
                return ResponseEntity.badRequest().build();
            }
        }

        try {
            Course updated = courseService.update(id, req);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            log.warn("IllegalArgumentException when updating course with id {}: {}", id, e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("{id}/full")
    public ResponseEntity<Void> putFullCourse(@PathVariable UUID id, @Valid @RequestBody CoursePutFullRequestDTO req) {
        Optional<Course> courseOpt = courseService.getById(id);
        if (courseOpt.isEmpty())
            return ResponseEntity.notFound().build();

        Course course = courseOpt.get();

        course.setCourseName(req.courseName());

        User classTeacher = null;

        if (req.classTeacherId() != null && !req.classTeacherId().isEmpty()) {
            try {
                UUID classTeacherId = UUID.fromString(req.classTeacherId());
                Optional<User> classTeacherOpt = userService.getById(classTeacherId);
                if (classTeacherOpt.isEmpty() || classTeacherOpt.get().getRole() != Role.TEACHER)
                    return ResponseEntity.badRequest().build();

                classTeacher = classTeacherOpt.get();
                course.setClassTeacher(classTeacher);
            } catch (IllegalArgumentException e) {
                course.setClassTeacher(null);
            }
        } else {
            course.setClassTeacher(null);
        }


        List<User> teachers = userService.getUsersByIds(req.teacherIds());
        List<User> students = userService.getUsersByIds(req.studentIds());

        course.getUsers().clear();
        course.getUsers().addAll(teachers);
        course.getUsers().addAll(students);

        if (classTeacher != null) {
            course.getUsers().add(classTeacher);
        }

        courseService.create(course);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("{id}")
    public ResponseEntity<Void> patchCourse(@PathVariable UUID id, @Valid @RequestBody CoursePatchRequestDTO req) {
        Optional<Course> courseOpt = courseService.getById(id);
        if (courseOpt.isEmpty())
            return ResponseEntity.notFound().build();

        courseService.patchCourse(courseOpt.get(), req);

        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Course> deleteCourse(@PathVariable UUID id) {
        courseService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("{id}/teachers/add")
    public ResponseEntity<Void> addTeacher(@PathVariable UUID id, @Valid @RequestBody TeacherAddRemoveToGroupDTO req) {
        Optional<Course> courseOpt = courseService.getById(id);
        if (courseOpt.isEmpty())
            return ResponseEntity.badRequest().build();

        Course course = courseOpt.get();

        Optional<User> teacherOpt = userService.getById(req.teacherId());
        if (teacherOpt.isEmpty())
            return ResponseEntity.notFound().build();

        User teacher = teacherOpt.get();
        if (teacher.getRole() != Role.TEACHER)
            return ResponseEntity.badRequest().build();

        if (!course.getUsers().contains(teacher)) {
            course.getUsers().add(teacher);
            courseService.create(course); // updates it but is bad name
        }

        return ResponseEntity.ok().build();
    }

    @PostMapping("{id}/teachers/remove")
    public ResponseEntity<Void> removeTeacher(@PathVariable UUID id, @Valid @RequestBody TeacherAddRemoveToGroupDTO req) {
        Optional<Course> courseOpt = courseService.getById(id);
        if (courseOpt.isEmpty())
            return ResponseEntity.notFound().build();

        Course course = courseOpt.get();

        Optional<User> teacherOpt = userService.getById(req.teacherId());
        if (teacherOpt.isEmpty())
            return ResponseEntity.notFound().build();

        User teacher = teacherOpt.get();
        if (teacher.getRole() != Role.TEACHER)
            return ResponseEntity.badRequest().build();

        boolean removed = course.getUsers().removeIf(t -> t.getId().equals(teacher.getId()));

        if (removed)
            courseService.create(course); // updates but is bad name

        return ResponseEntity.ok().build();
    }

    @PostMapping("{id}/students/add")
    public ResponseEntity<Void> addStudent(@PathVariable UUID id, @Valid @RequestBody StudentAddRemoveToGroupDTO req) {
        Optional<Course> courseOpt = courseService.getById(id);
        if (courseOpt.isEmpty())
            return ResponseEntity.notFound().build();

        Course course = courseOpt.get();

        Optional<User> studentOpt = userService.getById(req.studentId());
        if (studentOpt.isEmpty())
            return ResponseEntity.notFound().build();

        User student = studentOpt.get();
        if (student.getRole() != Role.STUDENT)
            return ResponseEntity.badRequest().build();

        if (!course.getUsers().contains(student)) {
            course.getUsers().add(student);
            courseService.create(course); // updates it but is bad name
        }

        return ResponseEntity.ok().build();
    }

    @PostMapping("{id}/students/remove")
    public ResponseEntity<Void> removeStudent(@PathVariable UUID id, @Valid @RequestBody StudentAddRemoveToGroupDTO req) {
        Optional<Course> courseOpt = courseService.getById(id);
        if (courseOpt.isEmpty())
            return ResponseEntity.notFound().build();

        Course course = courseOpt.get();

        Optional<User> studentOpt = userService.getById(req.studentId());
        if (studentOpt.isEmpty())
            return ResponseEntity.notFound().build();

        User student = studentOpt.get();
        if (student.getRole() != Role.STUDENT)
            return ResponseEntity.badRequest().build();

        boolean removed = course.getUsers().removeIf(t -> t.getId().equals(student.getId()));

        if (removed)
            courseService.create(course); // updates but is bad name

        return ResponseEntity.ok().build();
    }


    @GetMapping("/all/bare")
    public ResponseEntity<CourseBareDTO[]> getAllCoursesBare() {
        List<Course> courses = courseService.getAll();

        CourseBareDTO[] dtos = courses.stream()
                .map(c -> new CourseBareDTO(
                        c.getId(),
                        c.getCourseName(),
                        (c.getClassTeacher() != null ? c.getClassTeacher().getFirstName() + " " + c.getClassTeacher().getLastName() : "No Teacher")
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
                .filter(s -> s.getRole() == Role.STUDENT)
                .map(s -> new StudentDTO(
                        s.getId(),
                        s.getUsername(),
                        s.getFirstName(),
                        s.getLastName()
                ))
                .toArray(StudentDTO[]::new);


        return ResponseEntity.ok(students);
    }

    @GetMapping("{id}")
    public ResponseEntity<CourseDetailResponseDTO> getCourseDetail(@Valid @PathVariable UUID id) {
        Optional<Course> courseOpt = courseService.getById(id);
        if (courseOpt.isEmpty())
            return ResponseEntity.notFound().build();

        Course course = courseOpt.get();

        return ResponseEntity.ok(CourseDetailResponseDTO.fromEntity(course));
    }

    @PostMapping("full")
    public ResponseEntity<Void> createFullCourse(@Valid @RequestBody CreateFullCourseDTO req) {
        Course course = new Course();
        course.setCourseName(req.courseName());

        List<User> students = userService.getUsersByIds(List.of(req.studentIds()));
        List<User> teachers = userService.getUsersByIds(List.of(req.teacherIds()));

        course.getUsers().addAll(students);
        course.getUsers().addAll(teachers);

        if (req.classTeacherId() != null) {
            Optional<User> classTeacher = userService.getById(req.classTeacherId());
            classTeacher.ifPresent(course::setClassTeacher);
        }

        courseService.create(course);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/findGradeOverviewOptions")
    public List<CourseSelectionDto> findGradeOverviewOptions(@Valid @RequestParam UUID userId) {
        return courseService.findGradeOverviewOptions(userId);
    }
}
