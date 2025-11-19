package com.gradesave.backend.dto;

import com.gradesave.backend.models.Role;

import java.util.UUID;

public record UserDto(UUID id, String username, String firstName, String lastName, Role role) {
}



