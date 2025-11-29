package com.gradesave.backend.repositories;

import java.util.UUID;
import java.util.List;

import com.gradesave.backend.models.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * @author: Paul Geisthardt
 * <p>
 * Handles database requests for projects
 * </p>
 *
 *
 */
@Repository
public interface ProjectRepository extends JpaRepository<Project, UUID> {

    List<Project> findByCourseId(UUID courseId);
}
