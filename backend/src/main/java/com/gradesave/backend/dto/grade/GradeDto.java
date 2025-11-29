package com.gradesave.backend.dto.grade;

import java.util.UUID;

/**
 * @author: Michael Holl
 * <p>
 *   DTO for grades
 * </p>
 *
 **/

public record GradeDto(UUID gradeId, UUID performanceId, Double grade) {

}
