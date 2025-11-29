package com.gradesave.backend.services;

import com.gradesave.backend.models.Project;
import com.gradesave.backend.repositories.CourseRepository;
import com.gradesave.backend.repositories.GroupRepository;
import com.gradesave.backend.repositories.ProjectRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * @author: Paul Geisthardt
 * <p>
 * Business logic for projects
 * </p>
 */

@Service
@Transactional
public class ProjectService implements CrudService<Project, UUID> {
    private final CourseRepository courseRepository;
    private final ProjectRepository projectRepository;
    private final GroupRepository groupRepository;

    public ProjectService(CourseRepository courseRepository, ProjectRepository projectRepository, GroupRepository groupRepository) {
        this.courseRepository = courseRepository;
        this.projectRepository = projectRepository;
        this.groupRepository = groupRepository;
    }

    @Override
    public Project create(Project entity) {
        return projectRepository.save(entity);
    }

    @Override
    public Optional<Project> getById(UUID uuid) {
        return projectRepository.findById(uuid);
    }

    @Override
    public List<Project> getAll() {
        return projectRepository.findAll();
    }

    @Override
    public Project update(UUID uuid, Project entity) {
        Optional<Project> existingOpt = projectRepository.findById(uuid);

        if (existingOpt.isEmpty())
            throw new EntityNotFoundException("Project not found: " + uuid);

        Project existing = existingOpt.get();

        existing.setName(entity.getName());
        existing.setProjectStart(entity.getProjectStart());
        existing.setGroups(entity.getGroups());

        return projectRepository.save(existing);
    }

    @Override
    public void deleteById(UUID uuid) {
        projectRepository.deleteById(uuid);
    }

    @Override
    public boolean deleteIfExists(UUID uuid) {
        Optional<Project> project = this.getById(uuid);
        if (project.isEmpty())
            return false;

        projectRepository.delete(project.get());

        return true;
    }

    @Override
    public boolean exists(UUID uuid) {
        return false;
    }

    @Override
    public long count() {
        return 0;
    }
}
