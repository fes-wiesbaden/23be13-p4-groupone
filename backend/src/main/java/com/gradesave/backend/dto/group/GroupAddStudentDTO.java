package com.gradesave.backend.dto.group;

import java.util.UUID;

public record GroupAddStudentDTO (UUID groupId, UUID studentId) { }
