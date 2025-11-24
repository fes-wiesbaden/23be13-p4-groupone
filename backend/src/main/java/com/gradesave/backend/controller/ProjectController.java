package com.gradesave.backend.controller;

import com.gradesave.backend.dto.group.GroupMembersDTO;
import com.gradesave.backend.dto.project.*;
import com.gradesave.backend.dto.user.StudentDTO;
import com.gradesave.backend.models.Course;
import com.gradesave.backend.models.Group;
import com.gradesave.backend.models.Project;
import com.gradesave.backend.models.User;
import com.gradesave.backend.services.CourseService;
import com.gradesave.backend.services.ProjectService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("api/project")
public class ProjectController {
    private final ProjectService projectService;
    private final CourseService courseService;

    public ProjectController(ProjectService projectService, CourseService courseService) {
        this.projectService = projectService;
        this.courseService = courseService;
    }

    @PostMapping("create")
    public ResponseEntity<CreateProjectResponseDTO> createProject(@Valid @RequestBody CreateProjectDTO req) {
        System.out.println(req.courseId());
        List<String> errors = new ArrayList<>();
        Optional<Course> course = courseService.getById(req.courseId());
        if (course.isEmpty()) {
            errors.add("Course not found: " + req.courseId());
            for (Course kurs : courseService.getAll()) {
                System.out.println(kurs.getId());
            }
            return ResponseEntity.badRequest().body(new CreateProjectResponseDTO(errors));
        }

        Project project = new Project();
        project.setProjectStart(LocalDate.of(req.projectStart().year(), req.projectStart().month(), req.projectStart().day()));
        project.setName(req.projectName());
        project.setCourse(course.get());
        Project createdProject = projectService.create(project);

        Course projectCourse = createdProject.getCourse();
        User teacher = projectCourse.getClassTeacher();

        ProjectSummaryDTO projectSummaryDTO = new ProjectSummaryDTO(
                project.getId(),
                project.getName(),
                new ProjectStartDateDTO(
                        project.getProjectStart().getYear(),
                        project.getProjectStart().getMonthValue(),
                        project.getProjectStart().getDayOfMonth()
                ),
                projectCourse.getId(),
                projectCourse.getCourseName(),
                teacher.getFirstName() + " " + teacher.getLastName()
        );

        return ResponseEntity.status(201).body(new CreateProjectResponseDTO(projectSummaryDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable UUID id) {
        if (!projectService.deleteIfExists(id)) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectDetailDTO> getProject(@PathVariable UUID id) {
        Optional<Project> projectOpt = projectService.getById(id);

        if (projectOpt.isEmpty())
            return ResponseEntity.notFound().build();

        Project project = projectOpt.get();

        ProjectDetailDTO dto = new ProjectDetailDTO(
                project.getId(),
                project.getName(),
                project.getCourse().getId(),
                project.getCourse().getCourseName(),
                project.getCourse().getClassTeacher().getId(),
                project.getCourse().getClassTeacher().getFirstName() + " " + project.getCourse().getClassTeacher().getLastName(),
                project.getGroups().stream()
                        .map(g -> new GroupMembersDTO(
                                g.getId(),
                                g.getName(),
                                g.getUsers().stream()
                                        .map(u -> new StudentDTO(
                                                u.getId(),
                                                u.getUsername(),
                                                u.getFirstName(),
                                                u.getLastName()
                                        ))
                                        .toArray(StudentDTO[]::new)
                        ))
                        .toArray(GroupMembersDTO[]::new)
        );

        return ResponseEntity.ok(dto);
    }

    @GetMapping("/all")
    public ResponseEntity<ProjectSummaryDTO[]> getProjects() {
        List<Project> projects = projectService.getAll();

//        public record ProjectSummaryDTO(UUID projectId, String projectName, ProjectStartDateDTO startDate, UUID courseId, String courseName, String teacherName) {

//        public record ProjectStartDateDTO(int year, int month, int day) { }

        ProjectSummaryDTO[] dto = projects.stream()
                .map(p -> new ProjectSummaryDTO(
                        p.getId(),
                        p.getName(),
                        new ProjectStartDateDTO(
                                p.getProjectStart().getYear(),
                                p.getProjectStart().getMonthValue(),
                                p.getProjectStart().getDayOfMonth()
                        ),
                        p.getCourse().getId(),
                        p.getCourse().getCourseName(),
                        p.getCourse().getClassTeacher().getFirstName() + " " + p.getCourse().getClassTeacher().getLastName()
                ))
                .toArray(ProjectSummaryDTO[]::new);

        return ResponseEntity.ok(dto);
    }
}
