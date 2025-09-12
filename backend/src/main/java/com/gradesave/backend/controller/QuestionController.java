package com.gradesave.backend.controller;

import com.gradesave.backend.models.Question;
import com.gradesave.backend.services.QuestionService;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * @author: Michael Holl
 * <p>
 * Handles incoming HTTP requests for questions
 * </p>
 *
 *
 */
@RestController
@RequestMapping("/api/question")
public class QuestionController {

    private final QuestionService questionService;

    public QuestionController(QuestionService questionService) {
        this.questionService = questionService;
    }

    @PostMapping
    public Question createQuestion(@Valid @RequestBody Question question) {
        return questionService.create(question);
    }

    @GetMapping("/findAll")
    public List<Question> getAllQuestions() {
        return questionService.getAll();
    }
}
