package com.gradesave.backend.models;

import java.util.List;
import java.util.UUID;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * @author: Michael Holl
 * <p>
 * Creates performance table
 * </p>
 */
@Entity
@Table(name = "performance")
public class Performance {

    @Id
    @GeneratedValue
    private UUID id;

    @NotBlank(message = "name is required")
    @Size(max = 100, message = "name must not exceed 100 characters")
    String name;

    @ManyToOne
    @JoinColumn(name = "project_subject_id", nullable = false)
    private ProjectSubject projectSubject;

    @OneToMany(mappedBy = "performance")
    private List<Grade> grades;

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public ProjectSubject getProjectSubject() {
        return projectSubject;
    }

    public void setProjectSubject(ProjectSubject projectSubject) {
        this.projectSubject = projectSubject;
    }

    public List<Grade> getGrades() {
        return grades;
    }

    public void setGrades(List<Grade> grades) {
        this.grades = grades;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

}
