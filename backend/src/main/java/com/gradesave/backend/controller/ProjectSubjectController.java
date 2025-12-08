package com.gradesave.backend.controller;

import com.gradesave.backend.dto.subject.EditProjectSubjectDto;
import com.gradesave.backend.models.ProjectSubject;
import com.gradesave.backend.models.Subject;
import com.gradesave.backend.services.ProjectSubjectService;
import com.gradesave.backend.services.SubjectService;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/**
 * @author: Michael Holl
 * <p>
 * Handles incoming HTTP requests for projectSubjects
 * </p>
 **/

@RestController
@RequestMapping("/api/projectSubject")
public class ProjectSubjectController {
    private final ProjectSubjectService projectSubjectService;
    private final SubjectService subjectService;

    public ProjectSubjectController(ProjectSubjectService projectSubjectService, SubjectService subjectService) {
        this.projectSubjectService = projectSubjectService;
        this.subjectService = subjectService;
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

    @Transactional
    @PutMapping("/edit")
    public ResponseEntity<Map<String, String>> updateSubject(@RequestBody EditProjectSubjectDto editProjectSubjectDto) {
        Optional<ProjectSubject> projectSubjectOpt = projectSubjectService.findById(editProjectSubjectDto.id());
        if (projectSubjectOpt.isPresent()) {
            ProjectSubject projectSubject = projectSubjectOpt.get();
            projectSubject.setDuration(editProjectSubjectDto.duration());
            projectSubjectService.update(projectSubject);

            Subject subject = projectSubject.getSubject();
            subject.setShortName(editProjectSubjectDto.shortName());
            subject.setLearningField(editProjectSubjectDto.learningField());
            subjectService.update(subject.getId(), subject);
            return ResponseEntity.ok(Map.of("message", "Project_Subject edited successfully"));

        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Project_Subject not found: " + editProjectSubjectDto.id()));
        }
    }
}
