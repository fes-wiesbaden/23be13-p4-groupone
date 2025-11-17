package com.gradesave.backend.models;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;


/**
 * @author: Michael Holl
 * <p>
 * Creates subject table
 * </p>
 *
 *
 */
@Entity
@Table(name = "subject")
public class Subject {

    @Id
    @GeneratedValue
    private UUID id;

    @NotBlank(message = "name is required")
    @Size(max = 100, message = "name must not exceed 100 characters")
    private String name;

    @Size(max = 1000, message = "description must not exceed 1000 characters")
    private String description;

    @ManyToMany(mappedBy = "subjects")
    @JsonIgnore
    private Set<Question> questions = new HashSet<>();

    @Column(name = "is_learning_field")
    private boolean learningField;

    @OneToMany(mappedBy = "subject", fetch = FetchType.LAZY)
    @JsonIgnore
    private Set<ProjectSubject> projectSubjects = new HashSet<>();

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Set<Question> getQuestions() {
        return questions;
    }

    public void setQuestions(Set<Question> questions) {
        this.questions = questions;
    }

    public Set<ProjectSubject> getProjectSubjects() {
        return projectSubjects;
    }

    public void setProjectSubjects(Set<ProjectSubject> projectSubjects) {
        this.projectSubjects = projectSubjects;
    }

    public boolean isLearningField() {
        return learningField;
    }

    public void setLearningField(boolean learningField) {
        this.learningField = learningField;
    }
}
