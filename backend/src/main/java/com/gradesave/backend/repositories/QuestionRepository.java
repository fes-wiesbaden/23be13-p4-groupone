// created by Michael Holl on 07.09.2025
package com.gradesave.backend.repositories;

import com.gradesave.backend.models.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * @author: Michael Holl
 * <p>
 *    Handles database requests for question table
 * </p>
 *
 **/
@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {

}
