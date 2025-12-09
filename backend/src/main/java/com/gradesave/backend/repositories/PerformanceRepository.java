package com.gradesave.backend.repositories;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.gradesave.backend.models.Performance;
import org.springframework.stereotype.Repository;

/**
 * @author: Michael Holl
 * <p>
 * Handles database requests for performances
 * </p>
 *
 *
 */

@Repository
public interface PerformanceRepository extends JpaRepository<Performance, UUID> {
    List<Performance> findByProjectSubject_Subject_Id(UUID subjectId);
    List<Performance> findByProjectSubjectId(UUID projectSubjectId);
}
