package com.gradesave.backend.dto.project;

import java.util.UUID;

public record StudentAnswerDTO(
        UUID studentId,
        Object answer
) {
}