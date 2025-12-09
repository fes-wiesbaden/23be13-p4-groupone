package com.gradesave.backend.models;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonIgnore;

import com.gradesave.backend.dto.project.QuestionnaireActivityStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

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
    @JsonIgnore
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @NotBlank
    private String name;

    @NotNull(message = "projectStart is required")
    @Column(name = "project_start")
    private LocalDate projectStart;

    @OneToMany(mappedBy = "project", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private Set<ProjectQuestion> projectQuestions = new HashSet<>();

    @OneToMany(mappedBy = "project", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private Set<ProjectSubject> projectSubjects = new HashSet<>();

    @OneToMany(mappedBy = "project", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private Set<Group> groups = new HashSet<>();

    @NotNull
    @Enumerated(EnumType.STRING)
    private QuestionnaireActivityStatus activityStatus = QuestionnaireActivityStatus.EDITING;

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

    public LocalDate getProjectStart() {
        return projectStart;
    }

    public void setProjectStart(LocalDate projectStart) {
        this.projectStart = projectStart;
    }

    public Set<ProjectSubject> getProjectSubjects() {
        return projectSubjects;
    }

    public void setProjectSubjects(Set<ProjectSubject> projectSubjects) {
        this.projectSubjects = projectSubjects;
    }

    public Set<Group> getGroups() {
        return groups;
    }

    public void setGroups(Set<Group> groups) {
        this.groups = groups;
    }

    public Set<ProjectQuestion> getProjectQuestions() {
        return projectQuestions;
    }

    public void setProjectQuestions(Set<ProjectQuestion> projectQuestions) {
        this.projectQuestions = projectQuestions;
    }

    public QuestionnaireActivityStatus getActivityStatus() {
        return activityStatus;
    }

    public void setActivityStatus(QuestionnaireActivityStatus activityStatus) {
        this.activityStatus = activityStatus;
    }
}
