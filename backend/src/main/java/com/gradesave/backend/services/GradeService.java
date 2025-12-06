
package com.gradesave.backend.services;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
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

    public GradeService(PerformanceRepository performanceRepository,
                        GradeRepository gradeRepository,
                        UserRepository userRepository,
                        SubjectRepository subjectRepository,
                        ProjectSubjectRepository projectSubjectRepository) {
        this.performanceRepository = performanceRepository;
        this.gradeRepository = gradeRepository;
        this.userRepository = userRepository;
        this.subjectRepository = subjectRepository;
        this.projectSubjectRepository = projectSubjectRepository;
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

    public GradeOverviewDto loadGradeOverview(UUID projectId, UUID groupId) {
        // load subjects with performances
        List<SubjectDto> subjects = projectSubjectRepository.findByProjectId(projectId).stream()
                .map(projectSubject -> {
                    List<PerformanceDto> performances = performanceRepository
                            .findByProjectSubjectId(projectSubject.getId())
                            .stream()
                            .map(p -> new PerformanceDto(
                                    p.getId(),
                                    p.getName(),
                                    p.getShortName(),
                                    p.getWeight() * 100
                            ))
                            .toList();
                    return new SubjectDto(projectSubject.getId(), projectSubject.getSubject().getName(), projectSubject.getSubject().getShortName(), projectSubject.getDuration(), projectSubject.getSubject().isLearningField(), performances);
                })
                .toList();

        // load students
        List<User> users = (groupId != null)
                ? userRepository.findByGroups_IdAndRole(groupId, Role.STUDENT)
                : userRepository.findByCourses_Projects_IdAndRole(projectId, Role.STUDENT);

        // load all grades for project
        List<Grade> allGrades = gradeRepository.findByProjectId(projectId);
        //collect every grade for a performance
        List<UserGradeDto> userGrades = users.stream()
                .map(user -> {

                    // collect all grades of project for every user
                    List<GradeDto> subjectAndPerformanceGrades = allGrades.stream()
                            .filter(grade -> grade.getStudent().getId().equals(user.getId()))
                            .map(grade -> new GradeDto(
                                    grade != null && grade.getPerformance() != null ? grade.getPerformance().getId() : null,
                                    grade != null && grade.getProjectSubject() != null ? grade.getProjectSubject().getId() : null,
                                    grade != null ? grade.getGrade() : null
                            ))
                            .toList();

                    String groupName = user.getGroups().stream()
                            .filter(g -> g.getProject().getId().equals(projectId))
                            .map(Group::getName)
                            .findFirst()
                            .orElse("");

                    return new UserGradeDto(user.getId(), user.getFirstName(), user.getLastName(), groupName, subjectAndPerformanceGrades);
                })
                .sorted((u1, u2) -> u1.lastName().compareToIgnoreCase(u2.lastName()))
                .toList();

        return new GradeOverviewDto(subjects, userGrades);
    }

    @Transactional
    public void saveGradeOverview(List<UpdateGradeRequest> newGradeRequest) {
        newGradeRequest.forEach(r -> {
            // Skip if studentId is null
            if (r.studentId() == null) {
                return;
            }

            r.grades().forEach(g -> {
                // Try to find an existing grade for this student and performance
                Grade grade = gradeRepository.findByStudentIdAndPerformanceIdOrProjectSubjectId(r.studentId(), g.performanceId(), g.projectSubjectId());
                if (grade != null && g.grade() == null) {
                    gradeRepository.deleteById(grade.getId());
                    return;
                }
                // If no existing grade is found, create a new one
                if (grade == null) {
                    grade = new Grade();
                    if (g.performanceId() != null) {
                        grade.setPerformance(
                                performanceRepository.findById(g.performanceId())
                                        .orElseThrow(() -> new RuntimeException("performance id not found"))
                        );
                    }
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
            BigDecimal grade = gradeWithWeight.grade();
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
