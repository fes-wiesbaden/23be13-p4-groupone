package com.gradesave.backend.services;

import com.gradesave.backend.models.Group;
import com.gradesave.backend.models.Project;
import com.gradesave.backend.models.User;
import com.gradesave.backend.repositories.GroupRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for GroupService
 */
@ExtendWith(MockitoExtension.class)
class GroupServiceTest {

    @Mock
    private GroupRepository groupRepository;

    @InjectMocks
    private GroupService groupService;

    private Group testGroup;
    private UUID testGroupId;
    private Project testProject;

    @BeforeEach
    void setUp() {
        testGroupId = UUID.randomUUID();
        
        testProject = new Project();
        testProject.setId(UUID.randomUUID());
        testProject.setName("Test Project");

        testGroup = new Group();
        testGroup.setId(testGroupId);
        testGroup.setName("Test Group");
        testGroup.setProject(testProject);
        testGroup.setUsers(new HashSet<>());
    }

    @Test
    void testCreateGroup_Success() {
        // Arrange
        when(groupRepository.save(any(Group.class))).thenReturn(testGroup);

        // Act
        Group createdGroup = groupService.create(testGroup);

        // Assert
        assertNotNull(createdGroup);
        assertEquals("Test Group", createdGroup.getName());
        verify(groupRepository, times(1)).save(testGroup);
    }

    @Test
    void testGetById_GroupExists() {
        // Arrange
        when(groupRepository.findById(testGroupId)).thenReturn(Optional.of(testGroup));

        // Act
        Optional<Group> result = groupService.getById(testGroupId);

        // Assert
        assertTrue(result.isPresent());
        assertEquals("Test Group", result.get().getName());
        verify(groupRepository, times(1)).findById(testGroupId);
    }

    @Test
    void testGetById_GroupNotExists() {
        // Arrange
        UUID nonExistentId = UUID.randomUUID();
        when(groupRepository.findById(nonExistentId)).thenReturn(Optional.empty());

        // Act
        Optional<Group> result = groupService.getById(nonExistentId);

        // Assert
        assertFalse(result.isPresent());
        verify(groupRepository, times(1)).findById(nonExistentId);
    }

    @Test
    void testGetAll_Success() {
        // Arrange
        Group group2 = new Group();
        group2.setName("Group 2");
        List<Group> groups = Arrays.asList(testGroup, group2);
        when(groupRepository.findAll()).thenReturn(groups);

        // Act
        List<Group> result = groupService.getAll();

        // Assert
        assertEquals(2, result.size());
        verify(groupRepository, times(1)).findAll();
    }

    @Test
    void testUpdate_GroupExists() {
        // Arrange
        Group updatedGroup = new Group();
        updatedGroup.setName("Updated Group");
        
        when(groupRepository.findById(testGroupId)).thenReturn(Optional.of(testGroup));
        when(groupRepository.save(any(Group.class))).thenReturn(testGroup);

        // Act
        Group result = groupService.update(testGroupId, updatedGroup);

        // Assert
        assertNotNull(result);
        verify(groupRepository, times(1)).findById(testGroupId);
        verify(groupRepository, times(1)).save(testGroup);
    }

    @Test
    void testUpdate_GroupNotExists() {
        // Arrange
        UUID nonExistentId = UUID.randomUUID();
        Group updatedGroup = new Group();
        updatedGroup.setName("Updated Group");
        when(groupRepository.findById(nonExistentId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(EntityNotFoundException.class, () -> {
            groupService.update(nonExistentId, updatedGroup);
        });
        verify(groupRepository, times(1)).findById(nonExistentId);
        verify(groupRepository, never()).save(any(Group.class));
    }

    @Test
    void testUpdate_WithProject() {
        // Arrange
        Project newProject = new Project();
        newProject.setId(UUID.randomUUID());
        newProject.setName("New Project");
        
        Group updatedGroup = new Group();
        updatedGroup.setName("Updated Group");
        updatedGroup.setProject(newProject);
        
        when(groupRepository.findById(testGroupId)).thenReturn(Optional.of(testGroup));
        when(groupRepository.save(any(Group.class))).thenReturn(testGroup);

        // Act
        Group result = groupService.update(testGroupId, updatedGroup);

        // Assert
        assertNotNull(result);
        verify(groupRepository, times(1)).save(testGroup);
    }

    @Test
    void testUpdate_WithUsers() {
        // Arrange
        User user1 = new User();
        user1.setId(UUID.randomUUID());
        Set<User> users = new HashSet<>();
        users.add(user1);
        
        Group updatedGroup = new Group();
        updatedGroup.setName("Updated Group");
        updatedGroup.setUsers(users);
        
        when(groupRepository.findById(testGroupId)).thenReturn(Optional.of(testGroup));
        when(groupRepository.save(any(Group.class))).thenReturn(testGroup);

        // Act
        Group result = groupService.update(testGroupId, updatedGroup);

        // Assert
        assertNotNull(result);
        verify(groupRepository, times(1)).save(testGroup);
    }

    @Test
    void testDeleteById_Success() {
        // Arrange
        doNothing().when(groupRepository).deleteById(testGroupId);

        // Act
        groupService.deleteById(testGroupId);

        // Assert
        verify(groupRepository, times(1)).deleteById(testGroupId);
    }

    @Test
    void testDeleteIfExists_GroupExists() {
        // Arrange
        when(groupRepository.findById(testGroupId)).thenReturn(Optional.of(testGroup));
        doNothing().when(groupRepository).delete(testGroup);

        // Act
        boolean result = groupService.deleteIfExists(testGroupId);

        // Assert
        assertTrue(result);
        verify(groupRepository, times(1)).findById(testGroupId);
        verify(groupRepository, times(1)).delete(testGroup);
    }

    @Test
    void testDeleteIfExists_GroupNotExists() {
        // Arrange
        UUID nonExistentId = UUID.randomUUID();
        when(groupRepository.findById(nonExistentId)).thenReturn(Optional.empty());

        // Act
        boolean result = groupService.deleteIfExists(nonExistentId);

        // Assert
        assertFalse(result);
        verify(groupRepository, times(1)).findById(nonExistentId);
        verify(groupRepository, never()).delete(any(Group.class));
    }

    @Test
    void testExists_True() {
        // Arrange
        when(groupRepository.existsById(testGroupId)).thenReturn(true);

        // Act
        boolean exists = groupService.exists(testGroupId);

        // Assert
        assertTrue(exists);
        verify(groupRepository, times(1)).existsById(testGroupId);
    }

    @Test
    void testExists_False() {
        // Arrange
        UUID nonExistentId = UUID.randomUUID();
        when(groupRepository.existsById(nonExistentId)).thenReturn(false);

        // Act
        boolean exists = groupService.exists(nonExistentId);

        // Assert
        assertFalse(exists);
        verify(groupRepository, times(1)).existsById(nonExistentId);
    }

    @Test
    void testCount_Success() {
        // Arrange
        when(groupRepository.count()).thenReturn(5L);

        // Act
        long count = groupService.count();

        // Assert
        assertEquals(5L, count);
        verify(groupRepository, times(1)).count();
    }

    @Test
    void testCreateGroups_Success() {
        // Arrange
        Group group2 = new Group();
        group2.setName("Group 2");
        List<Group> groups = Arrays.asList(testGroup, group2);
        when(groupRepository.saveAll(anyList())).thenReturn(groups);

        // Act
        List<Group> result = groupService.createGroups(groups);

        // Assert
        assertEquals(2, result.size());
        verify(groupRepository, times(1)).saveAll(groups);
    }

    @Test
    void testExistsUserInProject_True() {
        // Arrange
        UUID userId = UUID.randomUUID();
        UUID projectId = UUID.randomUUID();
        when(groupRepository.existsUserInProject(userId, projectId)).thenReturn(true);

        // Act
        boolean exists = groupService.existsUserInProject(userId, projectId);

        // Assert
        assertTrue(exists);
        verify(groupRepository, times(1)).existsUserInProject(userId, projectId);
    }

    @Test
    void testExistsUserInProject_False() {
        // Arrange
        UUID userId = UUID.randomUUID();
        UUID projectId = UUID.randomUUID();
        when(groupRepository.existsUserInProject(userId, projectId)).thenReturn(false);

        // Act
        boolean exists = groupService.existsUserInProject(userId, projectId);

        // Assert
        assertFalse(exists);
        verify(groupRepository, times(1)).existsUserInProject(userId, projectId);
    }

    @Test
    void testDeleteGroupsByProject_Success() {
        // Arrange
        UUID projectId = UUID.randomUUID();
        Group group1 = new Group();
        group1.setUsers(new HashSet<>());
        Group group2 = new Group();
        group2.setUsers(new HashSet<>());
        List<Group> groups = Arrays.asList(group1, group2);
        
        when(groupRepository.findAllByProjectId(projectId)).thenReturn(groups);
        doNothing().when(groupRepository).deleteAll(groups);

        // Act
        groupService.deleteGroupsByProject(projectId);

        // Assert
        verify(groupRepository, times(1)).findAllByProjectId(projectId);
        verify(groupRepository, times(1)).deleteAll(groups);
        assertTrue(group1.getUsers().isEmpty());
        assertTrue(group2.getUsers().isEmpty());
    }
}
