package com.gradesave.backend.dto.grade;

import java.math.BigDecimal;

public record CalculateSubjectGradeDto(BigDecimal grade, Double weight) {
}
