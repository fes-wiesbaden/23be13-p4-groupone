package com.gradesave.backend.dto.user;

import com.gradesave.backend.models.User;

import java.util.UUID;

public record StudentDTO (UUID studentId, String username, String firstName, String lastName) {
    public static StudentDTO fromEntity(User user) {
        return new StudentDTO(
                user.getId(),
                user.getUsername(),
                user.getFirstName(),
                user.getLastName()
        );
    }
}
