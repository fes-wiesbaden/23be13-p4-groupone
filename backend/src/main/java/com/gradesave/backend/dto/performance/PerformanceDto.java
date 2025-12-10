package com.gradesave.backend.dto.performance;

import java.util.UUID;

/**
 * @author: Michael Holl
 * <p>
 *   DTO for performances
 * </p>
 *
 **/

public record PerformanceDto(
        UUID id,
        String name,
        String shortName,
        double weight,
        UUID assignedTeacherId
) {

}
