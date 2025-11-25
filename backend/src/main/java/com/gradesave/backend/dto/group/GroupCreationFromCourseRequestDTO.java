package com.gradesave.backend.dto.group;

import java.util.UUID;

public record GroupCreationFromCourseRequestDTO (
    UUID courseId,
    UUID projectId,
    int groupAmount
) {}
