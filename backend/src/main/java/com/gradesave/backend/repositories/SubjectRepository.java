package com.gradesave.backend.repositories;

import com.gradesave.backend.models.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

/**
 * @author: Michael Holl
 * <p>
 *    Handles database requests for subject table
 * </p>
 *
 **/
@Repository
public interface SubjectRepository extends JpaRepository<Subject, UUID> {

}
