package com.gradesave.backend;

import com.gradesave.backend.models.Course;

public interface IRepository {
    public void insertCourse(Course course);
    public Course getCourseById(Long courseId);
}
