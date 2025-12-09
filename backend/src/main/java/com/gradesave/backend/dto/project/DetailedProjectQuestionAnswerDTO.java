package com.gradesave.backend.dto.project;

import java.util.UUID;

public record DetailedProjectQuestionAnswerDTO(
        UUID questionId,
        DetailedStudentAnswerDTO[] answers
) {
}
