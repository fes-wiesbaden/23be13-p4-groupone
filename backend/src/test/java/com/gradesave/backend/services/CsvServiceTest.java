package com.gradesave.backend.services;

import com.gradesave.backend.models.Course;
import com.gradesave.backend.models.Role;
import com.gradesave.backend.models.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.security.SecureRandom;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

/**
 * Unit tests for CsvService
 * Tests CSV parsing, user creation, and password generation
 */
@ExtendWith(MockitoExtension.class)
class CsvServiceTest {

    @Mock
    private UserService userService;

    @Mock
    private CourseService courseService;

    @Mock
    private SecureRandom secureRandom;

    @Mock
    private PdfService pdfService;

    @InjectMocks
    private CsvService csvService;

    private Course testCourse;

    @BeforeEach
    void setUp() {
        testCourse = new Course();
        testCourse.setId(UUID.randomUUID());
        testCourse.setCourseName("Test Class");
        testCourse.setUsers(new HashSet<>());
    }

    @Test
    void testImportUsersFromCsv_SingleStudent_Success() throws Exception {
        // Arrange
        String csvContent = "name;lastname;classname;role\n" +
                           "John;Doe;Test Class;STUDENT";
        MockMultipartFile file = new MockMultipartFile(
            "file",
            "users.csv",
            "text/csv",
            csvContent.getBytes()
        );

        User savedUser = new User();
        savedUser.setId(UUID.randomUUID());
        savedUser.setUsername("john.doe");
        savedUser.setFirstName("John");
        savedUser.setLastName("Doe");
        savedUser.setRole(Role.STUDENT);
        savedUser.setCourses(new HashSet<>());

        when(userService.getByUsername(anyString())).thenReturn(Optional.empty());
        when(secureRandom.nextInt(anyInt())).thenReturn(0);
        when(userService.create(any(User.class), eq(true))).thenReturn(savedUser);
        when(courseService.isExistedByName("Test Class")).thenReturn(true);
        when(courseService.getByName("Test Class")).thenReturn(Optional.of(testCourse));
        when(courseService.addStudent(any(Course.class), any(User.class))).thenReturn(true);
        doNothing().when(pdfService).generateBulkUserCredentialsPdf(anyMap());

        // Act
        csvService.importUsersFromCsv(file);

        // Assert
        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userService, times(1)).create(userCaptor.capture(), eq(true));
        
        User capturedUser = userCaptor.getValue();
        assertEquals("John", capturedUser.getFirstName());
        assertEquals("Doe", capturedUser.getLastName());
        assertEquals("john.doe", capturedUser.getUsername());
        assertEquals(Role.STUDENT, capturedUser.getRole());
        assertNotNull(capturedUser.getPassword());

        verify(courseService, times(1)).addStudent(eq(testCourse), eq(savedUser));
        verify(pdfService, times(1)).generateBulkUserCredentialsPdf(anyMap());
    }

    @Test
    void testImportUsersFromCsv_MultipleUsers_Success() throws Exception {
        // Arrange
        String csvContent = "name;lastname;classname;role\n" +
                           "John;Doe;Test Class;STUDENT\n" +
                           "Jane;Smith;Test Class;STUDENT\n" +
                           "Bob;Teacher;Test Class;TEACHER";
        MockMultipartFile file = new MockMultipartFile(
            "file",
            "users.csv",
            "text/csv",
            csvContent.getBytes()
        );

        User user1 = createMockUser("john.doe", "John", "Doe", Role.STUDENT);
        User user2 = createMockUser("jane.smith", "Jane", "Smith", Role.STUDENT);
        User user3 = createMockUser("bob.teacher", "Bob", "Teacher", Role.TEACHER);

        when(userService.getByUsername(anyString())).thenReturn(Optional.empty());
        when(secureRandom.nextInt(anyInt())).thenReturn(0);
        when(userService.create(any(User.class), eq(true)))
            .thenReturn(user1, user2, user3);
        when(courseService.isExistedByName("Test Class")).thenReturn(true);
        when(courseService.getByName("Test Class")).thenReturn(Optional.of(testCourse));
        when(courseService.addStudent(any(Course.class), any(User.class))).thenReturn(true);
        doNothing().when(pdfService).generateBulkUserCredentialsPdf(anyMap());

        // Act
        csvService.importUsersFromCsv(file);

        // Assert
        verify(userService, times(3)).create(any(User.class), eq(true));
        verify(courseService, times(3)).addStudent(eq(testCourse), any(User.class));
        verify(pdfService, times(1)).generateBulkUserCredentialsPdf(anyMap());
    }

    @Test
    void testImportUsersFromCsv_DuplicateUsername_GeneratesUnique() throws Exception {
        // Arrange
        String csvContent = "name;lastname;classname;role\n" +
                           "John;Doe;Test Class;STUDENT\n" +
                           "John;Doe;Test Class;STUDENT";
        MockMultipartFile file = new MockMultipartFile(
            "file",
            "users.csv",
            "text/csv",
            csvContent.getBytes()
        );

        User user1 = createMockUser("john.doe", "John", "Doe", Role.STUDENT);
        User user2 = createMockUser("john.doe1", "John", "Doe", Role.STUDENT);

        // First user doesn't exist, second user exists with base username
        when(userService.getByUsername("john.doe"))
            .thenReturn(Optional.empty())
            .thenReturn(Optional.of(user1));
        when(userService.getByUsername("john.doe1")).thenReturn(Optional.empty());
        when(secureRandom.nextInt(anyInt())).thenReturn(0);
        when(userService.create(any(User.class), eq(true))).thenReturn(user1, user2);
        when(courseService.isExistedByName("Test Class")).thenReturn(true);
        when(courseService.getByName("Test Class")).thenReturn(Optional.of(testCourse));
        when(courseService.addStudent(any(Course.class), any(User.class))).thenReturn(true);
        doNothing().when(pdfService).generateBulkUserCredentialsPdf(anyMap());

        // Act
        csvService.importUsersFromCsv(file);

        // Assert
        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userService, times(2)).create(userCaptor.capture(), eq(true));
        
        List<User> capturedUsers = userCaptor.getAllValues();
        assertEquals("john.doe", capturedUsers.get(0).getUsername());
        assertEquals("john.doe1", capturedUsers.get(1).getUsername());
    }

    @Test
    void testImportUsersFromCsv_InvalidRole_DefaultsToStudent() throws Exception {
        // Arrange
        String csvContent = "name;lastname;classname;role\n" +
                           "John;Doe;Test Class;INVALID_ROLE";
        MockMultipartFile file = new MockMultipartFile(
            "file",
            "users.csv",
            "text/csv",
            csvContent.getBytes()
        );

        User savedUser = createMockUser("john.doe", "John", "Doe", Role.STUDENT);

        when(userService.getByUsername(anyString())).thenReturn(Optional.empty());
        when(secureRandom.nextInt(anyInt())).thenReturn(0);
        when(userService.create(any(User.class), eq(true))).thenReturn(savedUser);
        when(courseService.isExistedByName("Test Class")).thenReturn(true);
        when(courseService.getByName("Test Class")).thenReturn(Optional.of(testCourse));
        when(courseService.addStudent(any(Course.class), any(User.class))).thenReturn(true);
        doNothing().when(pdfService).generateBulkUserCredentialsPdf(anyMap());

        // Act
        csvService.importUsersFromCsv(file);

        // Assert
        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userService, times(1)).create(userCaptor.capture(), eq(true));
        
        User capturedUser = userCaptor.getValue();
        assertEquals(Role.STUDENT, capturedUser.getRole());
    }

    @Test
    void testImportUsersFromCsv_NoRole_DefaultsToStudent() throws Exception {
        // Arrange
        String csvContent = "name;lastname;classname\n" +
                           "John;Doe;Test Class";
        MockMultipartFile file = new MockMultipartFile(
            "file",
            "users.csv",
            "text/csv",
            csvContent.getBytes()
        );

        User savedUser = createMockUser("john.doe", "John", "Doe", Role.STUDENT);

        when(userService.getByUsername(anyString())).thenReturn(Optional.empty());
        when(secureRandom.nextInt(anyInt())).thenReturn(0);
        when(userService.create(any(User.class), eq(true))).thenReturn(savedUser);
        when(courseService.isExistedByName("Test Class")).thenReturn(true);
        when(courseService.getByName("Test Class")).thenReturn(Optional.of(testCourse));
        when(courseService.addStudent(any(Course.class), any(User.class))).thenReturn(true);
        doNothing().when(pdfService).generateBulkUserCredentialsPdf(anyMap());

        // Act
        csvService.importUsersFromCsv(file);

        // Assert
        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userService, times(1)).create(userCaptor.capture(), eq(true));
        
        User capturedUser = userCaptor.getValue();
        assertEquals(Role.STUDENT, capturedUser.getRole());
    }

    @Test
    void testImportUsersFromCsv_CourseNotExists_SkipsAddingToCourse() throws Exception {
        // Arrange
        String csvContent = "name;lastname;classname;role\n" +
                           "John;Doe;Nonexistent Class;STUDENT";
        MockMultipartFile file = new MockMultipartFile(
            "file",
            "users.csv",
            "text/csv",
            csvContent.getBytes()
        );

        User savedUser = createMockUser("john.doe", "John", "Doe", Role.STUDENT);

        when(userService.getByUsername(anyString())).thenReturn(Optional.empty());
        when(secureRandom.nextInt(anyInt())).thenReturn(0);
        when(userService.create(any(User.class), eq(true))).thenReturn(savedUser);
        when(courseService.isExistedByName("Nonexistent Class")).thenReturn(false);
        doNothing().when(pdfService).generateBulkUserCredentialsPdf(anyMap());

        // Act
        csvService.importUsersFromCsv(file);

        // Assert
        verify(userService, times(1)).create(any(User.class), eq(true));
        verify(courseService, never()).addStudent(any(Course.class), any(User.class));
        verify(pdfService, times(1)).generateBulkUserCredentialsPdf(anyMap());
    }

    @Test
    void testImportUsersFromCsv_NoClassName_SkipsAddingToCourse() throws Exception {
        // Arrange
        String csvContent = "name;lastname;role\n" +
                           "John;Doe;STUDENT";
        MockMultipartFile file = new MockMultipartFile(
            "file",
            "users.csv",
            "text/csv",
            csvContent.getBytes()
        );

        User savedUser = createMockUser("john.doe", "John", "Doe", Role.STUDENT);

        when(userService.getByUsername(anyString())).thenReturn(Optional.empty());
        when(secureRandom.nextInt(anyInt())).thenReturn(0);
        when(userService.create(any(User.class), eq(true))).thenReturn(savedUser);
        doNothing().when(pdfService).generateBulkUserCredentialsPdf(anyMap());

        // Act
        csvService.importUsersFromCsv(file);

        // Assert
        verify(userService, times(1)).create(any(User.class), eq(true));
        verify(courseService, never()).isExistedByName(anyString());
        verify(courseService, never()).addStudent(any(Course.class), any(User.class));
    }

    @Test
    void testImportUsersFromCsv_TeacherWithMultipleCourses_Success() throws Exception {
        // Arrange
        String csvContent = "name;lastname;classname;role\n" +
                           "Bob;Teacher;Test Class,Another Class;TEACHER";
        MockMultipartFile file = new MockMultipartFile(
            "file",
            "users.csv",
            "text/csv",
            csvContent.getBytes()
        );

        User savedUser = createMockUser("bob.teacher", "Bob", "Teacher", Role.TEACHER);
        
        Course course2 = new Course();
        course2.setId(UUID.randomUUID());
        course2.setCourseName("Another Class");
        course2.setUsers(new HashSet<>());

        when(userService.getByUsername(anyString())).thenReturn(Optional.empty());
        when(secureRandom.nextInt(anyInt())).thenReturn(0);
        when(userService.create(any(User.class), eq(true))).thenReturn(savedUser);
        when(courseService.isExistedByName("Test Class")).thenReturn(true);
        when(courseService.isExistedByName("Another Class")).thenReturn(true);
        when(courseService.getByName("Test Class")).thenReturn(Optional.of(testCourse));
        when(courseService.getByName("Another Class")).thenReturn(Optional.of(course2));
        when(courseService.addStudent(any(Course.class), any(User.class))).thenReturn(true);
        doNothing().when(pdfService).generateBulkUserCredentialsPdf(anyMap());

        // Act
        csvService.importUsersFromCsv(file);

        // Assert
        verify(courseService, times(1)).isExistedByName("Test Class");
        verify(courseService, times(1)).isExistedByName("Another Class");
        verify(courseService, times(2)).addStudent(any(Course.class), eq(savedUser));
    }

    @Test
    void testImportUsersFromCsv_EmptyFile_NoUsersCreated() throws Exception {
        // Arrange
        String csvContent = "name;lastname;classname;role\n";
        MockMultipartFile file = new MockMultipartFile(
            "file",
            "users.csv",
            "text/csv",
            csvContent.getBytes()
        );

        // Act
        csvService.importUsersFromCsv(file);

        // Assert
        verify(userService, never()).create(any(User.class), anyBoolean());
        verify(pdfService, never()).generateBulkUserCredentialsPdf(anyMap());
    }

    @Test
    void testImportUsersFromCsv_PdfGenerationFails_ContinuesProcessing() throws Exception {
        // Arrange
        String csvContent = "name;lastname;classname;role\n" +
                           "John;Doe;Test Class;STUDENT";
        MockMultipartFile file = new MockMultipartFile(
            "file",
            "users.csv",
            "text/csv",
            csvContent.getBytes()
        );

        User savedUser = createMockUser("john.doe", "John", "Doe", Role.STUDENT);

        when(userService.getByUsername(anyString())).thenReturn(Optional.empty());
        when(secureRandom.nextInt(anyInt())).thenReturn(0);
        when(userService.create(any(User.class), eq(true))).thenReturn(savedUser);
        when(courseService.isExistedByName("Test Class")).thenReturn(true);
        when(courseService.getByName("Test Class")).thenReturn(Optional.of(testCourse));
        when(courseService.addStudent(any(Course.class), any(User.class))).thenReturn(true);
        doThrow(new RuntimeException("PDF generation failed"))
            .when(pdfService).generateBulkUserCredentialsPdf(anyMap());

        // Act - should not throw exception
        assertDoesNotThrow(() -> csvService.importUsersFromCsv(file));

        // Assert
        verify(userService, times(1)).create(any(User.class), eq(true));
        verify(pdfService, times(1)).generateBulkUserCredentialsPdf(anyMap());
    }

    @Test
    void testImportUsersFromCsv_PasswordGeneration_CreatesRandomPassword() throws Exception {
        // Arrange
        String csvContent = "name;lastname;classname;role\n" +
                           "John;Doe;Test Class;STUDENT";
        MockMultipartFile file = new MockMultipartFile(
            "file",
            "users.csv",
            "text/csv",
            csvContent.getBytes()
        );

        User savedUser = createMockUser("john.doe", "John", "Doe", Role.STUDENT);

        when(userService.getByUsername(anyString())).thenReturn(Optional.empty());
        // Mock SecureRandom to return specific values
        when(secureRandom.nextInt(anyInt())).thenReturn(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11);
        when(userService.create(any(User.class), eq(true))).thenReturn(savedUser);
        when(courseService.isExistedByName("Test Class")).thenReturn(true);
        when(courseService.getByName("Test Class")).thenReturn(Optional.of(testCourse));
        when(courseService.addStudent(any(Course.class), any(User.class))).thenReturn(true);
        doNothing().when(pdfService).generateBulkUserCredentialsPdf(anyMap());

        // Act
        csvService.importUsersFromCsv(file);

        // Assert
        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userService, times(1)).create(userCaptor.capture(), eq(true));
        
        User capturedUser = userCaptor.getValue();
        assertNotNull(capturedUser.getPassword());
        assertEquals(12, capturedUser.getPassword().length());
    }

    private User createMockUser(String username, String firstName, String lastName, Role role) {
        User user = new User();
        user.setId(UUID.randomUUID());
        user.setUsername(username);
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setRole(role);
        user.setCourses(new HashSet<>());
        return user;
    }
}
