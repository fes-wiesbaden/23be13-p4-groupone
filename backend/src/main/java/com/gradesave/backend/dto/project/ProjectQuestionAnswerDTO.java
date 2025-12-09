package com.gradesave.backend.dto.project;

import java.util.UUID;

public record ProjectQuestionAnswerDTO(
        UUID questionId,
        StudentAnswerDTO[] answers
) {

}
