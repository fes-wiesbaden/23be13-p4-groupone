package com.gradesave.backend.dto.group;

import com.gradesave.backend.dto.user.StudentDTO;

import java.util.List;
import java.util.UUID;

public record ProjectDetailGroupDTO(
        UUID groupId,
        String groupName,

        List<StudentDTO> members
) {}