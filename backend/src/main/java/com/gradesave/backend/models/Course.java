package com.gradesave.backend.models;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * @author: Michael Holl
 * <p>
 * Creates course table
 * </p>
 */

@Entity
@Table(name = "course")
public class Course {

    @Id
    @GeneratedValue
    private UUID id;

    @NotBlank(message = "name is required")
    @Size(max = 100, message = "name must not exceed 100 characters")
    private String courseName;

    @ManyToOne
    @JoinColumn(name = "class_teacher_id", nullable = true)
    private User classTeacher;

    @ManyToMany
    @JoinTable(
            name = "course_membership",
            joinColumns = @JoinColumn(name = "course_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private Set<User> users = new HashSet<>();

    @OneToMany(mappedBy = "course", fetch = FetchType.LAZY)
    @JsonIgnore
    private Set<Project> projects = new HashSet<>();

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getCourseName() {
        return courseName;
    }

    public void setCourseName(String name) {
        this.courseName = name;
    }

    public void setProjects(Set<Project> projects) {
        this.projects = projects;
    }

    public Set<Project> getProjects() {
        return projects;
    }

    public User getClassTeacher() {
        return classTeacher;
    }

    public void setClassTeacher(User classTeacher) {
        this.classTeacher = classTeacher;
    }

    public Set<User> getUsers() {
        return users;
    }

    public void setUsers(Set<User> users) {
        this.users = users;
    }
}
