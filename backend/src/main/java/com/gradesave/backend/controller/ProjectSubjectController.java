package com.gradesave.backend.controller;

import com.gradesave.backend.models.ProjectSubject;
import com.gradesave.backend.services.ProjectSubjectService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/projectSubject")
public class ProjectSubjectController {
    private final ProjectSubjectService projectSubjectService;
    public ProjectSubjectController(ProjectSubjectService projectSubjectService) {
        this.projectSubjectService = projectSubjectService;
    }

    @DeleteMapping("/remove/{projectSubjectId}")
    public ResponseEntity<Map<String, String>> removeSubjectFromProject(@PathVariable UUID projectSubjectId) {
        Optional<ProjectSubject> projectSubject = projectSubjectService.findById(projectSubjectId);

        if (projectSubject.isPresent()) {
            projectSubjectService.deleteById(projectSubjectId);
            return ResponseEntity.ok(Map.of("message", "Project_Subject removed successfully"));
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Project_Subject not found: " + projectSubjectId));
        }
    }
}
