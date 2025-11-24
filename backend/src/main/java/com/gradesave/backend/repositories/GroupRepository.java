package com.gradesave.backend.repositories;

import java.util.List;
import java.util.UUID;

import com.gradesave.backend.models.Group;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

/**
 * @author: Paul Geisthardt
 * <p>
 * Handles database requests for groups
 * </p>
 *
 *
 */
@Repository
public interface GroupRepository extends JpaRepository<Group, UUID> {

    @Query("""
        SELECT CASE WHEN COUNT(g) > 0 THEN TRUE ELSE FALSE END
        FROM Group g
        JOIN g.users u
        WHERE u.id = :userId
            AND g.project.id = :projectId
    """)
    boolean existsUserInProject(UUID userId, UUID projectId);

    List<Group> findAllByProjectId(UUID projectId);
}
