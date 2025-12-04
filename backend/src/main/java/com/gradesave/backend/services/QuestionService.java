package com.gradesave.backend.services;

import com.gradesave.backend.models.Question;
import com.gradesave.backend.models.Subject;
import com.gradesave.backend.repositories.QuestionRepository;
import com.gradesave.backend.repositories.SubjectRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    public QuestionService(SubjectRepository subjectRepository, QuestionRepository repository) {
        this.subjectRepository = subjectRepository;
        this.questionRepository = repository;
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

        return questionRepository.save(question);
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
        questionRepository.deleteById(id);
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
