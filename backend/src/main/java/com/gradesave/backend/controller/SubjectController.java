package com.gradesave.backend.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gradesave.backend.models.Subject;
import com.gradesave.backend.services.SubjectService;

/**
 * @author: Michael Holl
 * <p>
 * Handles incoming HTTP requests for subjects
 * </p>
 *
 *
 */
@RestController
@RequestMapping("/api/subject")
public class SubjectController {

    private final SubjectService subjectService;

    public SubjectController(SubjectService subjectService) {
        this.subjectService = subjectService;
    }

    @PostMapping
    public Subject createSubject(@RequestBody Subject subject) {
        return subjectService.create(subject);
    }

    @PutMapping("/{id}")
    public Subject updateSubject(@PathVariable UUID id, @RequestBody Subject updatedSubject) {
        return subjectService.update(id, updatedSubject);
    }

    @DeleteMapping("/{id}")
    public void deleteSubject(@PathVariable UUID id) {
        subjectService.deleteById(id);
    }

    @GetMapping("/findAll")
    public List<Subject> getAllSubjects() {
        return subjectService.getAll();
    }
}
