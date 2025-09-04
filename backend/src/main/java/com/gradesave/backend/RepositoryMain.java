package com.gradesave.backend;

import com.gradesave.backend.models.Course;

import java.sql.Connection;
import java.sql.DriverManager;

public class RepositoryMain implements IRepository {
    public void insertCourse(Course course) {}
    public Course getCourseById(Long courseId) {
        return null;
    }
    public Course[]  getAllCourses() {
        Connection c = null;
        try {
            c = DriverManager
                .getConnection("jdbc:postgresql://localhost:15432/gradesave", "noahjbach", "cookiedough");
        } catch (Exception e) {
//            e.printStackTrace();
            System.err.println(e.getClass().getName()+": "+e.getMessage());
        }
        System.out.println("Connected to database successfully");
        return null;
    }
}
