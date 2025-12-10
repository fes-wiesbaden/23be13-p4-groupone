package com.gradesave.backend.dto.performance;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

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
        @NotNull(message = "Weight is required")
        @Positive(message = "Weight must be a positive number")
        double weight,

        @NotNull
        UUID assignedTeacherId
) {

}