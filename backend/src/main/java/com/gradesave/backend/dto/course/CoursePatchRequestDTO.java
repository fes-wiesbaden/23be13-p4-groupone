package com.gradesave.backend.dto.course;

import java.util.UUID;

public record CoursePatchRequestDTO(
        String classTeacherId, // so we can distinguish between unsetting and empty
        String courseName
) {

}
//type CoursePatchRequest = {
//        classTeacherId?: string,
//courseName?: string,
//        }
