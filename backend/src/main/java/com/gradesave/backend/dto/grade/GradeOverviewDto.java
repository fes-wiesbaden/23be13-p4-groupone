package com.gradesave.backend.dto.grade;

import com.gradesave.backend.dto.subject.SubjectDto;
import com.gradesave.backend.dto.user.TeacherDTO;

import java.util.List;

/**
 * @author: Michael Holl
 * <p>
 *   DTO for grade overview result
 * </p>
 *
 **/

public record GradeOverviewDto(
        List<SubjectDto> subjects,
        List<UserGradeDto> users,
        List<TeacherDTO> teachers
        ) {

}
