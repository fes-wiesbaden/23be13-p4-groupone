package com.gradesave.backend.dto.project;

import java.time.LocalDate;
import java.util.UUID;

public record ProjectSummaryDTO(UUID projectId, String projectName, ProjectStartDateDTO projectStart, UUID courseId, String courseName, String teacherName) {
}
