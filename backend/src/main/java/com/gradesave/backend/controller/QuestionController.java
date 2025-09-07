// created by Michael Holl on 07.09.2025
package com.gradesave.backend.controller;

import com.gradesave.backend.models.Question;
import com.gradesave.backend.services.QuestionService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/question")
public class QuestionController {
    private final QuestionService questionService;

    public QuestionController(QuestionService questionService) {
        this.questionService = questionService;
    }

    @PostMapping
    public Question createQuestion(@RequestBody Question question) {
        return questionService.create(question);
    }

    @GetMapping("/findAll")
    public List<Question> getAllQuestions() {
        return questionService.getAll();
    }
}
