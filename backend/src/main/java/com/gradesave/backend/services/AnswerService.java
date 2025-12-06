package com.gradesave.backend.services;

import com.gradesave.backend.dto.project.*;
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
    private static final Logger log = LoggerFactory.getLogger(AnswerService.class);
    private static final int NO_GRADE_SELECTED = 255;

    private final AnswerRepository answerRepository;
    private final QuestionService questionService;
    private final UserService userService;

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

        if (hasUserSubmitted(project, user)) {
            return false;
        }

        Optional<Group> myGroupOpt = project.getGroups().stream()
                .filter(g -> g.getUsers().contains(user)).findFirst();

        if (myGroupOpt.isEmpty()) {
            return false;
        }

        Set<ProjectQuestion> projectQuestions = project.getProjectQuestions();

        if (req.questions().length != projectQuestions.size()) {
            return false;
        }


        List<Answer> answersToSave = new ArrayList<>();

        for (ProjectQuestionAnswerDTO q : req.questions()) {

            Optional<Question> questionOpt = questionService.getById(q.questionId());
            if (questionOpt.isEmpty()) {
                return false;
            }
            Question question = questionOpt.get();

            Optional<ProjectQuestion> projectQuestionOpt = projectQuestions.stream()
                    .filter(pq -> pq.getQuestion().getId().equals(question.getId()))
                    .findFirst();

            if (projectQuestionOpt.isEmpty()) {
                return false;
            }

            ProjectQuestion projectQuestion = projectQuestionOpt.get();

            for (StudentAnswerDTO a : q.answers()) {

                Optional<User> recipientOpt = userService.getById(a.studentId());
                if (recipientOpt.isEmpty()) {
                    return false;
                }

                Object ans = a.answer();

                if (question.getType() == QuestionType.GRADE && !(ans instanceof Number)) {
                    return false;
                }

                if (question.getType() == QuestionType.TEXT && !(ans instanceof String)) {
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
            }
        }

        answerRepository.saveAll(answersToSave);

        return true;
    }

    public DetailedProjectQuestionAnswersDTO getDetailedAnswersForGroup(Project project, Group group) {
        List<Answer> projectAnswers = answerRepository.findByProjectId(project.getId());

        Set<UUID> groupMemberIds = group.getUsers().stream()
                .map(User::getId)
                .collect(Collectors.toSet());

        List<Answer> groupAnswers = projectAnswers.stream()
                .filter(a -> groupMemberIds.contains(a.getAuthor().getId()) && groupMemberIds.contains(a.getRecipient().getId()))
                .toList();

        Map<UUID, List<Answer>> answersByQuestion = groupAnswers.stream()
                .collect(Collectors.groupingBy(a -> a.getProjectQuestion().getQuestion().getId()));

        DetailedProjectQuestionAnswerDTO[] questionAnswers = answersByQuestion.entrySet().stream()
                .map(entry -> {
                    UUID questionId = entry.getKey();
                    List<Answer> answers = entry.getValue();

                    DetailedStudentAnswerDTO[] studentAnswers = answers.stream()
                            .map(a -> new DetailedStudentAnswerDTO(
                                    a.getAuthor().getId(),
                                    a.getRecipient().getId(),
                                    a.getAnswerGrade() != null ? a.getAnswerGrade() : a.getAnswerText()
                            ))
                            .toArray(DetailedStudentAnswerDTO[]::new);

                    return new DetailedProjectQuestionAnswerDTO(questionId, studentAnswers);
                })
                .toArray(DetailedProjectQuestionAnswerDTO[]::new);

        return new DetailedProjectQuestionAnswersDTO(questionAnswers);
    }

    public ProjectGradeAveragesDTO getGradeAveragesForProject(Project project) {
        List<Answer> projectAnswers = answerRepository.findByProjectId(project.getId());

        List<Answer> gradeAnswers = projectAnswers.stream()
                .filter(a -> a.getProjectQuestion().getQuestion().getType() == QuestionType.GRADE)
                .toList();

        Map<UUID, List<Answer>> answersByRecipient = gradeAnswers.stream()
                .collect(Collectors.groupingBy(a -> a.getRecipient().getId()));

        StudentGradeAverageDTO[] averages = answersByRecipient.entrySet().stream()
                .map(entry -> {
                    UUID studentId = entry.getKey();
                    List<Answer> studentAnswers = entry.getValue();

                    User student = studentAnswers.getFirst().getRecipient();

                    List<Integer> grades = studentAnswers.stream()
                            .map(Answer::getAnswerGrade)
                            .filter(g -> g != null && g != NO_GRADE_SELECTED)
                            .toList();

                    Double averageGrade = grades.isEmpty() ? null : 
                            grades.stream().mapToInt(Integer::intValue).average().orElse(0.0);

                    List<Integer> selfGrades = studentAnswers.stream()
                            .filter(a -> a.getAuthor().getId().equals(a.getRecipient().getId()))
                            .map(Answer::getAnswerGrade)
                            .filter(g -> g != null && g != NO_GRADE_SELECTED)
                            .toList();

                    Double selfAssessment = selfGrades.isEmpty() ? null :
                            selfGrades.stream().mapToInt(Integer::intValue).average().orElse(0.0);

                    List<Integer> peerGrades = studentAnswers.stream()
                            .filter(a -> !a.getAuthor().getId().equals(a.getRecipient().getId()))
                            .map(Answer::getAnswerGrade)
                            .filter(g -> g != null && g != NO_GRADE_SELECTED)
                            .toList();

                    Double peerAssessment = peerGrades.isEmpty() ? null :
                            peerGrades.stream().mapToInt(Integer::intValue).average().orElse(0.0);

                    return new StudentGradeAverageDTO(
                            studentId,
                            student.getFirstName() + " " + student.getLastName(),
                            averageGrade,
                            grades.size(),
                            selfAssessment,
                            peerAssessment
                    );
                })
                .toArray(StudentGradeAverageDTO[]::new);

        return new ProjectGradeAveragesDTO(averages);
    }
}
