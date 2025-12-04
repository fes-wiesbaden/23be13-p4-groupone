package com.gradesave.backend.controller;

import com.gradesave.backend.dto.group.GroupCreateWithMembersDTO;
import com.gradesave.backend.dto.group.GroupMembersDTO;
import com.gradesave.backend.dto.group.ProjectDetailGroupDTO;
import com.gradesave.backend.dto.project.*;
import com.gradesave.backend.dto.user.StudentDTO;
import com.gradesave.backend.models.*;
import com.gradesave.backend.services.*;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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
@RequestMapping("/api/project")
public class ProjectController {
    private final ProjectService projectService;
    private final CourseService courseService;
    private final UserService userService;
    private final GroupService groupService;
    private final SubjectService subjectService;
    private final AnswerService answerService;

    public ProjectController(ProjectService projectService, CourseService courseService, UserService userService, GroupService groupService, SubjectService subjectService, AnswerService answerService) {
        this.projectService = projectService;
        this.courseService = courseService;
        this.userService = userService;
        this.groupService = groupService;
        this.subjectService = subjectService;
        this.answerService = answerService;
    }

    private Integer getUnassignedStudentsAmount(Project project) {
        Course course = project.getCourse();
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
                        .toArray(GroupMembersDTO[]::new),
                ProjectSubjectDTO.fromEntity(project)
        );

        return ResponseEntity.ok(dto);
    }

    @GetMapping("/all")
    public ResponseEntity<ProjectSummaryDTO[]> getProjects() {
        List<Project> projects = projectService.getAll();


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

    @PostMapping("{projectId}/add/subject")
    public ResponseEntity<Map<String, String>> addSubjectToProject(@PathVariable UUID projectId, @Valid @RequestBody AddSubjectToProjectDTO req) {
        Optional<Project> projectOpt = projectService.getById(projectId);
        if (projectOpt.isEmpty())
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Project not found: " + projectId));

        Optional<Subject> subjectOpt = subjectService.getById(req.subjectId());
        if (subjectOpt.isEmpty())
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Subject not found: " + req.subjectId()));

        Project project = projectOpt.get();
        Subject subject = subjectOpt.get();


        boolean alreadyExists = project.getProjectSubjects().stream()
                .anyMatch(ps -> ps.getSubject().getId().equals(req.subjectId()));

        if (alreadyExists)
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Subject is already added to the project"));

        ProjectSubject projectSubject = new ProjectSubject();
        projectSubject.setSubject(subject);
        projectSubject.setProject(project);
        projectSubject.setDuration(req.duration());

        project.getProjectSubjects().add(projectSubject);

        projectService.update(projectId, project);

        return ResponseEntity.ok(Map.of("message", "Subject added successfully"));
    }

    @PostMapping("{projectId}/remove/subject/{subjectId}")
    public ResponseEntity<Map<String, String>> removeSubjectFromProject(@PathVariable UUID projectId, @PathVariable UUID subjectId) {
        Optional<Project> projectOpt = projectService.getById(projectId);
        if (projectOpt.isEmpty())
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Project not found: " + projectId));

        Project project = projectOpt.get();

        Optional<ProjectSubject> projectSubjectOpt = project.getProjectSubjects().stream()
                .filter(ps -> ps.getSubject().getId().equals(subjectId)).findFirst();

        if (projectSubjectOpt.isEmpty())
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Subject is not part of the project"));

        ProjectSubject projectSubject = projectSubjectOpt.get();

        project.getProjectSubjects().remove(projectSubject);

        projectService.update(projectId, project);

        return ResponseEntity.ok(Map.of("message", "Subject removed successfully"));
    }

    @GetMapping("with-questions")
    public ResponseEntity<ProjectWithQuestionsDTO[]> getWithQuestions() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated() ||
                authentication.getPrincipal() instanceof String && authentication.getPrincipal().equals("anonymousUser")) {
            return ResponseEntity.status(401).build();
        }

        String username = authentication.getName();
        User user = userService.findByUsername(username);

        if (user == null)
            return ResponseEntity.notFound().build();

        Role role = user.getRole();
        List<Project> projects = null;

        if (role == Role.STUDENT) {
            projects = user.getCourses().stream()
                    .flatMap(c -> c.getProjects().stream())
                    .filter(p -> !p.getProjectQuestions().isEmpty())
                    .toList();


        } else if (role == Role.ADMIN) {
            projects = projectService.getAll().stream()
                    .filter(p -> !p.getProjectQuestions().isEmpty())
                    .toList();
        }


        if (projects == null)
            return ResponseEntity.notFound().build();

        ProjectWithQuestionsDTO[] dtos = ProjectWithQuestionsDTO.fromEntity(projects);
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("{projectId}/fragebogen")
    public ResponseEntity<Void> getFragebogen(@PathVariable UUID projectId) {
        Optional<Project> projectOpt = projectService.getById(projectId);
        if (projectOpt.isEmpty())
            return ResponseEntity.notFound().build();

        return ResponseEntity.ok().build();
    }

    @PutMapping("{projectId}/fragebogen")
    public ResponseEntity<Void> putFragebogen(@PathVariable UUID projectId, @Valid @RequestBody FragebogenPutRequestDTO req) {
        Optional<Project> projectOpt = projectService.getById(projectId);
        if (projectOpt.isEmpty())
            return ResponseEntity.notFound().build();

        projectService.updateFragebogen(projectOpt.get(), req.questions(), req.status());

        return ResponseEntity.ok().build();
    }

    @GetMapping("fragebögen")
    public ResponseEntity<FragebogenResponse> getAllFragebögen() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated() ||
                authentication.getPrincipal() instanceof String && authentication.getPrincipal().equals("anonymousUser")) {
            return ResponseEntity.status(401).build();
        }

        String username = authentication.getName();
        User user = userService.findByUsername(username);

        if (user == null)
            return ResponseEntity.notFound().build();

        Role role = user.getRole();

        List<Course> courses = courseService.getAllWithUser(user);


        List<FragebogenCourseDTO> dtoCourses = courses.stream()
                .map(c -> new FragebogenCourseDTO(
                        c.getId(),
                        c.getCourseName(),
                        c.getProjects().stream()
                                .map(p -> new FragebogenProjectDTO(
                                        p.getId(),
                                        p.getName(),
                                        p.getProjectQuestions().size()
                                ))
                                .toList()
                ))
                .toList();

        return ResponseEntity.ok(new FragebogenResponse(dtoCourses));
    }

    @GetMapping("{projectId}/myGroup")
    public ResponseEntity<ProjectQuestionnaireDetailDTO> getMyGroup(@PathVariable UUID projectId) {
        Optional<User> userOpt = userService.getCurrentUser();
        if (userOpt.isEmpty())
            return ResponseEntity.notFound().build();

        User user = userOpt.get();
        Optional<Project> projectOpt = projectService.getById(projectId);
        if (projectOpt.isEmpty())
            return ResponseEntity.notFound().build();

        Project project = projectOpt.get();

        Optional<Group> groupOpt = project.getGroups().stream()
                .filter(g -> g.getUsers().stream()
                        .anyMatch(u -> u.getId().equals(user.getId()))
                )
                .findFirst();

        if (groupOpt.isEmpty())
            return ResponseEntity.notFound().build();

        Group group = groupOpt.get();

        QuestionnaireActivityStatus status = project.getActivityStatus();

        if (status == QuestionnaireActivityStatus.READY_FOR_ANSWERING && answerService.hasUserSubmitted(project, user))
            status = QuestionnaireActivityStatus.ARCHIVED;

        ProjectQuestionnaireDetailDTO dto = ProjectQuestionnaireDetailDTO.fromEntity(project, List.of(group), status);

        return ResponseEntity.ok(dto);
    }

    @GetMapping("{projectId}/groups")
    public ResponseEntity<ProjectQuestionnaireDetailDTO> getGroups(@PathVariable UUID projectId) {
        Optional<Project> projectOpt = projectService.getById(projectId);
        if (projectOpt.isEmpty())
            return ResponseEntity.notFound().build();

        Project project = projectOpt.get();

        ProjectQuestionnaireDetailDTO dto = ProjectQuestionnaireDetailDTO.fromEntity(project, project.getGroups().stream().toList(), project.getActivityStatus());

        return ResponseEntity.ok(dto);
    }

    @PostMapping("{projectId}/fragebogenAnswers")
    public ResponseEntity<?> postUserAnswers(@PathVariable UUID projectId, @Valid @RequestBody ProjectQuestionAnswersDTO req) {
        Optional<Project> projectOpt = projectService.getById(projectId);
        if (projectOpt.isEmpty())
            return ResponseEntity.notFound().build();

        Project project = projectOpt.get();

        Optional<User> userOpt = userService.getCurrentUser();
        if (userOpt.isEmpty())
            return ResponseEntity.notFound().build();

        User user = userOpt.get();

        if (answerService.hasUserSubmitted(project, user))
            return ResponseEntity.status(401).body("Already Submitted");

        if (!answerService.answerQuestions(project, user, req))
            return ResponseEntity.status(401).body("FAiled to answer questions");

        return ResponseEntity.ok().build();
    }

//            const res = await fetch(`${API_CONFIG.BASE_URL}/api/project/${projectId}/fragebogenAnswers`, {
}
