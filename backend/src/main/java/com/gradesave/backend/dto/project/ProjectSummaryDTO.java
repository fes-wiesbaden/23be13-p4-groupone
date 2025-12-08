package com.gradesave.backend.dto.project;

import java.util.UUID;

public record ProjectSummaryDTO(
        UUID projectId,
        String projectName,

        UUID courseId,
        String courseName,

        UUID teacherId,
        String teacherName,

        Integer groupsAmount,

        Integer unassignedStudentsAmount,

        ProjectStartDateDTO projectStart
) { }
