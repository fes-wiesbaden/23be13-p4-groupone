package com.gradesave.backend.services;

import com.gradesave.backend.models.Project;
import com.gradesave.backend.repositories.ProjectRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class ProjectService implements CrudService<Project, UUID> {
    private final ProjectRepository repo;

    public ProjectService(ProjectRepository repo) {
        this.repo = repo;
    }

    @Override
    public Project create(Project entity) {
        return repo.save(entity);
    }

    @Override
    public Optional<Project> getById(UUID uuid) {
        return repo.findById(uuid);
    }

    @Override
    public List<Project> getAll() {
        return repo.findAll();
    }

    @Override
    public Project update(UUID uuid, Project entity) {
        return null;
    }

    @Override
    public void deleteById(UUID uuid) {
        repo.deleteById(uuid);
    }

    @Override
    public boolean deleteIfExists(UUID uuid) {
        Optional<Project> project = this.getById(uuid);
        if (project.isEmpty())
            return false;

        repo.delete(project.get());

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
