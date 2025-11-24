package com.gradesave.backend.dto.project;

import java.util.List;
import java.util.UUID;

public class CreateProjectResponseDTO
{
    private List<String> errors;
    private ProjectSummaryDTO projectSummary;

    public CreateProjectResponseDTO(List<String> errors)
    {
        this.errors = errors;
    }

    public CreateProjectResponseDTO(ProjectSummaryDTO projectSummary)
    {
        this.projectSummary = projectSummary;
    }

    public List<String> getErrors() {
        return errors;
    }

    public void setErrors(List<String> errors) {
        this.errors = errors;
    }

    public ProjectSummaryDTO getProjectSummary() {
        return projectSummary;
    }

    public void setProjectSummary(ProjectSummaryDTO projectSummary) {
        this.projectSummary = projectSummary;
    }
}
