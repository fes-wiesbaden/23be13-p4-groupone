package com.gradesave.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record UpdateCourseRequest(
        @NotBlank String courseName,
        UUID teacherId
) {}
