package com.gradesave.backend.repositories;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.gradesave.backend.models.Question;

/**
 * @author: Michael Holl
 * <p>
 * Handles database requests for question table
 * </p>
 *
 *
 */
@Repository
public interface QuestionRepository extends JpaRepository<Question, UUID> {

}
