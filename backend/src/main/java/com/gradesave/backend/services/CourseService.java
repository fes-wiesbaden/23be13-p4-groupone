package com.gradesave.backend.services;

import com.gradesave.backend.dto.course.CoursePatchRequestDTO;
import com.gradesave.backend.dto.course.CourseSelectionWithMembersDto;
import com.gradesave.backend.dto.group.GroupMembersDTO;
import com.gradesave.backend.dto.project.ProjectSelectionWithMembersDto;
import com.gradesave.backend.dto.user.StudentDTO;
import com.gradesave.backend.dto.user.TeacherDTO;
import com.gradesave.backend.models.Course;
import com.gradesave.backend.dto.course.UpdateCourseRequest;
import com.gradesave.backend.dto.course.CourseSelectionDto;
import com.gradesave.backend.dto.group.GroupSelectionDto;
import com.gradesave.backend.dto.project.ProjectSelectionDto;
import com.gradesave.backend.models.Project;
import com.gradesave.backend.models.Role;
import com.gradesave.backend.models.User;
import com.gradesave.backend.repositories.CourseRepository;
import com.gradesave.backend.repositories.GroupRepository;
import com.gradesave.backend.repositories.ProjectRepository;

import com.gradesave.backend.repositories.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * @author: Noah Bach, Daniel Hess
 *          <p>
 *          Service for managing Course entities. Provides basic CRUD and query
 *          operations.
 *          </p>
 *          Updated by Daniel Hess
 */

@Service
@Transactional
public class CourseService {

    private final CourseRepository courseRepository;
    private final UserRepository userRepo;
    private final ProjectRepository projectRepository;
    private final GroupRepository groupRepository;

    public CourseService(CourseRepository repo, UserRepository userRepo, ProjectRepository projectRepository,
            GroupRepository groupRepository) {
        this.courseRepository = repo;
        this.userRepo = userRepo;
        this.projectRepository = projectRepository;
        this.groupRepository = groupRepository;
    }

    public Optional<Course> getByIdTest(UUID id) {
        return courseRepository.findByIdTest(id);
    }

    public Course createOrUpdate(Course entity) {
        return courseRepository.save(entity);
    }

    @Transactional(readOnly = true)
    public Optional<Course> getById(UUID id) {
        return courseRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public List<Course> getAll() {
        return courseRepository.findAll();
    }

    public Course update(UUID id, UpdateCourseRequest req) {
        var existing = courseRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found: " + id));

        if (req.teacherId() != null) {
            Optional<User> teacher = userRepo.findById(req.teacherId());
            if (teacher.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Teacher not found: " + req.teacherId());
            }

            existing.setClassTeacher(teacher.get());
        } else {
            existing.setClassTeacher(null);
        }

        existing.setCourseName(req.courseName());

        return courseRepository.save(existing);
    }

    public boolean addStudent(Course course, User student) {
        if (!userRepo.existsById(student.getId()))
            return false;
        if (!courseRepository.existsById(course.getId()))
            return false;

        course.getUsers().add(student);
        courseRepository.save(course);
        return true;
    }

    public void deleteById(UUID id) {
        if (!courseRepository.existsById(id))
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found: " + id);
        courseRepository.deleteById(id);
    }

    public Optional<Course> getByName(String name) {
        return courseRepository.findByCourseName(name);
    }

    public boolean isExistedByName(String name) {
        return getByName(name).isPresent();
    }

    @Transactional(readOnly = true)
    public boolean exists(UUID id) {
        return courseRepository.existsById(id);
    }

    @Transactional(readOnly = true)
    public long count() {
        return courseRepository.count();
    }

    public boolean removeUserFromAllCourses(UUID userId) {
        Optional<User> userTemp = userRepo.findById(userId);
        if (userTemp.isEmpty())
            return false;

        User user = userTemp.get();
        List<Course> courses = courseRepository.findAllByUserId(userId);

        boolean removed = true;
        for (Course course : courses) {
            if (!course.getUsers().remove(user))
                removed = false;

            courseRepository.save(course);
        }

        return removed;
    }

    public void patchCourse(Course course, @Valid CoursePatchRequestDTO req) {
        if (req.classTeacherId() != null) {
            if (req.classTeacherId().isEmpty()) {
                User user = course.getClassTeacher();
                if (user != null) {
                    course.getUsers().remove(user);
                    course.setClassTeacher(null);
                }
            } else {
                try {
                    UUID teacherId = UUID.fromString(req.classTeacherId());
                    Optional<User> teacherOpt = userRepo.findById(teacherId);
                    if (teacherOpt.isPresent()) {
                        course.setClassTeacher(teacherOpt.get());
                        course.getUsers().add(teacherOpt.get());
                    }
                } catch (IllegalArgumentException e) {
                    throw new IllegalArgumentException("Invalid Teacher UUID: " + req.classTeacherId());
                }
            }
        }

        if (req.courseName() != null) {
            course.setCourseName(req.courseName());
        }

        courseRepository.save(course);
    }

    public List<CourseSelectionDto> findGradeOverviewOptions(UUID userId) {
        User currentUser = userRepo.findById(userId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found: " + userId));

        List<Course> courses;
        // admins can select all classes
        if (currentUser.getRole() == Role.ADMIN) {
            courses = getAll();
        } else {
            courses = courseRepository.findAllByUserId(currentUser.getId());
        }

        return courses.stream().map(course -> {

            List<ProjectSelectionDto> projectDtos = projectRepository.findByCourseId(course.getId()).stream()
                    .map(project -> {
                        List<GroupSelectionDto> groupDtos = groupRepository.findByProjectId(project.getId()).stream()
                                .map(group -> new GroupSelectionDto(
                                        group.getId(),
                                        group.getName()))
                                .toList();

                        return new ProjectSelectionDto(
                                project.getId(),
                                project.getName(),
                                project.getProjectStart(),
                                groupDtos,
                                canEditGrades(currentUser, project));
                    }).toList();

            return new CourseSelectionDto(
                    course.getId(),
                    course.getCourseName(),
                    projectDtos);

        }).toList();
    }

    private boolean canEditGrades(User user, Project project) {
        if (user.getRole() != Role.ADMIN && user.getRole() != Role.TEACHER)
            return false;

        if (user.getRole() == Role.TEACHER && project.getCourse().getClassTeacher().getId() != user.getId())
            return false;

        return true;
    }

    public List<Course> getAllWithUser(User user) {
        return courseRepository.findAllByUserId(user.getId());
    }

    public List<TeacherDTO> getTeachers(Course course) {
        return course.getUsers().stream().filter(u -> u.getRole() == Role.ADMIN || u.getRole() == Role.TEACHER).map(TeacherDTO::fromEntity).toList();
    }
}
