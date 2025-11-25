package com.gradesave.backend.controller;

import com.gradesave.backend.dto.group.*;
import com.gradesave.backend.dto.user.StudentDTO;
import com.gradesave.backend.models.Course;
import com.gradesave.backend.models.Group;
import com.gradesave.backend.models.Project;
import com.gradesave.backend.models.User;
import com.gradesave.backend.services.CourseService;
import com.gradesave.backend.services.GroupService;
import com.gradesave.backend.services.ProjectService;
import com.gradesave.backend.services.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * @author: Paul Geisthardt
 * <p>
 * Controller for handling Groups
 * </p>
 **/

@RestController
@RequestMapping("api/group")
public class GroupController {
    private final GroupService groupService;
    private final CourseService courseService;
    private final ProjectService projectService;
    private final UserService userService;

    public GroupController(GroupService groupService, CourseService courseService, ProjectService projectService, UserService userService, UserService userService1) {
        this.groupService = groupService;
        this.courseService = courseService;
        this.projectService = projectService;
        this.userService = userService1;
    }

    @PostMapping("create")
    public ResponseEntity<GroupMembersDTO> createGroup(@RequestBody GroupCreateDTO req) {
        Optional<Project> projectOpt = projectService.getById(req.projectId());
        if (projectOpt.isEmpty())
            return ResponseEntity.notFound().build();

        Group group = new Group();
        group.setName(req.groupName());
        group.setProject(projectOpt.get());

        Group created = groupService.create(group);

        return ResponseEntity.ok(new GroupMembersDTO(created.getId(), created.getName(), new StudentDTO[0]));
    }

    @PostMapping("add")
    public ResponseEntity<GroupMembersDTO> addStudentToGroup(@RequestBody GroupAddStudentDTO req) {
        Optional<Group> groupOpt = groupService.getById(req.groupId());
        if (groupOpt.isEmpty())
            return ResponseEntity.badRequest().build();

        Group group = groupOpt.get();
        Project project = group.getProject();

        Optional<User> userOpt = userService.getById(req.studentId());
        if (userOpt.isEmpty())
            return ResponseEntity.badRequest().build();

        User user = userOpt.get();

        if(groupService.existsUserInProject(user.getId(), project.getId()))
            return ResponseEntity.badRequest().build();

        group.getUsers().add(user);
        Group updated = groupService.update(group.getId(), group);

        GroupMembersDTO dto = new GroupMembersDTO(updated.getId(), updated.getName(), updated.getUsers().stream().map(u -> new StudentDTO(u.getId(), u.getUsername(), u.getFirstName(), u.getLastName())).toArray(StudentDTO[]::new));

        return ResponseEntity.ok(dto);
    }

    @PostMapping("create/fromClass")
    public ResponseEntity<List<GroupMembersDTO>> createGroupsFromClass(@Valid @RequestBody GroupCreationFromCourseRequestDTO req) {
        Optional<Course> courseOpt = courseService.getById(req.courseId());
        if (courseOpt.isEmpty())
            return ResponseEntity.badRequest().build();

        Optional<Project> projectOpt = projectService.getById(req.projectId());
        if (projectOpt.isEmpty())
            return ResponseEntity.badRequest().build();

        Project project = projectOpt.get();

        groupService.deleteGroupsByProject(project.getId());

        Course course = courseOpt.get();
        List<User> users = new ArrayList<>(course.getUsers());
        Collections.shuffle(users);

        List<Group> groups = new ArrayList<>();
        for (int i = 1; i <= req.groupAmount(); ++i) {
            Group group = new Group();
            group.setProject(project);
            group.setName("Group " + i);
            group.setUsers(new HashSet<>());
            groups.add(group);
        }


        int groupIndex = 0;
        for (User user : users) {
            groups.get(groupIndex).getUsers().add(user);
            groupIndex = (groupIndex + 1) % req.groupAmount();
        }

        List<Group> createdGroups = groupService.createGroups(groups);

        List<GroupMembersDTO> response = createdGroups.stream()
                .map(g -> new GroupMembersDTO(
                        g.getId(),
                        g.getName(),
                        g.getUsers().stream()
                                .map(u -> new StudentDTO(u.getId(), u.getUsername(), u.getFirstName(), u.getLastName()))
                                .toArray(StudentDTO[]::new)
                ))
                .toList();

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("{id}")
    public ResponseEntity<Void> deleteGroup(@Valid @PathVariable UUID id) {
        Optional<Group> groupOpt = groupService.getById(id);
        if (groupOpt.isEmpty())
            return ResponseEntity.badRequest().build();

        Group group = groupOpt.get();
        group.getUsers().clear();
        Group updated = groupService.update(id, group);

        if (!groupService.deleteIfExists(updated.getId()))
            return ResponseEntity.internalServerError().build();

        return ResponseEntity.ok().build();
    }

    @PostMapping("remove")
    public ResponseEntity<GroupMembersDTO> removeStudent(@Valid @RequestBody RemoveStudentDTO req) {
        Optional<Group> groupOpt = groupService.getById(req.groupId());
        if (groupOpt.isEmpty())
            return ResponseEntity.badRequest().build();

        Group group = groupOpt.get();

        Optional<User> userOpt = userService.getById(req.studentId());
        if (userOpt.isEmpty())
            return ResponseEntity.badRequest().build();

        User user = userOpt.get();

        if (!group.getUsers().contains(user)) {
            return ResponseEntity.ok(
                    new GroupMembersDTO(
                            group.getId(),
                            group.getName(),
                            group.getUsers()
                                    .stream()
                                    .map(s -> new StudentDTO(
                                            s.getId(),
                                            s.getUsername(),
                                            s.getFirstName(),
                                            s.getLastName()
                                    ))
                                    .toArray(StudentDTO[]::new)
                    )
            );
        }

        group.getUsers().remove(user);

        Group updated = groupService.update(req.groupId(), group);

        return ResponseEntity.ok(
                new GroupMembersDTO(
                        updated.getId(),
                        updated.getName(),
                        updated.getUsers()
                                .stream()
                                .map(s -> new StudentDTO(
                                        s.getId(),
                                        s.getUsername(),
                                        s.getFirstName(),
                                        s.getLastName()
                                ))
                                .toArray(StudentDTO[]::new)
                )
        );
    }
}
