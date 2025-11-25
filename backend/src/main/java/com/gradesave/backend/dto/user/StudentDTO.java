package com.gradesave.backend.dto.user;

import java.util.UUID;

public record StudentDTO (UUID studentId, String username, String firstName, String lastName) { }
