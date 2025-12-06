package com.gradesave.backend.controller;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import com.gradesave.backend.dto.grade.CalculateSubjectGradeDto;
import com.gradesave.backend.dto.grade.UpdateGradeRequest;
import com.gradesave.backend.services.GradeService;
import org.springframework.web.bind.annotation.*;

import com.gradesave.backend.dto.grade.GradeOverviewDto;

/**
 * @author: Michael Holl
 * <p>
 *       Controller for handling Grade REST endpoints.
 *       Provides endpoints to create, retrieve and update grades.
 * </p>
 *
 **/

@RestController
@RequestMapping("/api/grade")
public class GradeController {

    private final GradeService gradeService;

    public GradeController(GradeService gradeService) {
        this.gradeService = gradeService;
    }

    @GetMapping("/overview")
    public GradeOverviewDto getGradeOverview(@RequestParam UUID projectId, @RequestParam(required = false) UUID groupId) {
        return gradeService.loadGradeOverview(projectId, groupId);
    }

    @PostMapping("/save")
    public void saveGradeOverview(@RequestBody List<UpdateGradeRequest> request) {
        gradeService.saveGradeOverview(request);
    }

    @PostMapping("/calculateSubjectGrade")
    public BigDecimal calculateSubjectGrade(@RequestBody List<CalculateSubjectGradeDto> newGrades) {
        return gradeService.calculateSubjectGrade(newGrades);
    }
}
