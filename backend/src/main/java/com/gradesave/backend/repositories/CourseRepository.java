package com.gradesave.backend.repositories;

import com.gradesave.backend.models.Course;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

/*
 * @author: Noah Bach
 *          <p>
 *          Creates subject table
 *          </p>
 */

public interface CourseRepository extends JpaRepository<Course, UUID> {
}
