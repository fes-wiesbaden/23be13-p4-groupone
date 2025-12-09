package com.gradesave.backend.dto.project;

import java.util.UUID;

public record DetailedStudentAnswerDTO(
        UUID authorId,
        UUID recipientId,
        Object answer
) {
}
