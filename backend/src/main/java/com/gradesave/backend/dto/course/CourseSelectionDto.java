package com.gradesave.backend.dto.course;

import com.gradesave.backend.dto.project.ProjectSelectionDto;

import java.util.List;
import java.util.UUID;

/**
 * @author: Michael Holl
 * <p>
 *   DTO for course dropdown in grade overview
 * </p>
 *
 **/

public record CourseSelectionDto(
        UUID id,
        String name,
        List<ProjectSelectionDto> projects
        ) {
}
