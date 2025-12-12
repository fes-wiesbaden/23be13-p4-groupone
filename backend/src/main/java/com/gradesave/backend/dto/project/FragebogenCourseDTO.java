package com.gradesave.backend.dto.project;

import java.util.List;
import java.util.UUID;

public record FragebogenCourseDTO(
        UUID id,
        String name,
        List<FragebogenProjectDTO> projects
) {}
