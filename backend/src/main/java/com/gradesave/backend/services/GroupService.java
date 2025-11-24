package com.gradesave.backend.services;

import com.gradesave.backend.models.Group;
import com.gradesave.backend.repositories.GroupRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class GroupService implements CrudService<Group, UUID> {
    private final GroupRepository repo;

    public GroupService(GroupRepository repo) {
        this.repo = repo;
    }

    @Override
    public Group create(Group entity) {
        return repo.save(entity);
    }

    @Override
    public Optional<Group> getById(UUID uuid) {
        return repo.findById(uuid);
    }

    @Override
    public List<Group> getAll() {
        return repo.findAll();
    }

    @Override
    public Group update(UUID uuid, Group entity) {
        Group existing = repo.findById(uuid).orElseThrow(() -> new EntityNotFoundException("Group not found: " + uuid));

        existing.setName(entity.getName());

        if (entity.getProject() != null)
            existing.setProject(entity.getProject());

        if (entity.getUsers() != null)
            existing.setUsers(entity.getUsers());

        return repo.save(existing);
    }

    @Override
    public void deleteById(UUID uuid) {
        repo.deleteById(uuid);
    }

    @Override
    public boolean deleteIfExists(UUID uuid) {
        Optional<Group> group = this.getById(uuid);
        if (group.isEmpty())
            return false;

        repo.delete(group.get());

        return true;
    }

    @Override
    public boolean exists(UUID uuid) {
        return repo.existsById(uuid);
    }

    @Override
    public long count() {
        return repo.count();
    }

    public List<Group> createGroups(List<Group> groups) {
        return repo.saveAll(groups);
    }

    public boolean existsUserInProject(UUID userId, UUID projectId) {
        return repo.existsUserInProject(userId, projectId);
    }

    public void deleteGroupsByProject(UUID projectId) {
        List<Group> groups = repo.findAllByProjectId(projectId);

        for (Group g : groups) {
            g.getUsers().clear();
        }

        repo.deleteAll(groups);
    }
}
