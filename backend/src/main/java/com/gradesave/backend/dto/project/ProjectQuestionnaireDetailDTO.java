package com.gradesave.backend.dto.project;


import com.gradesave.backend.dto.group.GroupMembersDTO;
import com.gradesave.backend.dto.question.QuestionDTO;
import com.gradesave.backend.dto.user.StudentDTO;
import com.gradesave.backend.models.Group;
import com.gradesave.backend.models.Project;

import java.util.List;
import java.util.UUID;

public record ProjectQuestionnaireDetailDTO(
        UUID projectId,
        String projectName,
        GroupMembersDTO[] groups,
        QuestionDTO[] questions,
        QuestionnaireActivityStatus status
) {
    public static ProjectQuestionnaireDetailDTO fromEntity(Project project, List<Group> groups) {
        return new ProjectQuestionnaireDetailDTO(
                project.getId(),
                project.getName(),
                groups.stream()
                        .map(g -> new GroupMembersDTO(
                                g.getId(),
                                g.getName(),
                                g.getUsers().stream()
                                        .map(s -> new StudentDTO(
                                                s.getId(),
                                                s.getUsername(),
                                                s.getFirstName(),
                                                s.getLastName()
                                        ))
                                        .toArray(StudentDTO[]::new)
                        ))
                        .toArray(GroupMembersDTO[]::new),
                project.getProjectQuestions().stream()
                        .map(pq -> new QuestionDTO(
                                pq.getQuestion().getId(),
                                pq.getQuestion().getText(),
                                pq.getQuestion().getType()
                        ))
                        .toArray(QuestionDTO[]::new),
                QuestionnaireActivityStatus.EDITING
        );
    }
}