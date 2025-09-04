package com.gradesave.backend.models;

import jakarta.persistence.*;
//import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

//import java.util.HashSet;
//import java.util.Set;

@Entity
@Table(name="course")
public class Course {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String courseName;


    public Long getId() { return id; }

    public void setId(Long id) { this.id = id; }

    public String getCourseName() { return courseName; }

    public void setCourseName(String courseName) { this.courseName = courseName; }
}
