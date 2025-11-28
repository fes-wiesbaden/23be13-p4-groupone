package com.gradesave.backend.dto.course;

import com.gradesave.backend.dto.user.StudentDTO;
import com.gradesave.backend.dto.user.TeacherDTO;
import com.gradesave.backend.models.Course;
import com.gradesave.backend.models.Role;

import java.util.UUID;

public record CourseDetailResponseDTO (
        UUID courseId,
        String courseName,
        TeacherDTO classTeacher,
        TeacherDTO[] teachers,
        StudentDTO[] students
) {
    public static CourseDetailResponseDTO fromEntity(Course course) {
        TeacherDTO classTeacherDto = course.getClassTeacher() != null ? TeacherDTO.fromEntity(course.getClassTeacher()) : null;

        TeacherDTO[] teacherDTOS = course.getUsers().stream()
                .filter(u -> u.getRole() == Role.TEACHER)
                .map(TeacherDTO::fromEntity)
                .toArray(TeacherDTO[]::new);

        StudentDTO[] studentDTOS = course.getUsers().stream()
                .filter(u -> u.getRole() == Role.STUDENT)
                .map(StudentDTO::fromEntity)
                .toArray(StudentDTO[]::new);

        return new CourseDetailResponseDTO(
                course.getId(),
                course.getCourseName(),
                classTeacherDto,
                teacherDTOS,
                studentDTOS
        );
    }
}

