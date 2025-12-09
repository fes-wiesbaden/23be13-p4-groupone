package com.gradesave.backend.dto.project;

import java.util.UUID;

public record FragebogenProjectDTO(
        UUID id,
        String name,
        int questionCount,
        int totalStudent,
        int submittedAnswers
) {}
