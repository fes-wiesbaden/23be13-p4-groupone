package com.gradesave.backend.repositories;

import com.gradesave.backend.models.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Repository;


/**
 * @author: Daniel Hess
 *          <p>
 *          Handles database requests for courses
 *          </p>
 **/


@Repository
public interface CourseRepository extends JpaRepository<Course, UUID> {
    Optional<Course> findByCourseName(String courseName);

    @Query("select c from Course c join c.users u where u.id = ?1")
    List<Course> findAllByUserId(UUID studentId);

    @Query("SELECT c FROM Course c WHERE c.id = ?1")
    Optional<Course> findByIdTest(UUID uuid);
}
