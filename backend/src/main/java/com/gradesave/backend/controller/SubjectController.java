// created by Michael Holl on 07.09.2025
package com.gradesave.backend.controller;

import com.gradesave.backend.models.Subject;
import com.gradesave.backend.services.SubjectService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/subject")
public class SubjectController {
    private final SubjectService subjectService;

    public SubjectController(SubjectService subjectService) {
        this.subjectService = subjectService;
    }

    @GetMapping("/findAll")
    public List<Subject> getAllSubjects() {
        return subjectService.getAll();
    }
}
