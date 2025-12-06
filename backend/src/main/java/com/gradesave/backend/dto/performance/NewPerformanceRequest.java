package com.gradesave.backend.dto.performance;

import java.util.UUID;

public record NewPerformanceRequest(
        UUID projectSubjectId,
        String name,
        String shortName,
        double weight
) {

}