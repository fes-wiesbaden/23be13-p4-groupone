package com.gradesave.backend.dto.user;

import com.gradesave.backend.models.Role;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateUserRequest(@NotBlank String username,
                                @NotBlank String firstName,
                                @NotBlank String lastName,
                                @NotNull Role role,
                                @NotBlank
                                @Size(min = 8, max = 50, message = "Passwort muss zwischen 8 und 50 Zeichen lang sein")
                                String password) {
}
