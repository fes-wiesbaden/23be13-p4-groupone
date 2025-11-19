package com.gradesave.backend.services;

import com.gradesave.backend.models.Role;
import com.gradesave.backend.models.User;
import com.gradesave.backend.repositories.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class UserService implements CrudService<User, UUID> {

    private final UserRepository repo;
    private final PasswordEncoder encoder;

    public UserService(UserRepository repo, PasswordEncoder encoder) {
        this.repo = repo;
        this.encoder = encoder;
    }

    @Override
    public User create(User entity) {
        entity.setPassword(encoder.encode(entity.getPassword()));
        return repo.save(entity);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<User> getById(UUID id) {
        return repo.findById(id);
    }

    @Transactional(readOnly = true)
    public Optional<User> getByUsername(String name) {
        return repo.findByUsername(name);
    }

    @Transactional(readOnly = true)
    public boolean existsByUsername(String name) {
        return repo.existsByUsername(name);
    }

    @Override
    @Transactional(readOnly = true)
    public List<User> getAll() {
        return repo.findAll();
    }

    @Override
    public User update(UUID id, User patch) {
        User existing = repo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found: " + id));

        existing.setUsername(patch.getUsername());
        existing.setFirstName(patch.getFirstName());
        existing.setLastName(patch.getLastName());
        existing.setRole(patch.getRole());

        if (patch.getPassword() != null && !patch.getPassword().isBlank()) {
            existing.setPassword(encoder.encode(patch.getPassword()));
        }

        return repo.save(existing);
    }

    @Override
    public void deleteById(UUID id) {
        if (!repo.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found: " + id);
        }
        repo.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean exists(UUID id) {
        return repo.existsById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public long count() {
        return repo.count();
    }

    public List<User> GetUsersByRole(Role role){
        return repo.findByRole(role);
    }
}
