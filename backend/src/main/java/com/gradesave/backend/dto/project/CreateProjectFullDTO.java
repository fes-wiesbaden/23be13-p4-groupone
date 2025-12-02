package com.gradesave.backend.dto.project;

import com.gradesave.backend.dto.group.GroupCreateWithMembersDTO;

import java.util.List;
import java.util.UUID;

public record CreateProjectFullDTO(
        String projectName,
        UUID courseId,
        ProjectStartDateDTO projectStartDate,
        List<GroupCreateWithMembersDTO> groups
) {}

