package com.gradesave.backend.controller;

import com.gradesave.backend.dto.group.GroupCreateWithMembersDTO;
import com.gradesave.backend.dto.group.GroupMembersDTO;
import com.gradesave.backend.dto.group.ProjectDetailGroupDTO;
import com.gradesave.backend.dto.project.*;
import com.gradesave.backend.dto.user.StudentDTO;
import com.gradesave.backend.models.*;
import com.gradesave.backend.services.CourseService;
import com.gradesave.backend.services.GroupService;
import com.gradesave.backend.services.ProjectService;
import com.gradesave.backend.services.UserService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

/**
 * @author: Paul Geisthardt
 * <p>
 * Controller for handling Projects
 * </p>
 **/

@RestController
@RequestMapping("api/project")
public class ProjectController {
    private final ProjectService projectService;
    private final CourseService courseService;
    private final UserService userService;
    private final GroupService groupService;

    public ProjectController(ProjectService projectService, CourseService courseService, UserService userService, GroupService groupService) {
        this.projectService = projectService;
        this.courseService = courseService;
        this.userService = userService;
        this.groupService = groupService;
    }

    private Integer getUnassignedStudentsAmount(Project project) {
        Course course= project.getCourse();
        long totalStudents = course.getUsers().stream()
                .filter(u -> u.getRole() == Role.STUDENT)
                .count();

        long assignedStudents = project.getGroups().stream()
                .flatMap(g -> g.getUsers().stream())
                .map(User::getId)
                .distinct()
                .count();

        return (int) (totalStudents - assignedStudents);
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
                projectCourse.getId(),
                projectCourse.getCourseName(),
                teacher.getId(),
                teacher.getFirstName() + " " + teacher.getLastName(),
                project.getGroups().size(),
                getUnassignedStudentsAmount(project),
                new ProjectStartDateDTO(
                        project.getProjectStart().getYear(),
                        project.getProjectStart().getMonthValue(),
                        project.getProjectStart().getDayOfMonth()
                )
        );

        return ResponseEntity.status(201).body(new CreateProjectResponseDTO(projectSummaryDTO));
    }

    @PatchMapping("{id}")
    public ResponseEntity<Void> updateProject(@PathVariable UUID id, @Valid @RequestBody UpdateProjectDTO req) {
        Optional<Project> projectOpt = projectService.getById(id);

        if (projectOpt.isEmpty())
            return ResponseEntity.badRequest().build();

        Project project = projectOpt.get();

        if (req.projectName() != null && !req.projectName().isBlank()) {
            project.setName(req.projectName());
        }

        Project updatedProject = projectService.update(id, project);

        return ResponseEntity.ok().build();
    }

    @DeleteMapping("delete/{id}")
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
                project.getCourse().getClassTeacher() != null ? project.getCourse().getClassTeacher().getId() : null,
                project.getCourse().getClassTeacher() != null ? project.getCourse().getClassTeacher().getFirstName() + " " + project.getCourse().getClassTeacher().getLastName() : "No Class Teacher",
                new ProjectStartDateDTO(
                        project.getProjectStart().getYear(),
                        project.getProjectStart().getMonthValue(),
                        project.getProjectStart().getDayOfMonth()
                ),
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
                        p.getCourse().getId(),
                        p.getCourse().getCourseName(),
                        p.getCourse().getClassTeacher() != null ? p.getCourse().getClassTeacher().getId() : null,
                        p.getCourse().getClassTeacher() != null ? p.getCourse().getClassTeacher().getFirstName() + " " + p.getCourse().getClassTeacher().getLastName() : "No Class Teacher",
                        p.getGroups().size(),
                        getUnassignedStudentsAmount(p),
                        new ProjectStartDateDTO(
                                p.getProjectStart().getYear(),
                                p.getProjectStart().getMonthValue(),
                                p.getProjectStart().getDayOfMonth()
                        )
                ))
                .toArray(ProjectSummaryDTO[]::new);

        return ResponseEntity.ok(dto);
    }

    @PostMapping("create/full")
    public ResponseEntity<CreateProjectResponseSimpleDTO> createProjectFull(@RequestBody CreateProjectFullDTO req) {
        Optional<Course> courseOpt = courseService.getById(req.courseId());
        if (courseOpt.isEmpty())
            return ResponseEntity.badRequest().build();

        Course course = courseOpt.get();

        Project project = new Project();
        project.setProjectStart(LocalDate.of(req.projectStartDate().year(), req.projectStartDate().month(), req.projectStartDate().day()));
        project.setName(req.projectName());
        project.setCourse(course);
        Project createdProject = projectService.create(project);

        for (GroupCreateWithMembersDTO groupDto : req.groups()) {
            Group group = new Group();
            group.setProject(createdProject);
            group.setName(groupDto.groupName());

            Set<User> students = new HashSet<>();

            for (UUID studentId : groupDto.memberIds()) {
                Optional<User> userOpt = userService.getById(studentId);
                if (userOpt.isEmpty())
                    continue; // maybe catch and report error but for now skip

                User user = userOpt.get();
                if (user.getRole() != Role.STUDENT)
                    continue; // maybe catch and report error but for now skip

                if (user.getCourses().stream().noneMatch(c -> c.getId().equals(req.courseId())))
                    continue; // maybe catch and report error but for now skip

                students.add(user);
            }

            group.setUsers(students);

            groupService.create(group);
        }

        CreateProjectResponseSimpleDTO dto = new CreateProjectResponseSimpleDTO(createdProject.getId());
        return ResponseEntity.ok(dto);
    }

    @PutMapping("{id}/full")
    public ResponseEntity<Void> updateProjectFull(@PathVariable UUID id, @Valid @RequestBody ProjectPutFullRequestDTO req) {
        Optional<Project> projectOpt = projectService.getById(id);
        if (projectOpt.isEmpty())
            return ResponseEntity.notFound().build();

        Project project = projectOpt.get();

        project.setName(req.projectName());
        project.setProjectStart(req.projectStartDate().toLocalDate());

        Map<UUID, Group> existingGroupsMap = new HashMap<>();
        for (Group group : project.getGroups()) {
            existingGroupsMap.put(group.getId(), group);
        }

        Set<UUID> requestedGroupIds = new HashSet<>();
        Set<Group> updatedGroups = new HashSet<>();

        for (ProjectDetailGroupDTO groupDto : req.groups()) {
            requestedGroupIds.add(groupDto.groupId());

            Group group;
            if (existingGroupsMap.containsKey(groupDto.groupId())) {
                group = existingGroupsMap.get(groupDto.groupId());
                group.setName(groupDto.groupName());
            } else {
                group = new Group();
                group.setName(groupDto.groupName());
                group.setProject(project);
            }

            Set<User> members = new HashSet<>();
            for (var memberDto : groupDto.members()) {
                Optional<User> userOpt = userService.getById(memberDto.studentId());
                if (userOpt.isEmpty()) continue;

                User user = userOpt.get();

                if (user.getRole() != Role.STUDENT) continue;
                if (user.getCourses().stream().noneMatch(c -> c.getId().equals(project.getCourse().getId())))
                    continue;

                members.add(user);
            }
            group.setUsers(members);

            if (!existingGroupsMap.containsKey(groupDto.groupId())) {
                group = groupService.create(group);
            } else {
                group = groupService.update(groupDto.groupId(), group);
            }
            
            updatedGroups.add(group);
        }

        for (UUID existingGroupId : existingGroupsMap.keySet()) {
            if (!requestedGroupIds.contains(existingGroupId)) {
                groupService.deleteById(existingGroupId);
            }
        }

        project.getGroups().clear();
        project.getGroups().addAll(updatedGroups);
        projectService.update(id, project);

        return ResponseEntity.ok().build();
    }
}
