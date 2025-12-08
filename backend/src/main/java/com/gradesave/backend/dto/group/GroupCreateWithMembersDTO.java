package com.gradesave.backend.dto.group;

import jakarta.validation.constraints.NotBlank;

import java.util.List;
import java.util.UUID;

public record GroupCreateWithMembersDTO(
                @NotBlank String groupName,

                List<UUID> memberIds) {
}
