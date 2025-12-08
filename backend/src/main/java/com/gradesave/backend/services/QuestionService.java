package com.gradesave.backend.services;

import com.gradesave.backend.dto.project.QuestionnaireActivityStatus;
import com.gradesave.backend.models.*;
import com.gradesave.backend.repositories.ProjectQuestionRepository;
import com.gradesave.backend.repositories.QuestionRepository;
import com.gradesave.backend.repositories.SubjectRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * @author: Michael Holl
 * <p>
 * Business logic for subjects
 * </p>
 *
 *
 */
@Service
@Transactional
public class QuestionService implements CrudService<Question, UUID>{
    private final SubjectRepository subjectRepository;
    private final QuestionRepository questionRepository;
    private final ProjectQuestionRepository projectQuestionRepository;
    private final ProjectService projectService;

    public QuestionService(SubjectRepository subjectRepository, QuestionRepository repository, ProjectQuestionRepository projectQuestionRepository, ProjectService projectService) {
        this.subjectRepository = subjectRepository;
        this.questionRepository = repository;
        this.projectQuestionRepository = projectQuestionRepository;
        this.projectService = projectService;
    }

    @Transactional
    @Override
    public Question create(Question question) {
        Set<UUID> subjectIds = question.getSubjects().stream()
                .map(Subject::getId)
                .collect(Collectors.toSet());

        Set<Subject> subjects = new HashSet<>(subjectRepository.findAllById(subjectIds));

        if (subjects.size() != subjectIds.size()) {
            throw new RuntimeException("Some subjects not found");
        }

        question.setSubjects(subjects);

        Question created = questionRepository.save(question);

        for (Subject subject : subjects) {
            for (ProjectSubject projectSubject : subject.getProjectSubjects()) {
                Project project = projectSubject.getProject();
                if (project.getActivityStatus() != QuestionnaireActivityStatus.EDITING) continue;

                ProjectQuestion projectQuestion = new ProjectQuestion();
                projectQuestion.setProject(project);
                projectQuestion.setQuestion(question);
                project.getProjectQuestions().add(projectQuestion);

                projectService.update(project.getId(), project);
            }
        }

        return created;
    }

    @Override
    public Optional<Question> getById(UUID id) {
        return questionRepository.findById(id);
    }

    @Override
    public List<Question> getAll() {
        return questionRepository.findAll();
    }

    @Override
    public Question update(UUID id, Question entity) {
        Question existing = questionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Question not found"));

        existing.setText(entity.getText());
        existing.setSubjects(entity.getSubjects());
        existing.setType(entity.getType());

        return questionRepository.save(existing);
    }

    @Override
    public void deleteById(UUID id) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Question not found"));

        boolean linkedToLockedProject = question.getProjectQuestions()
                .stream()
                .map(ProjectQuestion::getProject)
                .anyMatch(project -> project.getActivityStatus() != QuestionnaireActivityStatus.EDITING);

        if (linkedToLockedProject) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Question cannot be deleted because it's used in an active project"
            );
        }

        Set<ProjectQuestion> projectQuestionsCopy = new HashSet<>(question.getProjectQuestions());

        for (ProjectQuestion projectQuestion : projectQuestionsCopy) {
            Project project = projectQuestion.getProject();
            if (project.getActivityStatus() != QuestionnaireActivityStatus.EDITING)
                continue;

            project.getProjectQuestions().remove(projectQuestion);
            question.getProjectQuestions().remove(projectQuestion);
            projectQuestionRepository.delete(projectQuestion);
        }

        questionRepository.delete(question);
    }

    @Override
    public boolean deleteIfExists(UUID uuid) {
        Optional<Question> question = this.getById(uuid);
        if (question.isEmpty())
            return false;

        questionRepository.delete(question.get());

        return true;
    }

    @Override
    public boolean exists(UUID id) {
        return questionRepository.existsById(id);
    }

    @Override
    public long count() {
        return questionRepository.count();
    }
}
