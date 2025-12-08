package com.gradesave.backend.models;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for User model
 */
class UserTest {

    private User user;
    private UUID userId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        user = new User();
    }

    @Test
    void testSetAndGetId() {
        // Act
        user.setId(userId);

        // Assert
        assertEquals(userId, user.getId());
    }

    @Test
    void testSetAndGetUsername() {
        // Act
        user.setUsername("testuser");

        // Assert
        assertEquals("testuser", user.getUsername());
    }

    @Test
    void testSetAndGetFirstName() {
        // Act
        user.setFirstName("John");

        // Assert
        assertEquals("John", user.getFirstName());
    }

    @Test
    void testSetAndGetLastName() {
        // Act
        user.setLastName("Doe");

        // Assert
        assertEquals("Doe", user.getLastName());
    }

    @Test
    void testSetAndGetRole() {
        // Act
        user.setRole(Role.STUDENT);

        // Assert
        assertEquals(Role.STUDENT, user.getRole());
    }

    @Test
    void testSetAndGetPassword() {
        // Act
        user.setPassword("password123");

        // Assert
        assertEquals("password123", user.getPassword());
    }

    @Test
    void testSetAndGetCourses() {
        // Arrange
        Course course = new Course();
        course.setId(UUID.randomUUID());
        Set<Course> courses = new HashSet<>();
        courses.add(course);

        // Act
        user.setCourses(courses);

        // Assert
        assertEquals(1, user.getCourses().size());
        assertTrue(user.getCourses().contains(course));
    }

    @Test
    void testSetAndGetGroups() {
        // Arrange
        Group group = new Group();
        group.setId(UUID.randomUUID());
        Set<Group> groups = new HashSet<>();
        groups.add(group);

        // Act
        user.setGroups(groups);

        // Assert
        assertEquals(1, user.getGroups().size());
        assertTrue(user.getGroups().contains(group));
    }

    @Test
    void testDefaultCoursesIsEmpty() {
        // Assert
        assertNotNull(user.getCourses());
        assertTrue(user.getCourses().isEmpty());
    }

    @Test
    void testDefaultGroupsIsEmpty() {
        // Assert
        assertNotNull(user.getGroups());
        assertTrue(user.getGroups().isEmpty());
    }

    @Test
    void testUserWithAllFields() {
        // Arrange
        UUID id = UUID.randomUUID();
        Course course = new Course();
        course.setId(UUID.randomUUID());
        Set<Course> courses = new HashSet<>();
        courses.add(course);
        
        Group group = new Group();
        group.setId(UUID.randomUUID());
        Set<Group> groups = new HashSet<>();
        groups.add(group);

        // Act
        user.setId(id);
        user.setUsername("testuser");
        user.setFirstName("Test");
        user.setLastName("User");
        user.setRole(Role.TEACHER);
        user.setPassword("password");
        user.setCourses(courses);
        user.setGroups(groups);

        // Assert
        assertEquals(id, user.getId());
        assertEquals("testuser", user.getUsername());
        assertEquals("Test", user.getFirstName());
        assertEquals("User", user.getLastName());
        assertEquals(Role.TEACHER, user.getRole());
        assertEquals("password", user.getPassword());
        assertEquals(1, user.getCourses().size());
        assertEquals(1, user.getGroups().size());
    }
}
