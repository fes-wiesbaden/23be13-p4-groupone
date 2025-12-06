package com.gradesave.backend.dto.project;

import com.gradesave.backend.dto.group.GroupMembersDTO;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record ProjectSelectionWithMembersDto(
        UUID id,
        String name,
        LocalDate projectStart,
        List<GroupMembersDTO> groups
) {

}
