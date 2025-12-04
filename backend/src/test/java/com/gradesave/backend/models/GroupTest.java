package com.gradesave.backend.models;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for Group model
 */
class GroupTest {

    private Group group;
    private UUID groupId;
    private Project project;

    @BeforeEach
    void setUp() {
        groupId = UUID.randomUUID();
        group = new Group();
        
        project = new Project();
        project.setId(UUID.randomUUID());
        project.setName("Test Project");
    }

    @Test
    void testSetAndGetId() {
        // Act
        group.setId(groupId);

        // Assert
        assertEquals(groupId, group.getId());
    }

    @Test
    void testSetAndGetName() {
        // Act
        group.setName("Group 1");

        // Assert
        assertEquals("Group 1", group.getName());
    }

    @Test
    void testSetAndGetProject() {
        // Act
        group.setProject(project);

        // Assert
        assertEquals(project, group.getProject());
        assertEquals(project.getId(), group.getProject().getId());
    }

    @Test
    void testSetAndGetUsers() {
        // Arrange
        User user1 = new User();
        user1.setId(UUID.randomUUID());
        user1.setUsername("user1");
        
        User user2 = new User();
        user2.setId(UUID.randomUUID());
        user2.setUsername("user2");
        
        Set<User> users = new HashSet<>();
        users.add(user1);
        users.add(user2);

        // Act
        group.setUsers(users);

        // Assert
        assertEquals(2, group.getUsers().size());
        assertTrue(group.getUsers().contains(user1));
        assertTrue(group.getUsers().contains(user2));
    }

    @Test
    void testGroupWithAllFields() {
        // Arrange
        User user1 = new User();
        user1.setId(UUID.randomUUID());
        Set<User> users = new HashSet<>();
        users.add(user1);

        // Act
        group.setId(groupId);
        group.setName("Test Group");
        group.setProject(project);
        group.setUsers(users);

        // Assert
        assertEquals(groupId, group.getId());
        assertEquals("Test Group", group.getName());
        assertEquals(project, group.getProject());
        assertEquals(1, group.getUsers().size());
    }

    @Test
    void testAddUserToGroup() {
        // Arrange
        User user = new User();
        user.setId(UUID.randomUUID());
        user.setUsername("testuser");
        
        Set<User> users = new HashSet<>();
        group.setUsers(users);

        // Act
        group.getUsers().add(user);

        // Assert
        assertEquals(1, group.getUsers().size());
        assertTrue(group.getUsers().contains(user));
    }

    @Test
    void testRemoveUserFromGroup() {
        // Arrange
        User user = new User();
        user.setId(UUID.randomUUID());
        
        Set<User> users = new HashSet<>();
        users.add(user);
        group.setUsers(users);

        // Act
        group.getUsers().remove(user);

        // Assert
        assertTrue(group.getUsers().isEmpty());
    }

    @Test
    void testEmptyUsersSet() {
        // Arrange
        Set<User> users = new HashSet<>();
        
        // Act
        group.setUsers(users);

        // Assert
        assertNotNull(group.getUsers());
        assertTrue(group.getUsers().isEmpty());
    }
}
