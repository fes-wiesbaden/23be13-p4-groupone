package com.gradesave.backend.dto.grade;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

/**
 * @author: Michael Holl
 * <p>
 *   DTO for grades
 * </p>
 *
 **/

public record GradeDto(UUID performanceId, UUID projectSubjectId, Double grade) {

}
