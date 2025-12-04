package com.gradesave.backend.services;

import com.gradesave.backend.models.*;
import com.gradesave.backend.repositories.GradeRepository;
import com.gradesave.backend.repositories.PerformanceRepository;
import com.gradesave.backend.repositories.UserRepository;
import com.gradesave.backend.repositories.SubjectRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for GradeService
 */
@ExtendWith(MockitoExtension.class)
class GradeServiceTest {

    @Mock
    private GradeRepository gradeRepository;

    @Mock
    private PerformanceRepository performanceRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private SubjectRepository subjectRepository;

    @InjectMocks
    private GradeService gradeService;

    private Grade testGrade;
    private UUID testGradeId;
    private User testStudent;
    private Performance testPerformance;

    @BeforeEach
    void setUp() {
        testGradeId = UUID.randomUUID();
        
        // Create test student
        testStudent = new User();
        testStudent.setId(UUID.randomUUID());
        testStudent.setUsername("student1");
        testStudent.setRole(Role.STUDENT);

        // Create test performance
        testPerformance = new Performance();
        testPerformance.setId(UUID.randomUUID());
        testPerformance.setName("Test Performance");
        testPerformance.setWeight(0.5);

        // Create test grade
        testGrade = new Grade();
        testGrade.setId(testGradeId);
        testGrade.setGrade(2.0);
        testGrade.setStudent(testStudent);
        testGrade.setPerformance(testPerformance);
    }

    @Test
    void testCreateGrade_Success() {
        // Arrange
        when(gradeRepository.save(any(Grade.class))).thenReturn(testGrade);

        // Act
        Grade createdGrade = gradeService.create(testGrade);

        // Assert
        assertNotNull(createdGrade);
        assertEquals(2.0, createdGrade.getGrade());
        verify(gradeRepository, times(1)).save(testGrade);
    }

    @Test
    void testGetById_GradeExists() {
        // Arrange
        when(gradeRepository.findById(testGradeId)).thenReturn(Optional.of(testGrade));

        // Act
        Optional<Grade> result = gradeService.getById(testGradeId);

        // Assert
        assertTrue(result.isPresent());
        assertEquals(2.0, result.get().getGrade());
        verify(gradeRepository, times(1)).findById(testGradeId);
    }

    @Test
    void testGetById_GradeNotExists() {
        // Arrange
        UUID nonExistentId = UUID.randomUUID();
        when(gradeRepository.findById(nonExistentId)).thenReturn(Optional.empty());

        // Act
        Optional<Grade> result = gradeService.getById(nonExistentId);

        // Assert
        assertFalse(result.isPresent());
        verify(gradeRepository, times(1)).findById(nonExistentId);
    }

    @Test
    void testGetAll_Success() {
        // Arrange
        Grade grade2 = new Grade();
        grade2.setGrade(3.5);
        List<Grade> grades = Arrays.asList(testGrade, grade2);
        when(gradeRepository.findAll()).thenReturn(grades);

        // Act
        List<Grade> result = gradeService.getAll();

        // Assert
        assertEquals(2, result.size());
        verify(gradeRepository, times(1)).findAll();
    }

    @Test
    void testUpdate_GradeExists() {
        // Arrange
        Grade updatedGrade = new Grade();
        updatedGrade.setGrade(3.0);
        
        when(gradeRepository.findById(testGradeId)).thenReturn(Optional.of(testGrade));
        when(gradeRepository.save(any(Grade.class))).thenReturn(testGrade);

        // Act
        Grade result = gradeService.update(testGradeId, updatedGrade);

        // Assert
        assertNotNull(result);
        verify(gradeRepository, times(1)).findById(testGradeId);
        verify(gradeRepository, times(1)).save(testGrade);
    }

    @Test
    void testUpdate_GradeNotExists() {
        // Arrange
        UUID nonExistentId = UUID.randomUUID();
        Grade updatedGrade = new Grade();
        updatedGrade.setGrade(3.0);
        when(gradeRepository.findById(nonExistentId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResponseStatusException.class, () -> {
            gradeService.update(nonExistentId, updatedGrade);
        });
        verify(gradeRepository, times(1)).findById(nonExistentId);
        verify(gradeRepository, never()).save(any(Grade.class));
    }

    @Test
    void testDeleteById_GradeExists() {
        // Arrange
        when(gradeRepository.existsById(testGradeId)).thenReturn(true);
        doNothing().when(gradeRepository).deleteById(testGradeId);

        // Act
        gradeService.deleteById(testGradeId);

        // Assert
        verify(gradeRepository, times(1)).existsById(testGradeId);
        verify(gradeRepository, times(1)).deleteById(testGradeId);
    }

    @Test
    void testDeleteById_GradeNotExists() {
        // Arrange
        UUID nonExistentId = UUID.randomUUID();
        when(gradeRepository.existsById(nonExistentId)).thenReturn(false);

        // Act & Assert
        assertThrows(ResponseStatusException.class, () -> {
            gradeService.deleteById(nonExistentId);
        });
        verify(gradeRepository, times(1)).existsById(nonExistentId);
        verify(gradeRepository, never()).deleteById(any(UUID.class));
    }

    @Test
    void testExists_True() {
        // Arrange
        when(gradeRepository.existsById(testGradeId)).thenReturn(true);

        // Act
        boolean exists = gradeService.exists(testGradeId);

        // Assert
        assertTrue(exists);
        verify(gradeRepository, times(1)).existsById(testGradeId);
    }

    @Test
    void testExists_False() {
        // Arrange
        UUID nonExistentId = UUID.randomUUID();
        when(gradeRepository.existsById(nonExistentId)).thenReturn(false);

        // Act
        boolean exists = gradeService.exists(nonExistentId);

        // Assert
        assertFalse(exists);
        verify(gradeRepository, times(1)).existsById(nonExistentId);
    }

    @Test
    void testCount_Success() {
        // Arrange
        when(gradeRepository.count()).thenReturn(10L);

        // Act
        long count = gradeService.count();

        // Assert
        assertEquals(10L, count);
        verify(gradeRepository, times(1)).count();
    }

    @Test
    void testDeleteIfExists_ReturnsFalse() {
        // Arrange
        UUID testId = UUID.randomUUID();

        // Act
        boolean result = gradeService.deleteIfExists(testId);

        // Assert
        assertFalse(result);
    }

    @Test
    void testLoadGradeOverview_WithGroupId_Success() {
        // Arrange
        UUID projectId = UUID.randomUUID();
        UUID groupId = UUID.randomUUID();
        
        Subject subject = new Subject();
        subject.setId(UUID.randomUUID());
        subject.setName("Math");
        subject.setShortName("M");
        
        ProjectSubject projectSubject = new ProjectSubject();
        projectSubject.setId(UUID.randomUUID());
        projectSubject.setSubject(subject);
        
        Performance performance = new Performance();
        performance.setId(UUID.randomUUID());
        performance.setName("Test 1");
        performance.setShortName("T1");
        performance.setWeight(0.5);
        performance.setProjectSubject(projectSubject);
        
        User student = new User();
        student.setId(UUID.randomUUID());
        student.setFirstName("John");
        student.setLastName("Doe");
        
        Group group = new Group();
        group.setId(groupId);
        group.setName("Group 1");
        
        Project project = new Project();
        project.setId(projectId);
        
        group.setProject(project);
        student.setGroups(new java.util.HashSet<>(java.util.Arrays.asList(group)));
        
        when(subjectRepository.findByProjectSubjects_Project_Id(projectId))
            .thenReturn(java.util.Arrays.asList(subject));
        when(performanceRepository.findByProjectSubject_Subject_Id(subject.getId()))
            .thenReturn(java.util.Arrays.asList(performance));
        when(userRepository.findByGroups_IdAndRole(groupId, Role.STUDENT))
            .thenReturn(java.util.Arrays.asList(student));
        when(performanceRepository.findByProjectSubject_Project_Id(projectId))
            .thenReturn(java.util.Arrays.asList(performance));
        when(gradeRepository.findByProjectId(projectId))
            .thenReturn(java.util.Arrays.asList());
        
        // Act
        var result = gradeService.loadGradeOverview(projectId, groupId);
        
        // Assert
        assertNotNull(result);
        assertEquals(1, result.subjects().size());
        assertEquals(1, result.users().size());
        verify(userRepository, times(1)).findByGroups_IdAndRole(groupId, Role.STUDENT);
    }

    @Test
    void testLoadGradeOverview_WithoutGroupId_Success() {
        // Arrange
        UUID projectId = UUID.randomUUID();
        
        Subject subject = new Subject();
        subject.setId(UUID.randomUUID());
        subject.setName("Math");
        subject.setShortName("M");
        
        User student = new User();
        student.setId(UUID.randomUUID());
        student.setFirstName("Jane");
        student.setLastName("Smith");
        student.setGroups(new java.util.HashSet<>());
        
        when(subjectRepository.findByProjectSubjects_Project_Id(projectId))
            .thenReturn(java.util.Arrays.asList(subject));
        when(performanceRepository.findByProjectSubject_Subject_Id(subject.getId()))
            .thenReturn(java.util.Arrays.asList());
        when(userRepository.findByCourses_Projects_IdAndRole(projectId, Role.STUDENT))
            .thenReturn(java.util.Arrays.asList(student));
        when(performanceRepository.findByProjectSubject_Project_Id(projectId))
            .thenReturn(java.util.Arrays.asList());
        when(gradeRepository.findByProjectId(projectId))
            .thenReturn(java.util.Arrays.asList());
        
        // Act
        var result = gradeService.loadGradeOverview(projectId, null);
        
        // Assert
        assertNotNull(result);
        assertEquals(1, result.subjects().size());
        assertEquals(1, result.users().size());
        verify(userRepository, times(1)).findByCourses_Projects_IdAndRole(projectId, Role.STUDENT);
    }

    @Test
    void testSaveGradeOverview_WithNewGrades_Success() {
        // Arrange
        UUID studentId = UUID.randomUUID();
        UUID performanceId = UUID.randomUUID();
        
        User student = new User();
        student.setId(studentId);
        
        Performance performance = new Performance();
        performance.setId(performanceId);
        
        com.gradesave.backend.dto.grade.GradeDto gradeDto = 
            new com.gradesave.backend.dto.grade.GradeDto(null, performanceId, 2.0);
        com.gradesave.backend.dto.grade.UpdateGradeRequest request = 
            new com.gradesave.backend.dto.grade.UpdateGradeRequest(studentId, java.util.Arrays.asList(gradeDto));
        
        when(gradeRepository.findByPerformanceIdAndStudentId(performanceId, studentId))
            .thenReturn(null);
        when(performanceRepository.findById(performanceId))
            .thenReturn(Optional.of(performance));
        when(userRepository.findById(studentId))
            .thenReturn(Optional.of(student));
        when(gradeRepository.save(any(Grade.class)))
            .thenReturn(testGrade);
        
        // Act
        gradeService.saveGradeOverview(java.util.Arrays.asList(request));
        
        // Assert
        verify(gradeRepository, times(1)).save(any(Grade.class));
    }

    @Test
    void testSaveGradeOverview_WithExistingGrades_Success() {
        // Arrange
        UUID studentId = UUID.randomUUID();
        UUID performanceId = UUID.randomUUID();
        
        Grade existingGrade = new Grade();
        existingGrade.setId(UUID.randomUUID());
        existingGrade.setGrade(1.5);
        
        com.gradesave.backend.dto.grade.GradeDto gradeDto = 
            new com.gradesave.backend.dto.grade.GradeDto(existingGrade.getId(), performanceId, 2.5);
        com.gradesave.backend.dto.grade.UpdateGradeRequest request = 
            new com.gradesave.backend.dto.grade.UpdateGradeRequest(studentId, java.util.Arrays.asList(gradeDto));
        
        when(gradeRepository.findByPerformanceIdAndStudentId(performanceId, studentId))
            .thenReturn(existingGrade);
        when(gradeRepository.save(any(Grade.class)))
            .thenReturn(existingGrade);
        
        // Act
        gradeService.saveGradeOverview(java.util.Arrays.asList(request));
        
        // Assert
        verify(gradeRepository, times(1)).save(existingGrade);
        assertEquals(2.5, existingGrade.getGrade());
    }

    @Test
    void testSaveGradeOverview_WithNullStudentId_SkipsEntry() {
        // Arrange
        com.gradesave.backend.dto.grade.GradeDto gradeDto = 
            new com.gradesave.backend.dto.grade.GradeDto(null, UUID.randomUUID(), 2.0);
        com.gradesave.backend.dto.grade.UpdateGradeRequest request = 
            new com.gradesave.backend.dto.grade.UpdateGradeRequest(null, java.util.Arrays.asList(gradeDto));
        
        // Act
        gradeService.saveGradeOverview(java.util.Arrays.asList(request));
        
        // Assert
        verify(gradeRepository, never()).save(any(Grade.class));
    }

    @Test
    void testSaveGradeOverview_WithNullGradeValue_SkipsGrade() {
        // Arrange
        UUID studentId = UUID.randomUUID();
        
        com.gradesave.backend.dto.grade.GradeDto gradeDto = 
            new com.gradesave.backend.dto.grade.GradeDto(null, UUID.randomUUID(), null);
        com.gradesave.backend.dto.grade.UpdateGradeRequest request = 
            new com.gradesave.backend.dto.grade.UpdateGradeRequest(studentId, java.util.Arrays.asList(gradeDto));
        
        // Act
        gradeService.saveGradeOverview(java.util.Arrays.asList(request));
        
        // Assert
        verify(gradeRepository, never()).save(any(Grade.class));
    }

    @Test
    void testSaveGradeOverview_WithNullPerformanceId_SkipsGrade() {
        // Arrange
        UUID studentId = UUID.randomUUID();
        
        com.gradesave.backend.dto.grade.GradeDto gradeDto = 
            new com.gradesave.backend.dto.grade.GradeDto(null, null, 2.0);
        com.gradesave.backend.dto.grade.UpdateGradeRequest request = 
            new com.gradesave.backend.dto.grade.UpdateGradeRequest(studentId, java.util.Arrays.asList(gradeDto));
        
        // Act
        gradeService.saveGradeOverview(java.util.Arrays.asList(request));
        
        // Assert
        verify(gradeRepository, never()).save(any(Grade.class));
    }
}
