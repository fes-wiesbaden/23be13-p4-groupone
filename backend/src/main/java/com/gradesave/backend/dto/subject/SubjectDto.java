package com.gradesave.backend.dto.subject;

import com.gradesave.backend.dto.performance.PerformanceDto;

import java.util.List;
import java.util.UUID;

public record SubjectDto(
        UUID id,
        String name,
        String shortName,
        Double duration,
        boolean isLearningField,
        List<PerformanceDto> performances
        ) {

}
