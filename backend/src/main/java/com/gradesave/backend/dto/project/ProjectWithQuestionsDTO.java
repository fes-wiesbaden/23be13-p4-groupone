package com.gradesave.backend.dto.project;

import com.gradesave.backend.models.Project;

import java.util.List;
import java.util.UUID;

public record ProjectWithQuestionsDTO(
        UUID projectId,
        String projectName,
        UUID courseId,
        String courseName,
        int questionCount
) {
    public static ProjectWithQuestionsDTO[] fromEntity(List<Project> projects) {
        return projects.stream().map(p -> new ProjectWithQuestionsDTO(
                        p.getId(),
                        p.getName(),
                        p.getCourse().getId(),
                        p.getCourse().getCourseName(),
                        p.getProjectQuestions().size()
                ))
                .toArray(ProjectWithQuestionsDTO[]::new);
    }
}
