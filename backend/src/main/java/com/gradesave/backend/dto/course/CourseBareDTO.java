package com.gradesave.backend.dto.course;

import com.gradesave.backend.models.Course;

import java.util.UUID;

public record CourseBareDTO(UUID id, String courseName, String classTeacherName) {
    public static CourseBareDTO fromEntity(Course course) {
        return new CourseBareDTO(
                course.getId(),
                course.getCourseName(),
                course.getClassTeacher() != null ? course.getClassTeacher().getFirstName() + " " + course.getClassTeacher().getLastName() : ""
        );
    }
}

