package com.gradesave.backend.dto.project;

import com.gradesave.backend.dto.group.ProjectDetailGroupDTO;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record ProjectPutFullRequestDTO(
        @NotNull
        @NotBlank
        String projectName,

        @NotNull
        ProjectStartDateDTO projectStartDate,

        List<ProjectDetailGroupDTO> groups
) {}