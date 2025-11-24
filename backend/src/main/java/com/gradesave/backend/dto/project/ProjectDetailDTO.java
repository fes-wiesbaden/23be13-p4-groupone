package com.gradesave.backend.dto.project;

import com.gradesave.backend.dto.group.GroupMembersDTO;
import com.gradesave.backend.models.Group;

import java.util.UUID;

public record ProjectDetailDTO(
        UUID projectId,
        String projectName,

        UUID classId,
        String className,

        UUID teacherId,
        String teacherName,

        GroupMembersDTO[] groups
) { }

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
