package com.gradesave.backend.dto.course;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record TeacherAddRemoveToGroupDTO(
        @NotNull
        UUID teacherId
) {}