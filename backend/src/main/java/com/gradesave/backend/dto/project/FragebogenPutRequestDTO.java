package com.gradesave.backend.dto.project;

import com.gradesave.backend.dto.question.QuestionDTO;

public record FragebogenPutRequestDTO(QuestionDTO[] questions) {}
