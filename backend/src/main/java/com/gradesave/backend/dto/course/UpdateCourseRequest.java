package com.gradesave.backend.dto.course;

import jakarta.validation.constraints.NotBlank;
import java.util.UUID;

public record UpdateCourseRequest(
        @NotBlank String courseName,
        UUID teacherId
) {}
