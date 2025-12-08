package com.gradesave.backend.services;

import com.gradesave.backend.dto.course.CoursePatchRequestDTO;
import com.gradesave.backend.dto.course.CourseSelectionDto;
import com.gradesave.backend.dto.course.UpdateCourseRequest;
import com.gradesave.backend.models.Course;
import com.gradesave.backend.models.Group;
import com.gradesave.backend.models.Project;
import com.gradesave.backend.models.Role;
import com.gradesave.backend.models.User;
import com.gradesave.backend.repositories.CourseRepository;
import com.gradesave.backend.repositories.GroupRepository;
import com.gradesave.backend.repositories.ProjectRepository;
import com.gradesave.backend.repositories.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for CourseService
 * Tests business logic methods including student management, course patching, and grade overview options
 */
@ExtendWith(MockitoExtension.class)
class CourseServiceTest {

    @Mock
    private CourseRepository courseRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private GroupRepository groupRepository;

    @InjectMocks
    private CourseService courseService;

    private Course testCourse;
    private UUID testCourseId;
    private User testTeacher;
    private User testStudent;

    @BeforeEach
    void setUp() {
        testCourseId = UUID.randomUUID();
        
        testTeacher = new User();
        testTeacher.setId(UUID.randomUUID());
        testTeacher.setUsername("teacher1");
        testTeacher.setRole(Role.TEACHER);
        testTeacher.setFirstName("John");
        testTeacher.setLastName("Teacher");
        
        testStudent = new User();
        testStudent.setId(UUID.randomUUID());
        testStudent.setUsername("student1");
        testStudent.setRole(Role.STUDENT);
        testStudent.setFirstName("Jane");
        testStudent.setLastName("Student");
        
        testCourse = new Course();
        testCourse.setId(testCourseId);
        testCourse.setCourseName("Test Course");
        testCourse.setClassTeacher(testTeacher);
        testCourse.setUsers(new HashSet<>());
    }

    @Test
    void testCreateOrUpdate_Success() {
        when(courseRepository.save(any(Course.class))).thenReturn(testCourse);

        Course result = courseService.createOrUpdate(testCourse);

        assertNotNull(result);
        assertEquals("Test Course", result.getCourseName());
        verify(courseRepository, times(1)).save(testCourse);
    }

    @Test
    void testGetById_CourseExists() {
        when(courseRepository.findById(testCourseId)).thenReturn(Optional.of(testCourse));

        Optional<Course> result = courseService.getById(testCourseId);

        assertTrue(result.isPresent());
        assertEquals("Test Course", result.get().getCourseName());
        verify(courseRepository, times(1)).findById(testCourseId);
    }

    @Test
    void testGetById_CourseNotExists() {
        UUID nonExistentId = UUID.randomUUID();
        when(courseRepository.findById(nonExistentId)).thenReturn(Optional.empty());

        Optional<Course> result = courseService.getById(nonExistentId);

        assertFalse(result.isPresent());
    }

    @Test
    void testGetAll_Success() {
        Course course2 = new Course();
        course2.setCourseName("Course 2");
        List<Course> courses = Arrays.asList(testCourse, course2);
        when(courseRepository.findAll()).thenReturn(courses);

        List<Course> result = courseService.getAll();

        assertEquals(2, result.size());
        verify(courseRepository, times(1)).findAll();
    }

    @Test
    void testUpdate_WithTeacher_Success() {
        UpdateCourseRequest request = new UpdateCourseRequest("Updated Course", testTeacher.getId());
        when(courseRepository.findById(testCourseId)).thenReturn(Optional.of(testCourse));
        when(userRepository.findById(testTeacher.getId())).thenReturn(Optional.of(testTeacher));
        when(courseRepository.save(any(Course.class))).thenReturn(testCourse);

        Course result = courseService.update(testCourseId, request);

        assertNotNull(result);
        verify(courseRepository).save(any(Course.class));
    }

    @Test
    void testUpdate_WithNullTeacher_Success() {
        UpdateCourseRequest request = new UpdateCourseRequest("Updated Course", null);
        when(courseRepository.findById(testCourseId)).thenReturn(Optional.of(testCourse));
        when(courseRepository.save(any(Course.class))).thenReturn(testCourse);

        Course result = courseService.update(testCourseId, request);

        assertNotNull(result);
        assertNull(testCourse.getClassTeacher());
        verify(courseRepository).save(any(Course.class));
    }

    @Test
    void testUpdate_CourseNotFound() {
        UUID nonExistentId = UUID.randomUUID();
        UpdateCourseRequest request = new UpdateCourseRequest("Updated Course", null);
        when(courseRepository.findById(nonExistentId)).thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class, () -> {
            courseService.update(nonExistentId, request);
        });
    }

    @Test
    void testUpdate_TeacherNotFound() {
        UUID nonExistentTeacherId = UUID.randomUUID();
        UpdateCourseRequest request = new UpdateCourseRequest("Updated Course", nonExistentTeacherId);
        when(courseRepository.findById(testCourseId)).thenReturn(Optional.of(testCourse));
        when(userRepository.findById(nonExistentTeacherId)).thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class, () -> {
            courseService.update(testCourseId, request);
        });
    }

    @Test
    void testAddStudent_Success() {
        when(userRepository.existsById(testStudent.getId())).thenReturn(true);
        when(courseRepository.existsById(testCourse.getId())).thenReturn(true);
        when(courseRepository.save(any(Course.class))).thenReturn(testCourse);

        boolean result = courseService.addStudent(testCourse, testStudent);

        assertTrue(result);
        assertTrue(testCourse.getUsers().contains(testStudent));
        verify(courseRepository, times(1)).save(testCourse);
    }

    @Test
    void testAddStudent_UserNotExists() {
        when(userRepository.existsById(testStudent.getId())).thenReturn(false);

        boolean result = courseService.addStudent(testCourse, testStudent);

        assertFalse(result);
        assertFalse(testCourse.getUsers().contains(testStudent));
    }

    @Test
    void testAddStudent_CourseNotExists() {
        when(userRepository.existsById(testStudent.getId())).thenReturn(true);
        when(courseRepository.existsById(testCourse.getId())).thenReturn(false);

        boolean result = courseService.addStudent(testCourse, testStudent);

        assertFalse(result);
        assertFalse(testCourse.getUsers().contains(testStudent));
    }

    @Test
    void testDeleteById_CourseExists() {
        when(courseRepository.existsById(testCourseId)).thenReturn(true);
        doNothing().when(courseRepository).deleteById(testCourseId);

        courseService.deleteById(testCourseId);

        verify(courseRepository, times(1)).existsById(testCourseId);
        verify(courseRepository, times(1)).deleteById(testCourseId);
    }

    @Test
    void testDeleteById_CourseNotExists() {
        UUID nonExistentId = UUID.randomUUID();
        when(courseRepository.existsById(nonExistentId)).thenReturn(false);

        assertThrows(ResponseStatusException.class, () -> {
            courseService.deleteById(nonExistentId);
        });
    }

    @Test
    void testGetByName_Success() {
        when(courseRepository.findByCourseName("Test Course")).thenReturn(Optional.of(testCourse));

        Optional<Course> result = courseService.getByName("Test Course");

        assertTrue(result.isPresent());
        assertEquals("Test Course", result.get().getCourseName());
    }

    @Test
    void testIsExistedByName_True() {
        when(courseRepository.findByCourseName("Test Course")).thenReturn(Optional.of(testCourse));

        boolean exists = courseService.isExistedByName("Test Course");

        assertTrue(exists);
    }

    @Test
    void testIsExistedByName_False() {
        when(courseRepository.findByCourseName("Nonexistent Course")).thenReturn(Optional.empty());

        boolean exists = courseService.isExistedByName("Nonexistent Course");

        assertFalse(exists);
    }

    @Test
    void testExists_True() {
        when(courseRepository.existsById(testCourseId)).thenReturn(true);

        boolean exists = courseService.exists(testCourseId);

        assertTrue(exists);
    }

    @Test
    void testExists_False() {
        UUID nonExistentId = UUID.randomUUID();
        when(courseRepository.existsById(nonExistentId)).thenReturn(false);

        boolean exists = courseService.exists(nonExistentId);

        assertFalse(exists);
    }

    @Test
    void testCount_Success() {
        when(courseRepository.count()).thenReturn(5L);

        long count = courseService.count();

        assertEquals(5L, count);
    }

    @Test
    void testRemoveUserFromAllCourses_Success() {
        testCourse.getUsers().add(testStudent);
        when(userRepository.findById(testStudent.getId())).thenReturn(Optional.of(testStudent));
        when(courseRepository.findAllByUserId(testStudent.getId())).thenReturn(Arrays.asList(testCourse));
        when(courseRepository.save(any(Course.class))).thenReturn(testCourse);

        boolean result = courseService.removeUserFromAllCourses(testStudent.getId());

        assertTrue(result);
        assertFalse(testCourse.getUsers().contains(testStudent));
        verify(courseRepository, times(1)).save(testCourse);
    }

    @Test
    void testRemoveUserFromAllCourses_UserNotFound() {
        UUID nonExistentId = UUID.randomUUID();
        when(userRepository.findById(nonExistentId)).thenReturn(Optional.empty());

        boolean result = courseService.removeUserFromAllCourses(nonExistentId);

        assertFalse(result);
        verify(courseRepository, never()).save(any(Course.class));
    }

    @Test
    void testRemoveUserFromAllCourses_MultipleCoursesWithFailure() {
        Course course2 = new Course();
        course2.setUsers(new HashSet<>());
        
        testCourse.getUsers().add(testStudent);
        course2.getUsers().add(testStudent);
        
        when(userRepository.findById(testStudent.getId())).thenReturn(Optional.of(testStudent));
        when(courseRepository.findAllByUserId(testStudent.getId())).thenReturn(Arrays.asList(testCourse, course2));
        when(courseRepository.save(any(Course.class))).thenReturn(testCourse);

        boolean result = courseService.removeUserFromAllCourses(testStudent.getId());

        assertTrue(result);
        verify(courseRepository, times(2)).save(any(Course.class));
    }

    @Test
    void testPatchCourse_SetTeacher_Success() {
        CoursePatchRequestDTO request = new CoursePatchRequestDTO(testTeacher.getId().toString(), null);
        when(userRepository.findById(testTeacher.getId())).thenReturn(Optional.of(testTeacher));
        when(courseRepository.save(any(Course.class))).thenReturn(testCourse);

        courseService.patchCourse(testCourse, request);

        assertEquals(testTeacher, testCourse.getClassTeacher());
        assertTrue(testCourse.getUsers().contains(testTeacher));
        verify(courseRepository, times(1)).save(testCourse);
    }

    @Test
    void testPatchCourse_RemoveTeacher_Success() {
        testCourse.setClassTeacher(testTeacher);
        testCourse.getUsers().add(testTeacher);
        
        CoursePatchRequestDTO request = new CoursePatchRequestDTO("", null);
        when(courseRepository.save(any(Course.class))).thenReturn(testCourse);

        courseService.patchCourse(testCourse, request);

        assertNull(testCourse.getClassTeacher());
        assertFalse(testCourse.getUsers().contains(testTeacher));
        verify(courseRepository, times(1)).save(testCourse);
    }

    @Test
    void testPatchCourse_UpdateCourseName_Success() {
        CoursePatchRequestDTO request = new CoursePatchRequestDTO(null, "New Course Name");
        when(courseRepository.save(any(Course.class))).thenReturn(testCourse);

        courseService.patchCourse(testCourse, request);

        assertEquals("New Course Name", testCourse.getCourseName());
        verify(courseRepository, times(1)).save(testCourse);
    }

    @Test
    void testPatchCourse_InvalidTeacherUUID_ThrowsException() {
        CoursePatchRequestDTO request = new CoursePatchRequestDTO("invalid-uuid", null);

        assertThrows(IllegalArgumentException.class, () -> {
            courseService.patchCourse(testCourse, request);
        });
    }

    @Test
    void testFindGradeOverviewOptions_Success() {
        Project project = new Project();
        project.setId(UUID.randomUUID());
        project.setName("Test Project");
        project.setProjectStart(LocalDate.now());

        Group group = new Group();
        group.setId(UUID.randomUUID());
        group.setName("Test Group");

        when(courseRepository.findAll()).thenReturn(Arrays.asList(testCourse));
        when(projectRepository.findByCourseId(testCourse.getId())).thenReturn(Arrays.asList(project));
        when(groupRepository.findByProjectId(project.getId())).thenReturn(Arrays.asList(group));

        List<CourseSelectionDto> result = courseService.findGradeOverviewOptions();

        assertNotNull(result);
        assertEquals(1, result.size());
        CourseSelectionDto courseDto = result.get(0);
        assertEquals(testCourse.getId(), courseDto.id());
        assertEquals(testCourse.getCourseName(), courseDto.name());
        assertEquals(1, courseDto.projects().size());
        assertEquals(1, courseDto.projects().get(0).groups().size());
        
        verify(courseRepository, times(1)).findAll();
        verify(projectRepository, times(1)).findByCourseId(testCourse.getId());
        verify(groupRepository, times(1)).findByProjectId(project.getId());
    }

    @Test
    void testFindGradeOverviewOptions_EmptyResults() {
        when(courseRepository.findAll()).thenReturn(Collections.emptyList());

        List<CourseSelectionDto> result = courseService.findGradeOverviewOptions();

        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(courseRepository, times(1)).findAll();
    }

    @Test
    void testGetByIdTest_Success() {
        when(courseRepository.findByIdTest(testCourseId)).thenReturn(Optional.of(testCourse));

        Optional<Course> result = courseService.getByIdTest(testCourseId);

        assertTrue(result.isPresent());
        assertEquals(testCourseId, result.get().getId());
    }
}
