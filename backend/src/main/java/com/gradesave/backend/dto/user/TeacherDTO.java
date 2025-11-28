package com.gradesave.backend.dto.user;

import com.gradesave.backend.models.User;

import java.util.UUID;

public record TeacherDTO(
        UUID teacherId,
        String username,
        String firstName,
        String lastName
) {
    public static TeacherDTO fromEntity(User user) {
        return new TeacherDTO(
                user.getId(),
                user.getUsername(),
                user.getFirstName(),
                user.getLastName()
        );
    }
}
