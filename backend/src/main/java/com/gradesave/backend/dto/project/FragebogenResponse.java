package com.gradesave.backend.dto.project;

import java.util.List;

public record FragebogenResponse(
        List<FragebogenCourseDTO> courses
) {}
