package com.gradesave.backend.repositories;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.gradesave.backend.models.Subject;

/**
 * @author: Michael Holl
 * <p>
 * Handles database requests for subject table
 * </p>
 *
 *
 */
@Repository
public interface SubjectRepository extends JpaRepository<Subject, UUID> {

}
