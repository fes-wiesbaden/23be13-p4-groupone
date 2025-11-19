package com.gradesave.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record CreateCourseRequest(
        @NotBlank String courseName,
        @NotNull UUID teacherId) {
}
