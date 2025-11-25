package com.gradesave.backend.dto.group;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record GroupCreateDTO (
        @NotBlank
        String groupName,

        @NotNull
        UUID projectId
) {}
