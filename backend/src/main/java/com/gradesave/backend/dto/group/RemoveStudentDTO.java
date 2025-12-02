package com.gradesave.backend.dto.group;

import java.util.UUID;

public record RemoveStudentDTO(
        UUID groupId,
        UUID studentId
) { }
