package com.gradesave.backend.controller;

import com.gradesave.backend.dto.performance.NewPerformanceRequest;
import com.gradesave.backend.dto.performance.PerformanceDto;
import com.gradesave.backend.models.Performance;
import com.gradesave.backend.models.ProjectSubject;
import com.gradesave.backend.models.Role;
import com.gradesave.backend.models.User;
import com.gradesave.backend.repositories.UserRepository;
import com.gradesave.backend.services.PerformanceService;
import com.gradesave.backend.services.ProjectSubjectService;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/**
 * @author: Michael Holl
 * <p>
 * Handles incoming HTTP requests for performances
 * </p>
 **/

@RestController
@RequestMapping("/api/performance")
public class PerformanceController {
    private final PerformanceService performanceService;
    private final ProjectSubjectService projectSubjectService;
    private final UserRepository userRepository;

    public PerformanceController(PerformanceService performanceService, ProjectSubjectService projectSubjectService, UserRepository userRepository) {
        this.performanceService = performanceService;
        this.projectSubjectService = projectSubjectService;
        this.userRepository = userRepository;
    }

    @Transactional
    @PostMapping("/save")
    public ResponseEntity<Map<String, String>> savePerformance(@RequestBody @Valid NewPerformanceRequest request) {
        Optional<ProjectSubject> projectSubject = projectSubjectService.findById(request.projectSubjectId());

        User assignedTeacher = userRepository.findById(request.assignedTeacherId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Teacher doesnt exists"));

        if (assignedTeacher.getRole() != Role.TEACHER && assignedTeacher.getRole() != Role.ADMIN)
            return ResponseEntity.badRequest().build();



        if (projectSubject.isPresent()) {
            ProjectSubject ps = projectSubject.get();

            if (!ps.getProject().getCourse().getUsers().stream()
                    .anyMatch(u -> u.getId() == assignedTeacher.getId()))
                return ResponseEntity.badRequest().body(Map.of("error", "Teacher doesnt exist in course"));

            Performance performance = new Performance();
            performance.setName(request.name());
            performance.setShortName(request.shortName());
            performance.setWeight(request.weight());
            performance.setProjectSubject(ps);
            performance.setAssignedTeacher(assignedTeacher);
            performanceService.create(performance);
            return ResponseEntity.ok(Map.of("message", "Performance saved successfully"));
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "projectSubject not found"));
        }


    }

    @Transactional
    @DeleteMapping("/remove/{performanceId}")
    public ResponseEntity<Map<String, String>> removePerformanceById(@PathVariable @Valid UUID performanceId) {
        Optional<Performance> performance = performanceService.findById(performanceId);

        if (performance.isPresent()) {
            performanceService.deleteIfExists(performanceId);
            return ResponseEntity.ok(Map.of("message", "Performance removed successfully"));
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Performance not found: " + performanceId));
        }
    }

    @Transactional
    @PutMapping("/edit")
    public ResponseEntity<Map<String, String>> editPerformance(@RequestBody @Valid PerformanceDto performance) {
        Optional<Performance> performanceOpt = performanceService.findById(performance.id());

        if (performanceOpt.isPresent()) {
            Performance p = performanceOpt.get();
            p.setName(performance.name());
            p.setShortName(performance.shortName());
            Optional<User> teacherOpt = userRepository.findById(performance.assignedTeacherId());
            if (teacherOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Teacher doesnt exist"));
            }
            User teacher = teacherOpt.get();
            p.setAssignedTeacher(teacher);
            if (performance.weight() < 0) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Weight of performance is not valid"));
            }
            p.setWeight(performance.weight());
            performanceService.create(p);
            return ResponseEntity.ok(Map.of("message", "Performance edited successfully"));
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Performance not found: " + performance.id()));
        }
    }


}
