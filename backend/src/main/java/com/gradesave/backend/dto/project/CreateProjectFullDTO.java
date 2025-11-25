package com.gradesave.backend.dto.project;

import com.gradesave.backend.dto.group.GroupCreateWithMembersDTO;

import java.util.List;
import java.util.UUID;

public record CreateProjectFullDTO(
        String projectName,
        UUID courseId,
        ProjectStartDateDTO projectStartDate,
        List<GroupCreateWithMembersDTO> groups
) {}

//const payload = {
//projectName: projectCreateDetails.projectName,
//courseId: projectCreateDetails.courseId,
//projectStartDate: projectCreateDetails.projectStartDate,
//groups: draftGroups.map(g => ({
//    groupName: g.groupName,
//            members: g.members.map(m => m.studentId)
//}))
//        }
