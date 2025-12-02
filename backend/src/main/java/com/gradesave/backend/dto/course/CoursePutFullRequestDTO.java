package com.gradesave.backend.dto.course;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.UUID;

public record CoursePutFullRequestDTO(
        @NotBlank String courseName,
        String classTeacherId,
        @NotNull List<UUID> teacherIds,
        @NotNull List<UUID> studentIds
) {
}