package com.gradesave.backend.services;

import com.gradesave.backend.models.ProjectSubject;
import com.gradesave.backend.repositories.*;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
public class ProjectSubjectService {
    private final ProjectSubjectRepository projectSubjectRepository;


    public ProjectSubjectService(ProjectSubjectRepository projectSubjectRepository) {
        this.projectSubjectRepository = projectSubjectRepository;
    }

    public ProjectSubject findProjectSubjectById(UUID id) {
        Optional<ProjectSubject> projectSubject = projectSubjectRepository.findById(id);
        if (projectSubject.isPresent()) {
            return projectSubject.get();
        }
        else  {
            return null;
        }
    }

    public void deleteById(UUID projectSubjectId) {
        projectSubjectRepository.deleteById(projectSubjectId);
    }

    public Optional<ProjectSubject> findById(UUID projectSubjectId) {
        return projectSubjectRepository.findById(projectSubjectId);
    }

}
