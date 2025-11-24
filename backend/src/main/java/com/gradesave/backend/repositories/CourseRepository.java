package com.gradesave.backend.repositories;

import com.gradesave.backend.models.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;
import java.util.UUID;

/*
 * @author: Noah Bach
 *          <p>
 *          Creates subject table
 *          </p>
 */

public interface CourseRepository extends JpaRepository<Course, UUID> {
    @Query("SELECT c FROM Course c WHERE c.id = ?1")
    Optional<Course> findByIdTest(UUID uuid);
}
