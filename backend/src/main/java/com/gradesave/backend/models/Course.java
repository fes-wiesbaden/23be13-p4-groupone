package com.gradesave.backend.models;

import jakarta.persistence.*;

import java.util.UUID;

@Entity
@Table(name="course")
public class Course {
    @Id
    @GeneratedValue
    private UUID id;

    private String courseName;
    private UUID teacherId;


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
}
