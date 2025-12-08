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
    LEFT JOIN g.performance p
    LEFT JOIN p.projectSubject ps
    LEFT JOIN g.projectSubject gps
    WHERE 
        (ps IS NOT NULL AND ps.project.id = :projectId)
        OR
        (gps IS NOT NULL AND gps.project.id = :projectId)
    """)
    List<Grade> findByProjectId(UUID projectId);

    @Query("""
    SELECT g
    FROM Grade g
    WHERE ((g.projectSubject.id = :projectSubjectId)
        OR
        (g.performance.id = :performanceId))
        AND g.student.id = :studentId
    """)
    Grade findByStudentIdAndPerformanceIdOrProjectSubjectId(UUID studentId, UUID performanceId, UUID projectSubjectId);

    Grade findByPerformanceIdAndStudentId(UUID performanceId, UUID studentId);
}
