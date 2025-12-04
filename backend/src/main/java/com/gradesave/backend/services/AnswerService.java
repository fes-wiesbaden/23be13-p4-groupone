package com.gradesave.backend.services;

import com.gradesave.backend.dto.project.ProjectQuestionAnswerDTO;
import com.gradesave.backend.dto.project.ProjectQuestionAnswersDTO;
import com.gradesave.backend.dto.project.StudentAnswerDTO;
import com.gradesave.backend.models.*;
import com.gradesave.backend.repositories.AnswerRepository;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class AnswerService {
    private final AnswerRepository answerRepository;
    private final QuestionService questionService;
    private final UserService userService;
    private static final Logger log = LoggerFactory.getLogger(AnswerService.class);

    public AnswerService(AnswerRepository answerRepository, QuestionService questionService, UserService userService) {
        this.answerRepository = answerRepository;
        this.questionService = questionService;
        this.userService = userService;
    }


    public boolean hasUserSubmitted(Project project, User user) {
        List<Answer> answers = answerRepository.findByAuthorIdAndProjectId(user.getId(), project.getId());

        return !answers.isEmpty();
    }

    public boolean answerQuestions(Project project, User user, @Valid ProjectQuestionAnswersDTO req) {
        log.info("answerQuestions called for user {}", user.getId());

        if (hasUserSubmitted(project, user)) {
            log.warn("User {} already submitted", user.getId());
            return false;
        }

        Optional<Group> myGroupOpt = project.getGroups().stream()
                .filter(g -> g.getUsers().contains(user)).findFirst();

        if (myGroupOpt.isEmpty()) {
            log.warn("User {} not in any group", user.getId());
            return false;
        }

        Group myGroup = myGroupOpt.get();
        log.info("User is in group {}", myGroup.getId());

        Set<ProjectQuestion> projectQuestions = project.getProjectQuestions();

        if (req.questions().length != projectQuestions.size()) {
            log.warn("Question count mismatch: req={} expected={}",
                    req.questions().length, projectQuestions.size());
            return false;
        }


        List<Answer> answersToSave = new ArrayList<>();

        for (ProjectQuestionAnswerDTO q : req.questions()) {
            log.info("Checking question {}", q.questionId());

//            if (q.answers().length != myGroup.getUsers().size()) {
//                log.warn("Answer count mismatch for question {}", q.questionId());
//                return false;
//            }

            Optional<Question> questionOpt = questionService.getById(q.questionId());
            if (questionOpt.isEmpty()) {
                log.warn("Question {} not found in DB", q.questionId());
                return false;
            }
            Question question = questionOpt.get();

            Optional<ProjectQuestion> projectQuestionOpt = projectQuestions.stream()
                    .filter(pq -> pq.getQuestion().getId().equals(question.getId()))
                    .findFirst();

            if (projectQuestionOpt.isEmpty()) {
                log.warn("ProjectQuestion not found for question {}", question.getId());
                return false;
            }

            ProjectQuestion projectQuestion = projectQuestionOpt.get();

            for (StudentAnswerDTO a : q.answers()) {
                log.info("Checking answer by {} for {}", user.getId(), a.studentId());

                Optional<User> recipientOpt = userService.getById(a.studentId());
                if (recipientOpt.isEmpty()) {
                    log.warn("Recipient {} not found", a.studentId());
                    return false;
                }

                Object ans = a.answer();
                log.info("Answer object type = {}", ans.getClass().getName());

                if (question.getType() == QuestionType.GRADE && !(ans instanceof Number)) {
                    log.warn("Expected grade but got: {}", ans);
                    return false;
                }

                if (question.getType() == QuestionType.TEXT && !(ans instanceof String)) {
                    log.warn("Expected text but got: {}", ans);
                    return false;
                }

                Answer answer = new Answer();
                answer.setAuthor(user);
                answer.setRecipient(recipientOpt.get());
                answer.setProjectQuestion(projectQuestion);

                if (question.getType() == QuestionType.TEXT) {
                    answer.setAnswerText((String) ans);
                } else {
                    answer.setAnswerGrade(((Number) ans).intValue());
                }

                answersToSave.add(answer);

                log.info("Saving answer: qType={} recipient={} value={}",
                        question.getType(),
                        recipientOpt.get().getId(),
                        ans
                );
            }
        }

        log.info("Saving {} answers", answersToSave.size());
        answerRepository.saveAll(answersToSave);

        return true;
    }
}
