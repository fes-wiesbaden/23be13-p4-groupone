package com.gradesave.backend.repositories;

import java.util.UUID;
import java.util.List;

import com.gradesave.backend.models.Grade;
import com.gradesave.backend.models.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
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
    @Query("""
        SELECT CASE WHEN COUNT(p) > 0 THEN TRUE ELSE FALSE END
        FROM Project p
        JOIN p.course c
        JOIN c.users u
        WHERE u.id = :userId
            AND p.id = :projectId
    """)
    boolean existsUserInProject(UUID userId, UUID projectId);

    List<Project> findByCourseId(UUID courseId);
}
