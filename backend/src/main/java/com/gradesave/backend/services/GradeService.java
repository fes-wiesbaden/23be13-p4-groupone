
package com.gradesave.backend.services;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import com.gradesave.backend.dto.grade.*;
import com.gradesave.backend.dto.performance.PerformanceDto;
import com.gradesave.backend.dto.subject.SubjectDto;
import com.gradesave.backend.models.*;
import com.gradesave.backend.repositories.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

/**
 * @author: Michael Holl
 * <p>
 *   Service to load grade overview options, load and edit grades
 * </p>
 *
 **/
/*

 */
@Service
public class GradeService implements CrudService<Grade, UUID>{

    private final GradeRepository gradeRepository;
    private final PerformanceRepository performanceRepository;
    private final UserRepository userRepository;
    private final SubjectRepository subjectRepository;
    private final ProjectSubjectRepository projectSubjectRepository;
    private final ProjectRepository projectRepository;
    private final CourseService courseService;
    private final UserService userService;

    public GradeService(PerformanceRepository performanceRepository,
                        GradeRepository gradeRepository,
                        UserRepository userRepository,
                        SubjectRepository subjectRepository,
                        ProjectSubjectRepository projectSubjectRepository, ProjectRepository projectRepository, CourseService courseService, UserService userService) {
        this.performanceRepository = performanceRepository;
        this.gradeRepository = gradeRepository;
        this.userRepository = userRepository;
        this.subjectRepository = subjectRepository;
        this.projectSubjectRepository = projectSubjectRepository;
        this.projectRepository = projectRepository;
        this.courseService = courseService;
        this.userService = userService;
    }

    @Override
    public Grade create(Grade entity) {
        return gradeRepository.save(entity);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Grade> getById(UUID id) {
        return gradeRepository.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Grade> getAll() {
        return gradeRepository.findAll();
    }

    @Override
    public Grade update(UUID id, Grade patch) {
        Grade existing = gradeRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found: " + id));
        existing.setGrade(patch.getGrade());
        return gradeRepository.save(existing);
    }

    @Override
    public void deleteById(UUID id) {
        if (!gradeRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found: " + id);
        }
        gradeRepository.deleteById(id);
    }

    @Override
    public boolean deleteIfExists(UUID uuid) {
        return false;
    }

    @Override
    @Transactional(readOnly = true)
    public boolean exists(UUID id) {
        return gradeRepository.existsById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public long count() {
        return gradeRepository.count();
    }


    public GradeOverviewDto loadGradeOverview(UUID projectId, UUID groupId, UUID userId) {
        List<SubjectDto> subjects = loadSubjectsWithPerformances(projectId);

        User user = userRepository.findById(userId).orElse(null);

        Project project = projectRepository.findById(projectId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Projekt nicht gefunden"));

        // if user is no member in project, load no user and grades
        if (user != null && user.getRole() == Role.ADMIN) {
            if (!projectRepository.existsUserInProject(userId, projectId)) {
                return new GradeOverviewDto(subjects, List.of(), courseService.getTeachers(project.getCourse()));
            }
        }

        // load students
        List<User> users = (groupId != null)
                ? getStudentsInGroup(groupId)
                : getStudentsInProject(projectId);

        List<UserGradeDto> userGrades = getGradesForUsers(projectId, users);

        return new GradeOverviewDto(subjects, userGrades, courseService.getTeachers(project.getCourse()));
    }

    public List<SubjectDto> loadSubjectsWithPerformances(UUID projectId) {
        return projectSubjectRepository.findByProjectId(projectId).stream()
                .map(projectSubject -> {
                    List<PerformanceDto> performances = performanceRepository
                            .findByProjectSubjectId(projectSubject.getId())
                            .stream()
                            .map(p -> {
                                return new PerformanceDto(
                                        p.getId(),
                                        p.getName(),
                                        p.getShortName(),
                                        p.getWeight(),
                                        p.getAssignedTeacher().getId()
                                );
                            })
                            .toList();
                    return new SubjectDto(projectSubject.getId(), projectSubject.getSubject().getName(), projectSubject.getSubject().getShortName(), projectSubject.getDuration(), projectSubject.getSubject().isLearningField(), performances);
                })
                .sorted((s1, s2) -> Boolean.compare(s1.isLearningField(), s2.isLearningField()))
                .toList();
    }

    public List<User> getStudentsInGroup(UUID groupId) {
        return userRepository.findByGroups_IdAndRole(groupId, Role.STUDENT);
    }

    public List<User> getStudentsInProject(UUID projectId) {
        return userRepository.findByCourses_Projects_IdAndRole(projectId, Role.STUDENT);
    }

    public List<UserGradeDto> getGradesForUsers(UUID projectId, List<User> users) {
        List<Grade> allGrades = gradeRepository.findByProjectId(projectId);
        //collect every grade for a performance
        return users.stream()
                .map(user -> {

                    // collect all grades of project for every user
                    List<GradeDto> subjectAndPerformanceGrades = allGrades.stream()
                            .filter(grade -> grade.getStudent().getId().equals(user.getId()))
                            .map(grade -> new GradeDto(
                                    grade.getPerformance() != null ? grade.getPerformance().getId() : null,
                                    grade.getProjectSubject() != null ? grade.getProjectSubject().getId() : null,
                                    grade.getGrade()
                            ))
                            .toList();

                    String groupName = user.getGroups().stream()
                            .filter(g -> g.getProject().getId().equals(projectId))
                            .map(Group::getName)
                            .findFirst()
                            .orElse("");

                    return new UserGradeDto(user.getId(), user.getFirstName(), user.getLastName(), groupName, subjectAndPerformanceGrades);
                })
                .sorted((u1, u2) -> u1.group().compareToIgnoreCase(u2.group()))
                .toList();
    }

    @Transactional
    public void saveGradeOverview(List<UpdateGradeRequest> newGradeRequest) {
        newGradeRequest.forEach(r -> {
            // Skip if studentId is null
            if (r.studentId() == null) {
                return;
            }

            User currentUser = userService.getCurrentUser().orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "not logged in"));

            User student = userService.getById(r.studentId()).orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "not logged in"));

            r.grades().forEach(g -> {
                // Try to find an existing grade for this student and performance

                if (g.performanceId() == null) {

                    Optional<ProjectSubject> projectSubjectOpt = projectSubjectRepository.findById(g.projectSubjectId());
                    if (projectSubjectOpt.isEmpty()) {
                        return;
                    }

                    ProjectSubject projectSubject = projectSubjectOpt.get();

                    List<Grade> grades = gradeRepository.findByProjectId(projectSubject.getProject().getId());

                    Optional<Grade> myGradeOpt = grades.stream().filter(mg -> mg.getProjectSubject().getId().equals(g.projectSubjectId())).findFirst();

                    Grade grade;
                    if (myGradeOpt.isEmpty()) {
                        grade = new Grade();
                        grade.setProjectSubject(projectSubject);
                        grade.setStudent(student);
                    } else {
                        grade = myGradeOpt.get();
                    }
                    grade.setGrade(g.grade());
                    gradeRepository.save(grade);

                    return;
                }



                Optional<Performance> performanceOpt = performanceRepository.findById(g.performanceId());

                if (performanceOpt.isEmpty())
                    return;

                Performance performance = performanceOpt.get();

                if (performance.getAssignedTeacher().getId() != currentUser.getId())
                    return;

                Grade grade = gradeRepository.findByStudentIdAndPerformanceIdOrProjectSubjectId(r.studentId(), g.performanceId(), g.projectSubjectId());
                if (grade != null && g.grade() == null) {
                    gradeRepository.deleteById(grade.getId());
                    return;
                }
                // If no existing grade is found, create a new one
                if (grade == null) {
                    grade = new Grade();
                    grade.setPerformance(
                            performanceRepository.findById(g.performanceId())
                                    .orElseThrow(() -> new RuntimeException("performance id not found"))
                    );
                    if (g.projectSubjectId() != null) {
                        grade.setProjectSubject(projectSubjectRepository.findById(g.projectSubjectId())
                                .orElseThrow(() -> new RuntimeException("project subject id not found"))
                        );
                    }
                    grade.setStudent(
                            userRepository.findById(r.studentId())
                                    .orElseThrow(() -> new RuntimeException("student id not found"))
                    );
                }
                grade.setGrade(g.grade());
                // Save or update the grade in the repository
                create(grade);
            });
        });
    }

    public BigDecimal calculateSubjectGrade(List<CalculateSubjectGradeDto> newGrades) {
        BigDecimal total = BigDecimal.ZERO;
        BigDecimal totalWeight = BigDecimal.ZERO;

        for (CalculateSubjectGradeDto gradeWithWeight : newGrades) {
            BigDecimal grade = new BigDecimal(Double.toString(gradeWithWeight.grade()));
            BigDecimal weight = BigDecimal.valueOf(gradeWithWeight.weight())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

            total = total.add(grade.multiply(weight));
            totalWeight = totalWeight.add(weight);
        }

        if (totalWeight.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }

        return total.divide(totalWeight, 2, RoundingMode.HALF_UP);
    }
}
