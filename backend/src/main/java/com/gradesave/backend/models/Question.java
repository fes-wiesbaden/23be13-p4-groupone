// created by Michael Holl on 07.09.2025
package com.gradesave.backend.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.HashSet;
import java.util.Set;

/**
 * @author: Michael Holl
 * <p>
 *    Creates question and question_subject table
 * </p>
 *
 **/
@Entity
@Table(name = "question")
public class Question {
    @Id
    @GeneratedValue
    private Long id;

    @NotBlank(message = "text is required")
    @Size(max = 1000, message = "text must not exceed 1000 characters")
    private String text;

    @NotNull(message = "type is required")
    @Enumerated(EnumType.STRING)
    private QuestionType type;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "question_subject",
            joinColumns = @JoinColumn(name = "question_id"),
            inverseJoinColumns = @JoinColumn(name = "subject_id")
    )
    private Set<Subject> subjects = new HashSet<>();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public QuestionType getType() {
        return type;
    }

    public void setType(QuestionType type) {
        this.type = type;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public Set<Subject> getSubjects() {
        return subjects;
    }

    public void setSubjects(Set<Subject> subjects) {
        this.subjects = subjects;
    }
}
