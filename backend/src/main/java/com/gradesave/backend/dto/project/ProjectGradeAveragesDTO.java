package com.gradesave.backend.dto.project;

public record ProjectGradeAveragesDTO(
        StudentGradeAverageDTO[] studentAverages
) {
}
