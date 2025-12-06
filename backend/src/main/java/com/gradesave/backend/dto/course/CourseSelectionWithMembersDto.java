package com.gradesave.backend.dto.course;

import com.gradesave.backend.dto.project.ProjectSelectionWithMembersDto;

import java.util.List;
import java.util.UUID;

public record CourseSelectionWithMembersDto(
        UUID id,
        String name,
        List<ProjectSelectionWithMembersDto> projects
) {
}
