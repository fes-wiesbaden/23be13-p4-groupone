package com.gradesave.backend.dto.grade;

import java.util.List;
import java.util.UUID;

/**
 * @author: Michael Holl
 * <p>
 *   DTO for user grades
 * </p>
 *
 **/

public record UserGradeDto(UUID id, String firstName, String lastName, String group, List<GradeDto> grades) {

}
