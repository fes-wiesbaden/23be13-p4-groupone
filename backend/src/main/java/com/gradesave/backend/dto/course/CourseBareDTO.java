package com.gradesave.backend.dto.course;

import java.util.UUID;

public record CourseBareDTO(UUID id, String courseName, String classTeacherName) {
}

