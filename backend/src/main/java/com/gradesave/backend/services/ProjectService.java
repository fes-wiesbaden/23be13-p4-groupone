package com.gradesave.backend.services;

import com.gradesave.backend.dto.project.QuestionnaireActivityStatus;
import com.gradesave.backend.dto.question.QuestionDTO;
import com.gradesave.backend.models.Answer;
import com.gradesave.backend.models.Project;
import com.gradesave.backend.models.ProjectQuestion;
import com.gradesave.backend.models.Question;
import com.gradesave.backend.repositories.*;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * @author: Paul Geisthardt
 * <p>
 * Business logic for projects
 * </p>
 */

@Service
@Transactional
public class ProjectService implements CrudService<Project, UUID> {
    private final CourseRepository courseRepository;
    private final ProjectRepository projectRepository;
    private final GroupRepository groupRepository;
    private final QuestionRepository questionRepository;
    private final AnswerRepository answerRepository;

    public ProjectService(CourseRepository courseRepository, ProjectRepository projectRepository, GroupRepository groupRepository, QuestionRepository questionRepository, AnswerRepository answerRepository) {
        this.courseRepository = courseRepository;
        this.projectRepository = projectRepository;
        this.groupRepository = groupRepository;
        this.questionRepository = questionRepository;
        this.answerRepository = answerRepository;
    }

    @Override
    public Project create(Project entity) {
        return projectRepository.save(entity);
    }

    @Override
    public Optional<Project> getById(UUID uuid) {
        return projectRepository.findById(uuid);
    }

    @Override
    public List<Project> getAll() {
        return projectRepository.findAll();
    }

    @Override
    public Project update(UUID uuid, Project entity) {
        Optional<Project> existingOpt = projectRepository.findById(uuid);

        if (existingOpt.isEmpty())
            throw new EntityNotFoundException("Project not found: " + uuid);

        Project existing = existingOpt.get();

        existing.setName(entity.getName());
        existing.setProjectStart(entity.getProjectStart());
        existing.setGroups(entity.getGroups());
        existing.setProjectSubjects(entity.getProjectSubjects());

        return projectRepository.save(existing);
    }

    @Override
    public void deleteById(UUID uuid) {
        projectRepository.deleteById(uuid);
    }

    @Override
    public boolean deleteIfExists(UUID uuid) {
        Optional<Project> project = this.getById(uuid);
        if (project.isEmpty())
            return false;

        projectRepository.delete(project.get());

        return true;
    }

    @Override
    public boolean exists(UUID uuid) {
        return projectRepository.existsById(uuid);
    }

    @Override
    public long count() {
        return projectRepository.count();
    }

    public void updateFragebogen(Project project, QuestionDTO[] questions, QuestionnaireActivityStatus status) {
        Set<UUID> requestQuestionIds = Arrays.stream(questions)
                .map(QuestionDTO::id)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        project.getProjectQuestions().removeIf(pq -> !requestQuestionIds.contains(pq.getQuestion().getId()));

        for (QuestionDTO questionDTO : questions) {
            Question question = questionRepository.findById(questionDTO.id()).orElseGet(() -> {
                Question q = new Question();
                q.setText(questionDTO.text());
                q.setType(questionDTO.type());
                return questionRepository.save(q);
            });

            question.setType(questionDTO.type());
            question.setText(questionDTO.text());
            questionRepository.save(question);

            boolean alreadyLinked = project.getProjectQuestions().stream()
                    .anyMatch(pq -> pq.getQuestion().getId().equals(question.getId()));

            if (!alreadyLinked) {
                ProjectQuestion projectQuestion = new ProjectQuestion();
                projectQuestion.setProject(project);
                projectQuestion.setQuestion(question);
                project.getProjectQuestions().add(projectQuestion);
            }
        }

        project.setActivityStatus(status);

        projectRepository.save(project);
    }
}
