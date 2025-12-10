package com.gradesave.backend.dto.performance;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

/**
 * @author: Michael Holl
 * <p>
 *   DTO for new performances
 * </p>
 *
 **/

public record NewPerformanceRequest(
        UUID projectSubjectId,
        String name,
        String shortName,
        double weight,

        @NotNull
        UUID assignedTeacherId
) {

}