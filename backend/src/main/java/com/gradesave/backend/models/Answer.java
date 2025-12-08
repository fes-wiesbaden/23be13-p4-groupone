package com.gradesave.backend.models;

import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

/**
 * @author: Michael Holl
 *          <p>
 *          Creates answer table
 *          </p>
 *
 *
 */
@Entity
@Table(name = "answer")
public class Answer {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "project_question_id", nullable = true)
    private ProjectQuestion projectQuestion;

    @ManyToOne
    @JoinColumn(name = "author_id", nullable = true)
    private User author;

    @ManyToOne
    @JoinColumn(name = "recipient_id", nullable = true)
    private User recipient;

    @Min(1)
    @Max(6)
    @Column(name = "answer_grade")
    private int answerGrade;

    @Column(name = "answer_text")
    private String answerText;

    public UUID getId() {
        return id;
    }

    public ProjectQuestion getProjectQuestion() {
        return projectQuestion;
    }

    public User getAuthor() {
        return author;
    }

    public User getRecipient() {
        return recipient;
    }

    public int getAnswerGrade() {
        return answerGrade;
    }

    public String getAnswerText() {
        return answerText;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public void setProjectQuestion(ProjectQuestion projectQuestion) {
        this.projectQuestion = projectQuestion;
    }

    public void setAuthor(User author) {
        this.author = author;
    }

    public void setRecipient(User recipient) {
        this.recipient = recipient;
    }

    public void setAnswerGrade(int answerGrade) {
        this.answerGrade = answerGrade;
    }

    public void setAnswerText(String answerText) {
        this.answerText = answerText;
    }
}
