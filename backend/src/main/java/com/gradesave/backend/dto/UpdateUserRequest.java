package com.gradesave.backend.dto;

import com.gradesave.backend.models.Role;

public record UpdateUserRequest(@jakarta.validation.constraints.NotBlank String username,
                                @jakarta.validation.constraints.NotBlank String firstName,
                                @jakarta.validation.constraints.NotBlank String lastName,
                                @jakarta.validation.constraints.NotNull Role role, String password) {
}

