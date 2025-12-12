package com.gradesave.backend.dto.project;

import java.util.UUID;

public record StudentGradeAverageDTO(
        UUID studentId,
        String studentName,
        Double averageGrade,
        Integer totalGrades,
        Double selfAssessment,
        Double peerAssessment
) {
}
