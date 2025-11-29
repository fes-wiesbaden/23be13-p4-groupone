package com.gradesave.backend.repositories;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.gradesave.backend.models.Grade;

/**
 * @author: Michael Holl
 * <p>
 * Handles database requests for grades
 * </p>
 *
 *
 **/

@Repository
public interface GradeRepository extends JpaRepository<Grade, UUID> {
    @Query("""
        SELECT g
        FROM Grade g
        JOIN g.performance p
        JOIN p.projectSubject ps
        WHERE ps.project.id = :projectId
    """)
    List<Grade> findByProjectId(UUID projectId);

    Grade findByPerformanceIdAndStudentId(UUID performanceId, UUID studentId);
}
