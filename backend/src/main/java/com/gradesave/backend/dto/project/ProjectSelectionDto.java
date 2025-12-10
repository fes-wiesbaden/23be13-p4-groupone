package com.gradesave.backend.dto.project;

import com.gradesave.backend.dto.group.GroupSelectionDto;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record ProjectSelectionDto(
        UUID id,
        String name,
        LocalDate projectStart,
        List<GroupSelectionDto> groups,
        boolean canEdit
        ) {

}
