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
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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

    @Size(max = 100, message = "name must not exceed 100 characters")
    String name;

    @NotBlank(message = "shortName is required")
    @Size(max = 3, message = "name must not exceed 3 characters")
    String shortName;

    @ManyToOne
    @JoinColumn(name = "project_subject_id", nullable = false)
    private ProjectSubject projectSubject;

    @OneToMany(mappedBy = "performance")
    private List<Grade> grades;

    @NotNull(message = "Weight is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Weight must be greater than 0")
    @DecimalMax(value = "1.0", inclusive = true, message = "Weight must be less than or equal to 1")
    private Double weight;

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

    public String getShortName() {
        return shortName;
    }

    public void setShortName(String shortName) {
        this.shortName = shortName;
    }

    public Double getWeight() {
        return weight;
    }

    public void setWeight(Double weight) {
        this.weight = weight;
    }

}
