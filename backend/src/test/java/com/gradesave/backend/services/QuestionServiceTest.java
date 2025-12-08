package com.gradesave.backend.services;

import com.gradesave.backend.models.Question;
import com.gradesave.backend.models.QuestionType;
import com.gradesave.backend.models.Subject;
import com.gradesave.backend.repositories.QuestionRepository;
import com.gradesave.backend.repositories.SubjectRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anySet;
import static org.mockito.Mockito.*;

/**
 * Unit tests for QuestionService
 * Tests CRUD operations and business logic including subject validation
 */
@ExtendWith(MockitoExtension.class)
class QuestionServiceTest {

    @Mock
    private SubjectRepository subjectRepository;

    @Mock
    private QuestionRepository questionRepository;

    @InjectMocks
    private QuestionService questionService;

    private Question testQuestion;
    private UUID testQuestionId;
    private Subject testSubject1;
    private Subject testSubject2;

    @BeforeEach
    void setUp() {
        testQuestionId = UUID.randomUUID();
        
        testSubject1 = new Subject();
        testSubject1.setId(UUID.randomUUID());
        testSubject1.setName("Mathematics");
        
        testSubject2 = new Subject();
        testSubject2.setId(UUID.randomUUID());
        testSubject2.setName("Physics");
        
        testQuestion = new Question();
        testQuestion.setId(testQuestionId);
        testQuestion.setText("What is 2+2?");
        testQuestion.setType(QuestionType.TEXT);
        testQuestion.setSubjects(new HashSet<>(Arrays.asList(testSubject1, testSubject2)));
    }

    @Test
    void testCreate_WithValidSubjects_Success() {
        Set<UUID> subjectIds = new HashSet<>(Arrays.asList(testSubject1.getId(), testSubject2.getId()));
        List<Subject> foundSubjects = Arrays.asList(testSubject1, testSubject2);
        
        when(subjectRepository.findAllById(subjectIds)).thenReturn(foundSubjects);
        when(questionRepository.save(any(Question.class))).thenReturn(testQuestion);

        Question result = questionService.create(testQuestion);

        assertNotNull(result);
        assertEquals("What is 2+2?", result.getText());
        assertEquals(2, result.getSubjects().size());
        verify(subjectRepository, times(1)).findAllById(subjectIds);
        verify(questionRepository, times(1)).save(testQuestion);
    }

    @Test
    void testCreate_WithMissingSubjects_ThrowsException() {
        Set<UUID> subjectIds = new HashSet<>(Arrays.asList(testSubject1.getId(), testSubject2.getId()));
        List<Subject> foundSubjects = Arrays.asList(testSubject1); // Only one subject found
        
        when(subjectRepository.findAllById(subjectIds)).thenReturn(foundSubjects);

        assertThrows(RuntimeException.class, () -> {
            questionService.create(testQuestion);
        });
        verify(questionRepository, never()).save(any(Question.class));
    }

    @Test
    void testCreate_WithNoSubjects_Success() {
        testQuestion.setSubjects(new HashSet<>());
        
        when(subjectRepository.findAllById(anySet())).thenReturn(Collections.emptyList());
        when(questionRepository.save(any(Question.class))).thenReturn(testQuestion);

        Question result = questionService.create(testQuestion);

        assertNotNull(result);
        verify(questionRepository, times(1)).save(testQuestion);
    }

    @Test
    void testGetById_ReturnsEmpty() {
        UUID anyId = UUID.randomUUID();
        
        Optional<Question> result = questionService.getById(anyId);

        assertFalse(result.isPresent());
    }

    @Test
    void testGetAll_Success() {
        Question question2 = new Question();
        question2.setText("What is Newton's first law?");
        List<Question> questions = Arrays.asList(testQuestion, question2);
        when(questionRepository.findAll()).thenReturn(questions);

        List<Question> result = questionService.getAll();

        assertEquals(2, result.size());
        verify(questionRepository, times(1)).findAll();
    }

    @Test
    void testGetAll_Empty() {
        when(questionRepository.findAll()).thenReturn(Collections.emptyList());

        List<Question> result = questionService.getAll();

        assertTrue(result.isEmpty());
    }

    @Test
    void testUpdate_QuestionExists() {
        Question updatedQuestion = new Question();
        updatedQuestion.setText("Updated question text");
        updatedQuestion.setType(QuestionType.GRADE);
        updatedQuestion.setSubjects(new HashSet<>(Arrays.asList(testSubject1)));
        
        when(questionRepository.findById(testQuestionId)).thenReturn(Optional.of(testQuestion));
        when(questionRepository.save(any(Question.class))).thenReturn(testQuestion);

        Question result = questionService.update(testQuestionId, updatedQuestion);

        assertNotNull(result);
        assertEquals("Updated question text", testQuestion.getText());
        assertEquals(QuestionType.GRADE, testQuestion.getType());
        verify(questionRepository, times(1)).save(testQuestion);
    }

    @Test
    void testUpdate_QuestionNotExists() {
        UUID nonExistentId = UUID.randomUUID();
        Question updatedQuestion = new Question();
        updatedQuestion.setText("Updated text");
        
        when(questionRepository.findById(nonExistentId)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> {
            questionService.update(nonExistentId, updatedQuestion);
        });
        verify(questionRepository, never()).save(any(Question.class));
    }

    @Test
    void testDeleteById_Success() {
        doNothing().when(questionRepository).deleteById(testQuestionId);

        questionService.deleteById(testQuestionId);

        verify(questionRepository, times(1)).deleteById(testQuestionId);
    }

    @Test
    void testDeleteIfExists_AlwaysReturnsFalse() {
        // getById always returns Optional.empty(), so deleteIfExists always returns false
        UUID anyId = UUID.randomUUID();

        boolean result = questionService.deleteIfExists(anyId);

        assertFalse(result);
        verify(questionRepository, never()).delete(any(Question.class));
    }

    @Test
    void testDeleteIfExists_AnotherCase_AlwaysReturnsFalse() {
        UUID nonExistentId = UUID.randomUUID();

        boolean result = questionService.deleteIfExists(nonExistentId);

        assertFalse(result);
        verify(questionRepository, never()).delete(any(Question.class));
    }

    @Test
    void testExists_True() {
        when(questionRepository.existsById(testQuestionId)).thenReturn(true);

        boolean exists = questionService.exists(testQuestionId);

        assertTrue(exists);
    }

    @Test
    void testExists_False() {
        UUID nonExistentId = UUID.randomUUID();
        when(questionRepository.existsById(nonExistentId)).thenReturn(false);

        boolean exists = questionService.exists(nonExistentId);

        assertFalse(exists);
    }

    @Test
    void testCount_Success() {
        when(questionRepository.count()).thenReturn(20L);

        long count = questionService.count();

        assertEquals(20L, count);
    }
}
