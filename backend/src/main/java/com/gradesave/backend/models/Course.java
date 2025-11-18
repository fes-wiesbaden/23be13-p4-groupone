package com.gradesave.backend.models;

import jakarta.persistence.*;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

/**
 * @author: Noah Bach, Daniel Hess
 *          <p>
 *          Creates course table
 *          </p>
 *          was protoyped by Noah Bach and finally implemented by Daniel Hess
 */

@Entity
@Table(name = "course")
public class Course {
    @Id
    @GeneratedValue
    @Column(name = "id")
    private UUID id;

    private String courseName;
    private UUID teacherId;

    @ManyToMany
    @JoinTable(name = "course_user", joinColumns = @JoinColumn(name = "course_id"), inverseJoinColumns = @JoinColumn(name = "user_id"))
    private Set<User> users = new HashSet<>();

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    // Mann muss für JPA einen No-Args-Konstruktor haben
    protected Course() {
    }

    public Course(String courseName, UUID teacherId) {
        this.courseName = courseName;
        this.teacherId = teacherId;
    }

    public Course(String courseName, UUID teacherId, Set<User> users) {
        this.courseName = courseName;
        this.teacherId = teacherId;
        this.users = users != null ? users : new HashSet<>();
    }

    public String getCourseName() {
        return courseName;
    }

    public void setCourseName(String courseName) {
        this.courseName = courseName;
    }

    public UUID getTeacherId() {
        return teacherId;
    }

    public void setTeacherId(UUID teacherId) {
        this.teacherId = teacherId;
    }

    public Set<User> getUsers() {
        return users;
    }

    public void setUsers(Set<User> users) {
        this.users = users;
    }
}
