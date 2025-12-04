package com.gradesave.backend.services;

import com.gradesave.backend.models.Subject;
import com.gradesave.backend.repositories.SubjectRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for SubjectService
 * Tests CRUD operations and business logic for subject management
 */
@ExtendWith(MockitoExtension.class)
class SubjectServiceTest {

    @Mock
    private SubjectRepository subjectRepository;

    @InjectMocks
    private SubjectService subjectService;

    private Subject testSubject;
    private UUID testSubjectId;

    @BeforeEach
    void setUp() {
        testSubjectId = UUID.randomUUID();
        
        testSubject = new Subject();
        testSubject.setId(testSubjectId);
        testSubject.setName("Mathematics");
        testSubject.setShortName("MATH");
    }

    @Test
    void testCreate_Success() {
        when(subjectRepository.save(any(Subject.class))).thenReturn(testSubject);

        Subject result = subjectService.create(testSubject);

        assertNotNull(result);
        assertEquals("Mathematics", result.getName());
        assertEquals("MATH", result.getShortName());
        verify(subjectRepository, times(1)).save(testSubject);
    }

    @Test
    void testGetById_SubjectExists() {
        when(subjectRepository.findById(testSubjectId)).thenReturn(Optional.of(testSubject));

        Optional<Subject> result = subjectService.getById(testSubjectId);

        assertTrue(result.isPresent());
        assertEquals("Mathematics", result.get().getName());
        verify(subjectRepository, times(1)).findById(testSubjectId);
    }

    @Test
    void testGetById_SubjectNotExists() {
        UUID nonExistentId = UUID.randomUUID();
        when(subjectRepository.findById(nonExistentId)).thenReturn(Optional.empty());

        Optional<Subject> result = subjectService.getById(nonExistentId);

        assertFalse(result.isPresent());
    }

    @Test
    void testGetAll_Success() {
        Subject subject2 = new Subject();
        subject2.setName("Physics");
        subject2.setShortName("PHYS");
        List<Subject> subjects = Arrays.asList(testSubject, subject2);
        when(subjectRepository.findAll()).thenReturn(subjects);

        List<Subject> result = subjectService.getAll();

        assertEquals(2, result.size());
        verify(subjectRepository, times(1)).findAll();
    }

    @Test
    void testUpdate_SubjectExists() {
        Subject updatedSubject = new Subject();
        updatedSubject.setId(testSubjectId);
        updatedSubject.setName("Advanced Mathematics");
        updatedSubject.setShortName("ADV_MATH");
        
        when(subjectRepository.existsById(testSubjectId)).thenReturn(true);
        when(subjectRepository.save(any(Subject.class))).thenReturn(updatedSubject);

        Subject result = subjectService.update(testSubjectId, updatedSubject);

        assertNotNull(result);
        assertEquals("Advanced Mathematics", result.getName());
        verify(subjectRepository, times(1)).save(updatedSubject);
    }

    @Test
    void testUpdate_SubjectNotExists() {
        UUID nonExistentId = UUID.randomUUID();
        Subject updatedSubject = new Subject();
        updatedSubject.setId(nonExistentId);
        updatedSubject.setName("Updated Subject");
        
        when(subjectRepository.existsById(nonExistentId)).thenReturn(false);

        assertThrows(IllegalArgumentException.class, () -> {
            subjectService.update(nonExistentId, updatedSubject);
        });
        verify(subjectRepository, never()).save(any(Subject.class));
    }

    @Test
    void testDeleteById_Success() {
        doNothing().when(subjectRepository).deleteById(testSubjectId);

        subjectService.deleteById(testSubjectId);

        verify(subjectRepository, times(1)).deleteById(testSubjectId);
    }

    @Test
    void testDeleteIfExists_SubjectExists() {
        when(subjectRepository.findById(testSubjectId)).thenReturn(Optional.of(testSubject));
        doNothing().when(subjectRepository).delete(testSubject);

        boolean result = subjectService.deleteIfExists(testSubjectId);

        assertTrue(result);
        verify(subjectRepository, times(1)).delete(testSubject);
    }

    @Test
    void testDeleteIfExists_SubjectNotExists() {
        UUID nonExistentId = UUID.randomUUID();
        when(subjectRepository.findById(nonExistentId)).thenReturn(Optional.empty());

        boolean result = subjectService.deleteIfExists(nonExistentId);

        assertFalse(result);
        verify(subjectRepository, never()).delete(any(Subject.class));
    }

    @Test
    void testExists_True() {
        when(subjectRepository.existsById(testSubjectId)).thenReturn(true);

        boolean exists = subjectService.exists(testSubjectId);

        assertTrue(exists);
    }

    @Test
    void testExists_False() {
        UUID nonExistentId = UUID.randomUUID();
        when(subjectRepository.existsById(nonExistentId)).thenReturn(false);

        boolean exists = subjectService.exists(nonExistentId);

        assertFalse(exists);
    }

    @Test
    void testCount_ReturnsZero() {
        long count = subjectService.count();

        assertEquals(0L, count);
    }
}
