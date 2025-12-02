package com.gradesave.backend.dto.group;

import com.gradesave.backend.dto.user.StudentDTO;

import java.util.UUID;

public record GroupMembersDTO(
        UUID groupId,
        String groupName,

        StudentDTO[] members
) { }
