package com.gradesave.backend.dto.question;

import com.gradesave.backend.models.QuestionType;

import java.util.UUID;

public record QuestionDTO(
        UUID id,
        String text,
        QuestionType type
) {
}
