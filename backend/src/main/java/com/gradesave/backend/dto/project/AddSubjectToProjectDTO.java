package com.gradesave.backend.dto.project;

import java.util.UUID;

public record AddSubjectToProjectDTO(UUID subjectId, String name, String shortName,  Double duration, boolean isLearningField) {}