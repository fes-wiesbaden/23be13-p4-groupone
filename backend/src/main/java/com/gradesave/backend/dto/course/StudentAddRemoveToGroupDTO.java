package com.gradesave.backend.dto.course;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record StudentAddRemoveToGroupDTO(
        @NotNull
        UUID studentId
) {}
