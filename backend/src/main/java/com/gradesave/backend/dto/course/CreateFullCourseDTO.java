package com.gradesave.backend.dto.course;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record CreateFullCourseDTO(
        @NotNull
        String courseName,

        UUID classTeacherId,
        UUID[] teacherIds,
        UUID[] studentIds
) {}
