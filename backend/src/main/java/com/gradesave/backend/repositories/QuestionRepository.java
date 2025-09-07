// created by Michael Holl on 07.09.2025
package com.gradesave.backend.repositories;

import com.gradesave.backend.models.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {
    @Query("SELECT q FROM Question q JOIN q.subjects s WHERE q.id = :questionId")
    Question findQuestionWithSubjectsById(@Param("questionId") Long questionId);
}
