package com.gradesave.backend.dto.project;

import java.util.UUID;

public record AddSubjectToProjectDTO(UUID subjectId, int duration) {}