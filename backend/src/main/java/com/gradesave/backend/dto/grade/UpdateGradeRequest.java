package com.gradesave.backend.dto.grade;

import java.util.List;
import java.util.UUID;

/**
 * @author: Michael Holl
 * <p>
 *   DTO new grades
 * </p>
 *
 **/

public record UpdateGradeRequest(UUID studentId, List<GradeDto> grades) {
}
