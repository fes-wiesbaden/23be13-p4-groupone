package com.gradesave.backend.dto.user;

import com.gradesave.backend.dto.course.CourseBareDTO;
import com.gradesave.backend.models.Role;
import com.gradesave.backend.models.User;

import java.util.List;
import java.util.UUID;

public record MeDTO (UUID id, String username, Role role, String firstName, String lastName, List<CourseBareDTO> courses) {
    public static MeDTO fromEntity(User user) {
        return new MeDTO(
                user.getId(),
                user.getUsername(),
                user.getRole(),
                user.getFirstName(),
                user.getLastName(),
                user.getCourses().stream().map(CourseBareDTO::fromEntity).toList()
        );
    }
}
