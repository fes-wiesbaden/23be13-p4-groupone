// created by Michael Holl on 07.09.2025
package com.gradesave.backend.services;

import com.gradesave.backend.models.Question;
import com.gradesave.backend.models.Subject;
import com.gradesave.backend.repositories.QuestionRepository;
import com.gradesave.backend.repositories.SubjectRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
public class QuestionService implements CrudService<Question, Long>{
    private final SubjectRepository subjectRepository;
    private final QuestionRepository questionRepository;
    private Long questionId;
    private String text;
    private String type;
    private List<Long> subjectIds;


    public QuestionService(SubjectRepository subjectRepository, QuestionRepository repository) {
        this.subjectRepository = subjectRepository;
        this.questionRepository = repository;
    }

    @Override
    public Question create(Question question) {
        Question newQuestion = questionRepository.save(question);
        Set<Subject> allSubjects = newQuestion.getSubjects().stream()
                .map(s -> subjectRepository.findById(s.getId())
                        .orElseThrow(() -> new RuntimeException("Subject not found: " + s.getId())))
                .collect(Collectors.toSet());

        newQuestion.setSubjects(allSubjects);
        return newQuestion;
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
