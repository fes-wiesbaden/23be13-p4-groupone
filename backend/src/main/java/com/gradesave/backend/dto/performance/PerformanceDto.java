package com.gradesave.backend.dto.performance;

import jakarta.validation.constraints.Positive;

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
        @Positive(message = "Gewichtung muss eine positive Zahl sein")
        double weight,
        UUID assignedTeacherId
) {

}
