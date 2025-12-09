package com.gradesave.backend.services;

import com.gradesave.backend.models.Role;
import com.gradesave.backend.models.User;
import com.gradesave.backend.repositories.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for UserService
 */
@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private CourseService courseService;

    @InjectMocks
    private UserService userService;

    private User testUser;
    private UUID testUserId;

    @BeforeEach
    void setUp() {
        testUserId = UUID.randomUUID();
        testUser = new User();
        testUser.setId(testUserId);
        testUser.setUsername("testuser");
        testUser.setFirstName("Test");
        testUser.setLastName("User");
        testUser.setRole(Role.STUDENT);
        testUser.setPassword("password123");
    }

    @Test
    void testCreateUser_Success() {
        // Arrange
        when(passwordEncoder.encode(any(String.class))).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // Act
        User createdUser = userService.create(testUser);

        // Assert
        assertNotNull(createdUser);
        assertEquals("testuser", createdUser.getUsername());
        verify(passwordEncoder, times(1)).encode("password123");
        verify(userRepository, times(1)).save(testUser);
    }

    @Test
    void testGetById_UserExists() {
        // Arrange
        when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));

        // Act
        Optional<User> result = userService.getById(testUserId);

        // Assert
        assertTrue(result.isPresent());
        assertEquals("testuser", result.get().getUsername());
        verify(userRepository, times(1)).findById(testUserId);
    }

    @Test
    void testGetById_UserNotExists() {
        // Arrange
        UUID nonExistentId = UUID.randomUUID();
        when(userRepository.findById(nonExistentId)).thenReturn(Optional.empty());

        // Act
        Optional<User> result = userService.getById(nonExistentId);

        // Assert
        assertFalse(result.isPresent());
        verify(userRepository, times(1)).findById(nonExistentId);
    }

    @Test
    void testFindByUsername_UserExists() {
        // Arrange
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));

        // Act
        User result = userService.findByUsername("testuser");

        // Assert
        assertNotNull(result);
        assertEquals("testuser", result.getUsername());
        verify(userRepository, times(1)).findByUsername("testuser");
    }

    @Test
    void testFindByUsername_UserNotExists() {
        // Arrange
        when(userRepository.findByUsername("nonexistent")).thenReturn(Optional.empty());

        // Act
        User result = userService.findByUsername("nonexistent");

        // Assert
        assertNull(result);
        verify(userRepository, times(1)).findByUsername("nonexistent");
    }

    @Test
    void testGetByUsername_Success() {
        // Arrange
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));

        // Act
        Optional<User> result = userService.getByUsername("testuser");

        // Assert
        assertTrue(result.isPresent());
        assertEquals("testuser", result.get().getUsername());
    }

    @Test
    void testExistsByUsername_True() {
        // Arrange
        when(userRepository.existsByUsername("testuser")).thenReturn(true);

        // Act
        boolean exists = userService.existsByUsername("testuser");

        // Assert
        assertTrue(exists);
        verify(userRepository, times(1)).existsByUsername("testuser");
    }

    @Test
    void testExistsByUsername_False() {
        // Arrange
        when(userRepository.existsByUsername("nonexistent")).thenReturn(false);

        // Act
        boolean exists = userService.existsByUsername("nonexistent");

        // Assert
        assertFalse(exists);
        verify(userRepository, times(1)).existsByUsername("nonexistent");
    }

    @Test
    void testGetAll_Success() {
        // Arrange
        User user2 = new User();
        user2.setUsername("user2");
        List<User> users = Arrays.asList(testUser, user2);
        when(userRepository.findAll()).thenReturn(users);

        // Act
        List<User> result = userService.getAll();

        // Assert
        assertEquals(2, result.size());
        verify(userRepository, times(1)).findAll();
    }

    @Test
    void testUpdate_UserExists() {
        // Arrange
        User updatedUser = new User();
        updatedUser.setUsername("updateduser");
        updatedUser.setFirstName("Updated");
        updatedUser.setLastName("Name");
        updatedUser.setRole(Role.TEACHER);
        updatedUser.setPassword("newpassword");

        when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));
        when(passwordEncoder.encode("newpassword")).thenReturn("encodedNewPassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // Act
        User result = userService.update(testUserId, updatedUser);

        // Assert
        assertNotNull(result);
        verify(passwordEncoder, times(1)).encode("newpassword");
        verify(userRepository, times(1)).save(testUser);
    }

    @Test
    void testUpdate_UserNotExists() {
        // Arrange
        UUID nonExistentId = UUID.randomUUID();
        User updatedUser = new User();
        when(userRepository.findById(nonExistentId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResponseStatusException.class, () -> {
            userService.update(nonExistentId, updatedUser);
        });
    }

    @Test
    void testDeleteById_UserExists() {
        // Arrange
        when(userRepository.existsById(testUserId)).thenReturn(true);
        when(courseService.removeUserFromAllCourses(testUserId)).thenReturn(true);
        doNothing().when(userRepository).deleteById(testUserId);

        // Act
        userService.deleteById(testUserId);

        // Assert
        verify(userRepository, times(1)).existsById(testUserId);
        verify(courseService, times(1)).removeUserFromAllCourses(testUserId);
        verify(userRepository, times(1)).deleteById(testUserId);
    }

    @Test
    void testDeleteById_UserNotExists() {
        // Arrange
        UUID nonExistentId = UUID.randomUUID();
        when(userRepository.existsById(nonExistentId)).thenReturn(false);

        // Act & Assert
        assertThrows(ResponseStatusException.class, () -> {
            userService.deleteById(nonExistentId);
        });
    }

    @Test
    void testDeleteIfExists_UserExists() {
        // Arrange
        when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));
        doNothing().when(userRepository).delete(testUser);

        // Act
        boolean result = userService.deleteIfExists(testUserId);

        // Assert
        assertTrue(result);
        verify(userRepository, times(1)).delete(testUser);
    }

    @Test
    void testDeleteIfExists_UserNotExists() {
        // Arrange
        UUID nonExistentId = UUID.randomUUID();
        when(userRepository.findById(nonExistentId)).thenReturn(Optional.empty());

        // Act
        boolean result = userService.deleteIfExists(nonExistentId);

        // Assert
        assertFalse(result);
        verify(userRepository, never()).delete(any(User.class));
    }

    @Test
    void testExists_True() {
        // Arrange
        when(userRepository.existsById(testUserId)).thenReturn(true);

        // Act
        boolean exists = userService.exists(testUserId);

        // Assert
        assertTrue(exists);
        verify(userRepository, times(1)).existsById(testUserId);
    }

    @Test
    void testExists_False() {
        // Arrange
        UUID nonExistentId = UUID.randomUUID();
        when(userRepository.existsById(nonExistentId)).thenReturn(false);

        // Act
        boolean exists = userService.exists(nonExistentId);

        // Assert
        assertFalse(exists);
        verify(userRepository, times(1)).existsById(nonExistentId);
    }

    @Test
    void testCount_Success() {
        // Arrange
        when(userRepository.count()).thenReturn(5L);

        // Act
        long count = userService.count();

        // Assert
        assertEquals(5L, count);
        verify(userRepository, times(1)).count();
    }

    @Test
    void testGetUsersByRole_Success() {
        // Arrange
        User student1 = new User();
        student1.setRole(Role.STUDENT);
        User student2 = new User();
        student2.setRole(Role.STUDENT);
        List<User> students = Arrays.asList(student1, student2);
        when(userRepository.findByRole(Role.STUDENT)).thenReturn(students);

        // Act
        List<User> result = userService.GetUsersByRole(Role.STUDENT);

        // Assert
        assertEquals(2, result.size());
        verify(userRepository, times(1)).findByRole(Role.STUDENT);
    }

    @Test
    void testGetUnassignedStudents_Success() {
        // Arrange
        List<User> unassignedStudents = Arrays.asList(testUser);
        when(userRepository.findUnassignedStudents()).thenReturn(unassignedStudents);

        // Act
        List<User> result = userService.getUnassignedStudents();

        // Assert
        assertEquals(1, result.size());
        verify(userRepository, times(1)).findUnassignedStudents();
    }

    @Test
    void testGetUsersByIds_Success() {
        // Arrange
        UUID userId2 = UUID.randomUUID();
        User user2 = new User();
        user2.setId(userId2);
        List<UUID> ids = Arrays.asList(testUserId, userId2);
        List<User> users = Arrays.asList(testUser, user2);
        when(userRepository.findAllById(ids)).thenReturn(users);

        // Act
        List<User> result = userService.getUsersByIds(ids);

        // Assert
        assertEquals(2, result.size());
        verify(userRepository, times(1)).findAllById(ids);
    }
}
