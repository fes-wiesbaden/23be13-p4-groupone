package com.gradesave.backend.models;

import jakarta.persistence.*;

import java.util.UUID;
//import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

//import java.util.HashSet;
//import java.util.Set;

@Entity
@Table(name="course")
public class Course {
    @Id
    @GeneratedValue
    private UUID id;

    private String courseName;


    public UUID getId() { return id; }

    public void setId(UUID id) { this.id = id; }

    public String getCourseName() { return courseName; }

    public void setCourseName(String courseName) { this.courseName = courseName; }
}
