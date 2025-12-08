package com.gradesave.backend.services;

import com.gradesave.backend.models.ProjectSubject;
import com.gradesave.backend.repositories.*;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

/**
 * @author: Michael Holl
 * <p>
 * Business logic for projectSubjects
 * </p>
 *
 *
 */

@Service
public class ProjectSubjectService {
    private final ProjectSubjectRepository projectSubjectRepository;


    public ProjectSubjectService(ProjectSubjectRepository projectSubjectRepository) {
        this.projectSubjectRepository = projectSubjectRepository;
    }


    public void deleteById(UUID projectSubjectId) {
        projectSubjectRepository.deleteById(projectSubjectId);
    }

    public Optional<ProjectSubject> findById(UUID projectSubjectId) {
        return projectSubjectRepository.findById(projectSubjectId);
    }

    public ProjectSubject update(ProjectSubject entity) {
        return projectSubjectRepository.save(entity);
    }

}
