package com.gradesave.backend.services;

import com.gradesave.backend.models.Performance;
import com.gradesave.backend.models.ProjectSubject;
import com.gradesave.backend.repositories.PerformanceRepository;
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
 * Unit tests for PerformanceService
 * Tests CRUD operations and business logic for performance management
 */
@ExtendWith(MockitoExtension.class)
class PerformanceServiceTest {

    @Mock
    private PerformanceRepository performanceRepository;

    @InjectMocks
    private PerformanceService performanceService;

    private Performance testPerformance;
    private UUID testPerformanceId;
    private ProjectSubject testProjectSubject;

    @BeforeEach
    void setUp() {
        testPerformanceId = UUID.randomUUID();
        
        testProjectSubject = new ProjectSubject();
        testProjectSubject.setId(UUID.randomUUID());
        
        testPerformance = new Performance();
        testPerformance.setId(testPerformanceId);
        testPerformance.setName("Test Performance");
        testPerformance.setShortName("TP");
        testPerformance.setWeight(0.3);
        testPerformance.setProjectSubject(testProjectSubject);
    }

    @Test
    void testCreate_Success() {
        when(performanceRepository.save(any(Performance.class))).thenReturn(testPerformance);

        Performance result = performanceService.create(testPerformance);

        assertNotNull(result);
        assertEquals("Test Performance", result.getName());
        assertEquals("TP", result.getShortName());
        assertEquals(0.3, result.getWeight());
        verify(performanceRepository, times(1)).save(testPerformance);
    }

    @Test
    void testGetById_PerformanceExists() {
        when(performanceRepository.findById(testPerformanceId)).thenReturn(Optional.of(testPerformance));

        Optional<Performance> result = performanceService.getById(testPerformanceId);

        assertTrue(result.isPresent());
        assertEquals("Test Performance", result.get().getName());
        verify(performanceRepository, times(1)).findById(testPerformanceId);
    }

    @Test
    void testGetById_PerformanceNotExists() {
        UUID nonExistentId = UUID.randomUUID();
        when(performanceRepository.findById(nonExistentId)).thenReturn(Optional.empty());

        Optional<Performance> result = performanceService.getById(nonExistentId);

        assertFalse(result.isPresent());
    }

    @Test
    void testGetAll_Success() {
        Performance performance2 = new Performance();
        performance2.setName("Performance 2");
        List<Performance> performances = Arrays.asList(testPerformance, performance2);
        when(performanceRepository.findAll()).thenReturn(performances);

        List<Performance> result = performanceService.getAll();

        assertEquals(2, result.size());
        verify(performanceRepository, times(1)).findAll();
    }

    @Test
    void testUpdate_AllFieldsSet_Success() {
        Performance updatedPerformance = new Performance();
        updatedPerformance.setName("Updated Performance");
        updatedPerformance.setShortName("UP");
        updatedPerformance.setWeight(0.5);
        
        when(performanceRepository.findById(testPerformanceId)).thenReturn(Optional.of(testPerformance));
        when(performanceRepository.save(any(Performance.class))).thenReturn(testPerformance);

        Performance result = performanceService.update(testPerformanceId, updatedPerformance);

        assertNotNull(result);
        assertEquals("Updated Performance", testPerformance.getName());
        assertEquals("UP", testPerformance.getShortName());
        assertEquals(0.5, testPerformance.getWeight());
        verify(performanceRepository, times(1)).save(testPerformance);
    }

    @Test
    void testUpdate_NameSetToNull() {
        Performance updatedPerformance = new Performance();
        updatedPerformance.setName(null);
        updatedPerformance.setShortName("UP");
        updatedPerformance.setWeight(0.5);
        
        when(performanceRepository.findById(testPerformanceId)).thenReturn(Optional.of(testPerformance));
        when(performanceRepository.save(any(Performance.class))).thenReturn(testPerformance);

        Performance result = performanceService.update(testPerformanceId, updatedPerformance);

        assertNotNull(result);
        assertNull(testPerformance.getName());
        verify(performanceRepository, times(1)).save(testPerformance);
    }

    @Test
    void testUpdate_ShortNameSetToNull() {
        Performance updatedPerformance = new Performance();
        updatedPerformance.setName("Updated Performance");
        updatedPerformance.setShortName(null);
        updatedPerformance.setWeight(0.5);
        
        when(performanceRepository.findById(testPerformanceId)).thenReturn(Optional.of(testPerformance));
        when(performanceRepository.save(any(Performance.class))).thenReturn(testPerformance);

        Performance result = performanceService.update(testPerformanceId, updatedPerformance);

        assertNotNull(result);
        assertNull(testPerformance.getShortName());
        verify(performanceRepository, times(1)).save(testPerformance);
    }

    @Test
    void testUpdate_WeightSetToNull() {
        Performance updatedPerformance = new Performance();
        updatedPerformance.setName("Updated Performance");
        updatedPerformance.setShortName("UP");
        updatedPerformance.setWeight(null);
        
        when(performanceRepository.findById(testPerformanceId)).thenReturn(Optional.of(testPerformance));
        when(performanceRepository.save(any(Performance.class))).thenReturn(testPerformance);

        Performance result = performanceService.update(testPerformanceId, updatedPerformance);

        assertNotNull(result);
        assertNull(testPerformance.getWeight());
        verify(performanceRepository, times(1)).save(testPerformance);
    }

    @Test
    void testUpdate_PerformanceNotExists() {
        UUID nonExistentId = UUID.randomUUID();
        Performance updatedPerformance = new Performance();
        updatedPerformance.setName("Updated Performance");
        when(performanceRepository.findById(nonExistentId)).thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class, () -> {
            performanceService.update(nonExistentId, updatedPerformance);
        });
        verify(performanceRepository, never()).save(any(Performance.class));
    }

    @Test
    void testDeleteById_PerformanceExists() {
        when(performanceRepository.existsById(testPerformanceId)).thenReturn(true);
        doNothing().when(performanceRepository).deleteById(testPerformanceId);

        performanceService.deleteById(testPerformanceId);

        verify(performanceRepository, times(1)).existsById(testPerformanceId);
        verify(performanceRepository, times(1)).deleteById(testPerformanceId);
    }

    @Test
    void testDeleteById_PerformanceNotExists() {
        UUID nonExistentId = UUID.randomUUID();
        when(performanceRepository.existsById(nonExistentId)).thenReturn(false);

        assertThrows(ResponseStatusException.class, () -> {
            performanceService.deleteById(nonExistentId);
        });
        verify(performanceRepository, never()).deleteById(any(UUID.class));
    }

    @Test
    void testDeleteIfExists_PerformanceExists() {
        when(performanceRepository.findById(testPerformanceId)).thenReturn(Optional.of(testPerformance));
        doNothing().when(performanceRepository).delete(testPerformance);

        boolean result = performanceService.deleteIfExists(testPerformanceId);

        assertTrue(result);
        verify(performanceRepository, times(1)).delete(testPerformance);
    }

    @Test
    void testDeleteIfExists_PerformanceNotExists() {
        UUID nonExistentId = UUID.randomUUID();
        when(performanceRepository.findById(nonExistentId)).thenReturn(Optional.empty());

        boolean result = performanceService.deleteIfExists(nonExistentId);

        assertFalse(result);
        verify(performanceRepository, never()).delete(any(Performance.class));
    }

    @Test
    void testExists_True() {
        when(performanceRepository.existsById(testPerformanceId)).thenReturn(true);

        boolean exists = performanceService.exists(testPerformanceId);

        assertTrue(exists);
    }

    @Test
    void testExists_False() {
        UUID nonExistentId = UUID.randomUUID();
        when(performanceRepository.existsById(nonExistentId)).thenReturn(false);

        boolean exists = performanceService.exists(nonExistentId);

        assertFalse(exists);
    }

    @Test
    void testCount_Success() {
        when(performanceRepository.count()).thenReturn(15L);

        long count = performanceService.count();

        assertEquals(15L, count);
    }
}
