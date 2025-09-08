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
import java.util.stream.Collectors;

/**
 * @author: Michael Holl
 * <p>
 *   Business logic for subjects
 * </p>
 *
 **/
@Service
@Transactional
public class QuestionService implements CrudService<Question, Long>{
    private final SubjectRepository subjectRepository;
    private final QuestionRepository questionRepository;

    public QuestionService(SubjectRepository subjectRepository, QuestionRepository repository) {
        this.subjectRepository = subjectRepository;
        this.questionRepository = repository;
    }

    @Transactional
    @Override
    public Question create(Question question) {
        Set<Long> subjectIds = question.getSubjects().stream()
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
    public Optional<Question> getById(Long aLong) {
        return Optional.empty();
    }

    @Override
    public List<Question> getAll() {
        return questionRepository.findAll();
    }

    @Override
    public Question update(Long aLong, Question entity) {
        return null;
    }

    @Override
    public void deleteById(Long aLong) {

    }

    @Override
    public boolean exists(Long aLong) {
        return false;
    }

    @Override
    public long count() {
        return 0;
    }
}
