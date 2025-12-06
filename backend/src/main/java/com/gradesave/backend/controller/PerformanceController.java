package com.gradesave.backend.controller;

import com.gradesave.backend.dto.performance.NewPerformanceRequest;
import com.gradesave.backend.models.Performance;
import com.gradesave.backend.models.ProjectSubject;
import com.gradesave.backend.services.PerformanceService;
import com.gradesave.backend.services.ProjectSubjectService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/performance")
public class PerformanceController {
    private final PerformanceService performanceService;
    private final ProjectSubjectService projectSubjectService;

    public PerformanceController(PerformanceService performanceService, ProjectSubjectService projectSubjectService) {
        this.performanceService = performanceService;
        this.projectSubjectService = projectSubjectService;
    }

    @PostMapping("/save")
    public void savePerformance(@RequestBody NewPerformanceRequest request) {
        ProjectSubject projectSubject = projectSubjectService.findProjectSubjectById(request.projectSubjectId());
        Performance performance = new Performance();
        performance.setName(request.name());
        performance.setShortName(request.shortName());
        performance.setWeight(request.weight());
        performance.setProjectSubject(projectSubject);
        performanceService.create(performance);
    }

    @DeleteMapping("/remove/{performanceId}")
    public ResponseEntity<Map<String, String>> removeSubjectFromProject(@PathVariable UUID performanceId) {
        Optional<Performance> performance = performanceService.findById(performanceId);

        if (performance.isPresent()) {
            projectSubjectService.deleteById(performanceId);
            return ResponseEntity.ok(Map.of("message", "Project_Subject removed successfully"));
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Project_Subject not found: " + performanceId));
        }
    }

}
