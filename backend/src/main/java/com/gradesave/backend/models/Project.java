package com.gradesave.backend.models;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
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
 * Creates project table
 * </p>
 *
 *
 */
@Entity
@Table(name = "project")
public class Project {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    private String name;

    @NotBlank(message = "projectStart is required")
    @Size(max = 100, message = "projectStart must not exceed 100 characters")
    @Column(name = "project_start")
    private LocalDate projectStart;

    @OneToMany(mappedBy = "project", fetch = FetchType.LAZY)
    @JsonIgnore
    private Set<ProjectQuestion> projectQuestions = new HashSet<>();

    @OneToMany(mappedBy = "project", fetch = FetchType.LAZY)
    @JsonIgnore
    private Set<ProjectSubject> projectSubjects = new HashSet<>();

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public Course getCourse() {
        return course;
    }

    public void setCourse(Course course) {
        this.course = course;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setId(String name) {
        this.name = name;
    }

    public LocalDate getProjectStart() {
        return projectStart;
    }

    public void setProjectStart(LocalDate projectStart) {
        this.projectStart = projectStart;
    }

    public void setId(LocalDate projectStart) {
        this.projectStart = projectStart;
    }

    public Set<ProjectQuestion> getProjectQuestions() {
        return projectQuestions;
    }

    public void setProjectQuestions(Set<ProjectQuestion> projectQuestions) {
        this.projectQuestions = projectQuestions;
    }

    public Set<ProjectSubject> getProjectSubjects() {
        return projectSubjects;
    }

    public void setProjectSubjects(Set<ProjectSubject> projectSubjects) {
        this.projectSubjects = projectSubjects;
    }

}
