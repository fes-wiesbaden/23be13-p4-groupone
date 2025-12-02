package com.gradesave.backend.dto.project;

import com.gradesave.backend.dto.group.GroupMembersDTO;

import java.util.UUID;

public record ProjectDetailDTO(
        UUID projectId,
        String projectName,

        UUID courseId,
        String courseName,

        UUID teacherId,
        String teacherName,

        ProjectStartDateDTO projectStartDate,

        GroupMembersDTO[] groups,
        ProjectSubjectDTO[] subjects
) {
}

//interface ProjectDetailResponse {
//    projectId: string;
//    projectName: string;
//
//    classId: string;
//    className: string;
//
//    teacherId: string;
//    teacherName: string;
//
//    groups: ProjectDetailGroup[];
//}
