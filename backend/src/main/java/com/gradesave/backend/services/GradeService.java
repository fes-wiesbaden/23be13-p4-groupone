
package com.gradesave.backend.services;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.gradesave.backend.dto.grade.GradeDto;
import com.gradesave.backend.dto.grade.GradeOverviewDto;
import com.gradesave.backend.dto.grade.UpdateGradeRequest;
import com.gradesave.backend.dto.grade.UserGradeDto;
import com.gradesave.backend.dto.performance.PerformanceDto;
import com.gradesave.backend.dto.subject.SubjectDto;
import com.gradesave.backend.models.*;
import com.gradesave.backend.repositories.PerformanceRepository;
import com.gradesave.backend.repositories.SubjectRepository;
import com.gradesave.backend.repositories.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;


import com.gradesave.backend.repositories.GradeRepository;

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

    public GradeService(PerformanceRepository performanceRepository,
                        GradeRepository gradeRepository,
                        UserRepository userRepository,
                        SubjectRepository subjectRepository) {
        this.performanceRepository = performanceRepository;
        this.gradeRepository = gradeRepository;
        this.userRepository = userRepository;
        this.subjectRepository = subjectRepository;
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
        List<SubjectDto> subjects = subjectRepository.findByProjectSubjects_Project_Id(projectId).stream()
                .map(subject -> {
                    List<PerformanceDto> performances = performanceRepository
                            .findByProjectSubject_Subject_Id(subject.getId())
                            .stream()
                            .map(p -> new PerformanceDto(p.getId(), p.getName(), p.getShortName(), p.getWeight() * 100))
                            .toList();
                    return new SubjectDto(subject.getId(), subject.getName(), subject.getShortName(), performances);
                })
                .toList();

        // load students
        List<User> users = (groupId != null)
                ? userRepository.findByGroups_IdAndRole(groupId, Role.STUDENT)
                : userRepository.findByCourses_Projects_IdAndRole(projectId, Role.STUDENT);

        // load all performances in current project
        List<Performance> projectPerformances = performanceRepository.findByProjectSubject_Project_Id(projectId);

        // load all grades in current project
        List<Grade> allGrades = gradeRepository.findByProjectId(projectId);
        List<UserGradeDto> userGrades = users.stream()
                .map(user -> {
                    List<GradeDto> grades = projectPerformances.stream()
                            .map(performance -> {
                                Grade grade = allGrades.stream()
                                        .filter(g -> g.getStudent().getId().equals(user.getId()) && g.getPerformance().getId().equals(performance.getId()))
                                        .findFirst()
                                        .orElse(null);
                                return new GradeDto(
                                        grade != null ? grade.getId() : null,
                                        performance.getId(),
                                        grade != null ? grade.getGrade() : null
                                );
                            })
                            .toList();

                    String groupName = user.getGroups().stream()
                            .filter(g -> g.getProject().getId().equals(projectId))
                            .map(Group::getName)
                            .findFirst()
                            .orElse("");

                    return new UserGradeDto(user.getId(), user.getFirstName(), user.getLastName(), groupName, grades);
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
                // Skip if grade value or performanceId is null
                if (g.grade() == null || g.performanceId() == null) {
                    return;
                }
                // Try to find an existing grade for this student and performance
                Grade grade = gradeRepository.findByPerformanceIdAndStudentId(g.performanceId(), r.studentId());

                // If no existing grade is found, create a new one
                if (grade == null) {
                    grade = new Grade();
                    grade.setPerformance(
                            performanceRepository.findById(g.performanceId())
                                    .orElseThrow(() -> new RuntimeException("performance id not found"))
                    );
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
}
