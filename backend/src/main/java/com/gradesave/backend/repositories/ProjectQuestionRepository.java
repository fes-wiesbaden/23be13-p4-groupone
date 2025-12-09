package com.gradesave.backend.repositories;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.gradesave.backend.models.ProjectQuestion;

@Repository
public interface ProjectQuestionRepository extends JpaRepository<ProjectQuestion, UUID> {
}
