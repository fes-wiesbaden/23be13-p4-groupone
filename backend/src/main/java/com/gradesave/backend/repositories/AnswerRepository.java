package com.gradesave.backend.repositories;

import com.gradesave.backend.models.Answer;
import com.gradesave.backend.models.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface AnswerRepository extends JpaRepository<Answer, UUID> {
    @Query("SELECT a FROM Answer a WHERE a.author.id = ?1 AND a.projectQuestion.project.id = ?2")
    List<Answer> findByAuthorIdAndProjectId(UUID userId, UUID projectId);
}
