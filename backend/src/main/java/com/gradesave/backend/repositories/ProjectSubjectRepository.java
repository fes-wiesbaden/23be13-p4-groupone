package com.gradesave.backend.repositories;

import java.util.List;
import java.util.UUID;

import com.gradesave.backend.models.ProjectSubject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * @author: Michael Holl
 * <p>
 * Handles database requests for question table
 * </p>
 *
 *
 */
@Repository
public interface ProjectSubjectRepository extends JpaRepository<ProjectSubject, UUID> {
    List<ProjectSubject> findByProjectId(UUID projectId);
}
