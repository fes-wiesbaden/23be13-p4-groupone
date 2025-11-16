package com.gradesave.backend.models;

import jakarta.persistence.*;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name="course")
public class Course {
    @Id
    @GeneratedValue
    private UUID id;

    private String courseName;
    private UUID teacherId;

    @ManyToMany
    @JoinTable(
            name = "course_user",
            joinColumns = @JoinColumn(name = "course_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private Set<User> users = new HashSet<>();

    public UUID getId() { return id; }

    public void setId(UUID id) { this.id = id; }

    public String getCourseName() { return courseName; }

    public void setCourseName(String courseName) { this.courseName = courseName; }

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
