package com.gradesave.backend.models;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for Grade model
 */
class GradeTest {

    private Grade grade;
    private UUID gradeId;
    private User student;
    private Performance performance;
    private ProjectSubject projectSubject;

    @BeforeEach
    void setUp() {
        gradeId = UUID.randomUUID();
        grade = new Grade();
        
        student = new User();
        student.setId(UUID.randomUUID());
        student.setUsername("student1");
        
        performance = new Performance();
        performance.setId(UUID.randomUUID());
        performance.setName("Test Performance");
        
        projectSubject = new ProjectSubject();
        projectSubject.setId(UUID.randomUUID());
    }

    @Test
    void testSetAndGetId() {
        // Act
        grade.setId(gradeId);

        // Assert
        assertEquals(gradeId, grade.getId());
    }

    @Test
    void testSetAndGetGrade() {
        // Act
        grade.setGrade(2.5);

        // Assert
        assertEquals(2.5, grade.getGrade());
    }

    @Test
    void testSetAndGetStudent() {
        // Act
        grade.setStudent(student);

        // Assert
        assertEquals(student, grade.getStudent());
        assertEquals(student.getId(), grade.getStudent().getId());
    }

    @Test
    void testSetAndGetPerformance() {
        // Act
        grade.setPerformance(performance);

        // Assert
        assertEquals(performance, grade.getPerformance());
        assertEquals(performance.getId(), grade.getPerformance().getId());
    }

    @Test
    void testSetAndGetProjectSubject() {
        // Act
        grade.setProjectSubject(projectSubject);

        // Assert
        assertEquals(projectSubject, grade.getProjectSubject());
        assertEquals(projectSubject.getId(), grade.getProjectSubject().getId());
    }

    @Test
    void testGradeWithAllFields() {
        // Act
        grade.setId(gradeId);
        grade.setGrade(1.5);
        grade.setStudent(student);
        grade.setPerformance(performance);
        grade.setProjectSubject(projectSubject);

        // Assert
        assertEquals(gradeId, grade.getId());
        assertEquals(1.5, grade.getGrade());
        assertEquals(student, grade.getStudent());
        assertEquals(performance, grade.getPerformance());
        assertEquals(projectSubject, grade.getProjectSubject());
    }

    @Test
    void testGradeMinimumValue() {
        // Act
        grade.setGrade(1.0);

        // Assert
        assertEquals(1.0, grade.getGrade());
    }

    @Test
    void testGradeMaximumValue() {
        // Act
        grade.setGrade(6.0);

        // Assert
        assertEquals(6.0, grade.getGrade());
    }

    @Test
    void testGradeDecimalValue() {
        // Act
        grade.setGrade(2.3);

        // Assert
        assertEquals(2.3, grade.getGrade(), 0.001);
    }
}
