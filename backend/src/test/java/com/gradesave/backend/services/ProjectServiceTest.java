package com.gradesave.backend.services;

import com.gradesave.backend.models.Course;
import com.gradesave.backend.models.Group;
import com.gradesave.backend.models.Project;
import com.gradesave.backend.models.ProjectSubject;
import com.gradesave.backend.repositories.CourseRepository;
import com.gradesave.backend.repositories.GroupRepository;
import com.gradesave.backend.repositories.ProjectRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for ProjectService
 * Tests CRUD operations and business logic for project management
 */
@ExtendWith(MockitoExtension.class)
class ProjectServiceTest {

    @Mock
    private CourseRepository courseRepository;

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private GroupRepository groupRepository;

    @InjectMocks
    private ProjectService projectService;

    private Project testProject;
    private UUID testProjectId;
    private Course testCourse;

    @BeforeEach
    void setUp() {
        testProjectId = UUID.randomUUID();
        
        testCourse = new Course();
        testCourse.setId(UUID.randomUUID());
        testCourse.setCourseName("Test Course");
        
        testProject = new Project();
        testProject.setId(testProjectId);
        testProject.setName("Test Project");
        testProject.setProjectStart(LocalDate.now());
        testProject.setCourse(testCourse);
        testProject.setGroups(new HashSet<>());
        testProject.setProjectSubjects(new HashSet<>());
    }

    @Test
    void testCreate_Success() {
        when(projectRepository.save(any(Project.class))).thenReturn(testProject);

        Project result = projectService.create(testProject);

        assertNotNull(result);
        assertEquals("Test Project", result.getName());
        verify(projectRepository, times(1)).save(testProject);
    }

    @Test
    void testGetById_ProjectExists() {
        when(projectRepository.findById(testProjectId)).thenReturn(Optional.of(testProject));

        Optional<Project> result = projectService.getById(testProjectId);

        assertTrue(result.isPresent());
        assertEquals("Test Project", result.get().getName());
        verify(projectRepository, times(1)).findById(testProjectId);
    }

    @Test
    void testGetById_ProjectNotExists() {
        UUID nonExistentId = UUID.randomUUID();
        when(projectRepository.findById(nonExistentId)).thenReturn(Optional.empty());

        Optional<Project> result = projectService.getById(nonExistentId);

        assertFalse(result.isPresent());
    }

    @Test
    void testGetAll_Success() {
        Project project2 = new Project();
        project2.setName("Project 2");
        List<Project> projects = Arrays.asList(testProject, project2);
        when(projectRepository.findAll()).thenReturn(projects);

        List<Project> result = projectService.getAll();

        assertEquals(2, result.size());
        verify(projectRepository, times(1)).findAll();
    }

    @Test
    void testUpdate_ProjectExists() {
        LocalDate newDate = LocalDate.now().plusDays(7);
        Project updatedProject = new Project();
        updatedProject.setName("Updated Project");
        updatedProject.setProjectStart(newDate);
        updatedProject.setGroups(new HashSet<>());
        updatedProject.setProjectSubjects(new HashSet<>());
        
        when(projectRepository.findById(testProjectId)).thenReturn(Optional.of(testProject));
        when(projectRepository.save(any(Project.class))).thenReturn(testProject);

        Project result = projectService.update(testProjectId, updatedProject);

        assertNotNull(result);
        verify(projectRepository, times(1)).findById(testProjectId);
        verify(projectRepository, times(1)).save(testProject);
    }

    @Test
    void testUpdate_ProjectNotExists() {
        UUID nonExistentId = UUID.randomUUID();
        Project updatedProject = new Project();
        updatedProject.setName("Updated Project");
        when(projectRepository.findById(nonExistentId)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> {
            projectService.update(nonExistentId, updatedProject);
        });
        verify(projectRepository, times(1)).findById(nonExistentId);
        verify(projectRepository, never()).save(any(Project.class));
    }

    @Test
    void testUpdate_WithGroups() {
        Group group = new Group();
        group.setId(UUID.randomUUID());
        group.setName("Test Group");
        Set<Group> groups = new HashSet<>();
        groups.add(group);
        
        Project updatedProject = new Project();
        updatedProject.setName("Updated Project");
        updatedProject.setProjectStart(testProject.getProjectStart());
        updatedProject.setGroups(groups);
        updatedProject.setProjectSubjects(new HashSet<>());
        
        when(projectRepository.findById(testProjectId)).thenReturn(Optional.of(testProject));
        when(projectRepository.save(any(Project.class))).thenReturn(testProject);

        Project result = projectService.update(testProjectId, updatedProject);

        assertNotNull(result);
        verify(projectRepository, times(1)).save(testProject);
    }

    @Test
    void testUpdate_WithProjectSubjects() {
        ProjectSubject projectSubject = new ProjectSubject();
        projectSubject.setId(UUID.randomUUID());
        Set<ProjectSubject> projectSubjects = new HashSet<>();
        projectSubjects.add(projectSubject);
        
        Project updatedProject = new Project();
        updatedProject.setName("Updated Project");
        updatedProject.setProjectStart(testProject.getProjectStart());
        updatedProject.setGroups(new HashSet<>());
        updatedProject.setProjectSubjects(projectSubjects);
        
        when(projectRepository.findById(testProjectId)).thenReturn(Optional.of(testProject));
        when(projectRepository.save(any(Project.class))).thenReturn(testProject);

        Project result = projectService.update(testProjectId, updatedProject);

        assertNotNull(result);
        verify(projectRepository, times(1)).save(testProject);
    }

    @Test
    void testDeleteById_Success() {
        doNothing().when(projectRepository).deleteById(testProjectId);

        projectService.deleteById(testProjectId);

        verify(projectRepository, times(1)).deleteById(testProjectId);
    }

    @Test
    void testDeleteIfExists_ProjectExists() {
        when(projectRepository.findById(testProjectId)).thenReturn(Optional.of(testProject));
        doNothing().when(projectRepository).delete(testProject);

        boolean result = projectService.deleteIfExists(testProjectId);

        assertTrue(result);
        verify(projectRepository, times(1)).findById(testProjectId);
        verify(projectRepository, times(1)).delete(testProject);
    }

    @Test
    void testDeleteIfExists_ProjectNotExists() {
        UUID nonExistentId = UUID.randomUUID();
        when(projectRepository.findById(nonExistentId)).thenReturn(Optional.empty());

        boolean result = projectService.deleteIfExists(nonExistentId);

        assertFalse(result);
        verify(projectRepository, times(1)).findById(nonExistentId);
        verify(projectRepository, never()).delete(any(Project.class));
    }

    @Test
    void testExists_True() {
        when(projectRepository.existsById(testProjectId)).thenReturn(true);

        boolean exists = projectService.exists(testProjectId);

        assertTrue(exists);
        verify(projectRepository, times(1)).existsById(testProjectId);
    }

    @Test
    void testExists_False() {
        UUID nonExistentId = UUID.randomUUID();
        when(projectRepository.existsById(nonExistentId)).thenReturn(false);

        boolean exists = projectService.exists(nonExistentId);

        assertFalse(exists);
        verify(projectRepository, times(1)).existsById(nonExistentId);
    }

    @Test
    void testCount_Success() {
        when(projectRepository.count()).thenReturn(10L);

        long count = projectService.count();

        assertEquals(10L, count);
        verify(projectRepository, times(1)).count();
    }
}
