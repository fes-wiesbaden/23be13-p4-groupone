package com.gradesave.backend.services;

import com.gradesave.backend.models.Role;
import com.gradesave.backend.models.User;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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

    private final com.gradesave.backend.repositories.UserRepository repo;
    private final PasswordEncoder encoder;
    private final CourseService courseService;
    private final PdfService pdfService;

    public UserService(com.gradesave.backend.repositories.UserRepository repo, PasswordEncoder encoder,
                       CourseService courseService, PdfService pdfService) {
        this.repo = repo;
        this.encoder = encoder;
        this.courseService = courseService;
        this.pdfService = pdfService;
    }

    public User findByUsername(String username) {
        return repo.findByUsername(username).orElse(null);
    }

    @Override
    public User create(User entity) {
        return create(entity, false);
    }

    public User create(User entity, boolean bulkCreate) {
        String plainPassword = entity.getPassword();
        entity.setPassword(encoder.encode(entity.getPassword()));
        User saved = repo.save(entity);

        if (!bulkCreate) {
            try {
                pdfService.generateUserCredentialsPdf(saved, plainPassword);
            } catch (Exception e) {
                System.err.println("Failed to generate PDF for user " + saved.getUsername() + ": " + e.getMessage());
                // Continue even if PDF generation fails
            }
        }

        return saved;
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
        User existing = repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found: " + id));

        existing.setUsername(patch.getUsername());
        existing.setFirstName(patch.getFirstName());
        existing.setLastName(patch.getLastName());
        existing.setRole(patch.getRole());
        existing.setChangedDefaultPassword(patch.getChangedDefaultPassword());

        if (patch.getPassword() != null && !patch.getPassword().isBlank()) {
            existing.setPassword(encoder.encode(patch.getPassword()));
        }

        return repo.save(existing);
    }

    @Override
    public void deleteById(UUID id) {
        if (!repo.existsById(id))
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found: " + id);

        if (!courseService.removeUserFromAllCourses(id))
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Failed to remove User from all courses");

        repo.deleteById(id);
    }

    @Override
    public boolean deleteIfExists(UUID uuid) {

        Optional<User> user = this.getById(uuid);
        if (user.isEmpty())
            return false;

        repo.delete(user.get());

        return true;

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

    public List<User> GetUsersByRole(Role role) {
        return repo.findByRole(role);
    }

    public List<User> getUnassignedStudents() {
        return repo.findUnassignedStudents();
    }

    public List<User> getUsersByIds(List<UUID> uuids) {
        return repo.findAllById(uuids);
    }

    public Optional<User> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated() ||
                authentication.getPrincipal() instanceof String && authentication.getPrincipal().equals("anonymousUser")) {
            return Optional.empty();
        }

        String username = authentication.getName();
        User user = this.findByUsername(username);

        if (user == null)
            return Optional.empty();

        return Optional.of(user);
    }

    public PasswordEncoder getPasswordEncoder() {
        return encoder;
    }

    public void validatePassword(String password) {
        if (password == null) {
            throw new IllegalArgumentException("Passwort darf nicht null sein");
        }

        String trimmed = password.trim();

        if (trimmed.length() < 8 || trimmed.length() > 50) {
            throw new IllegalArgumentException("Passwort muss zwischen 8 und 50 Zeichen lang sein");
        }
    }
}
