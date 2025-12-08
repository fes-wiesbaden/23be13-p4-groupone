package com.gradesave.backend.controller;

import com.gradesave.backend.dto.performance.NewPerformanceRequest;
import com.gradesave.backend.dto.performance.PerformanceDto;
import com.gradesave.backend.models.Performance;
import com.gradesave.backend.models.ProjectSubject;
import com.gradesave.backend.services.PerformanceService;
import com.gradesave.backend.services.ProjectSubjectService;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    public PerformanceController(PerformanceService performanceService, ProjectSubjectService projectSubjectService) {
        this.performanceService = performanceService;
        this.projectSubjectService = projectSubjectService;
    }

    @Transactional
    @PostMapping("/save")
    public ResponseEntity<Map<String, String>> savePerformance(@RequestBody @Valid NewPerformanceRequest request) {
        Optional<ProjectSubject> projectSubject = projectSubjectService.findById(request.projectSubjectId());

        if (projectSubject.isPresent()) {
            ProjectSubject ps = projectSubject.get();
            Performance performance = new Performance();
            performance.setName(request.name());
            performance.setShortName(request.shortName());
            performance.setWeight(request.weight());
            performance.setProjectSubject(ps);
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
    public ResponseEntity<Map<String, String>> editPerformanceById(@RequestBody @Valid PerformanceDto performance) {
        Optional<Performance> performanceOpt = performanceService.findById(performance.id());

        if (performanceOpt.isPresent()) {
            Performance p = performanceOpt.get();
            p.setName(performance.name());
            p.setShortName(performance.shortName());
            if (performance.weight() < 0 || performance.weight() > 1) {
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
