package com.gradesave.backend.dto.project;

import com.gradesave.backend.models.Project;

import java.util.UUID;

public record ProjectSubjectDTO(UUID projectSubjectId, UUID projectId, UUID subjectId, Integer duration) {
    public static ProjectSubjectDTO[] fromEntity(Project project) {
        return project.getProjectSubjects()
                .stream()
                .map(ps -> new ProjectSubjectDTO(
                        ps.getId(),
                        ps.getProject().getId(),
                        ps.getSubject().getId(),
                        ps.getDuration()
                ))
                .toArray(ProjectSubjectDTO[]::new);
    }
}