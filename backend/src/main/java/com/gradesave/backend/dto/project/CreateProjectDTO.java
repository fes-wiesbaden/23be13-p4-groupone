package com.gradesave.backend.dto.project;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record CreateProjectDTO (
    @NotNull
    UUID courseId,

    @NotBlank
    String projectName,

    @NotNull
    ProjectStartDateDTO projectStart
) {}

