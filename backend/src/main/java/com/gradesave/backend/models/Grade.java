package com.gradesave.backend.models;

import java.math.BigDecimal;
import java.util.UUID;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

/**
 * @author: Michael Holl
 * <p>
 * Creates grade table
 * </p>
 *
 *
 */
@Entity
@Table(name = "grade")
public class Grade {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "performance_id")
    private Performance performance;

    @ManyToOne
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "project_subject_id")
    private ProjectSubject projectSubject;

    @DecimalMin(value = "1.0", inclusive = true, message = "grade must be greater or equal to 1")
    @DecimalMax(value = "6.0", inclusive = true, message = "grade must be less than or equal to 6")
    @NotNull(message = "grade is required")
    private BigDecimal grade;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private User student;


    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public void setPerformance(Performance performance) {
        this.performance = performance;
    }

    public Performance getPerformance() {
        return performance;
    }

    public BigDecimal  getGrade() {
        return grade;
    }

    public void setGrade(BigDecimal  grade) {
        this.grade = grade;
    }

    public User getStudent() {
        return student;
    }

    public void setStudent(User student) {
        this.student = student;
    }

    public ProjectSubject getProjectSubject() {
        return projectSubject;
    }

    public void setProjectSubject(ProjectSubject projectSubject) {
        this.projectSubject = projectSubject;
    }

}
