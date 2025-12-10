package com.gradesave.backend.controller;

import com.gradesave.backend.dto.user.*;
import com.gradesave.backend.models.Role;
import com.gradesave.backend.models.User;
import com.gradesave.backend.services.UserService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Stream;

/**
 * @author Daniel Hess
 * <p>
 * Controller for handling User REST endpoints.
 * Provides endpoints to create, retrieve, update, and delete users.
 * <p>
 * Implemented by Daniel Hess
 */

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final AuthenticationManager authenticationManager;

    public UserController(UserService userService, AuthenticationManager authenticationManager) {
        this.userService = userService;
        this.authenticationManager = authenticationManager;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestParam String username,
            @RequestParam String password,
            HttpServletRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(username, password)
            );

            SecurityContext securityContext = SecurityContextHolder.getContext();
            securityContext.setAuthentication(authentication);

            HttpSession session = request.getSession(true);
            session.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, securityContext);

            User user = userService.findByUsername(username);
            if (user == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
            }

            return ResponseEntity.ok(MeDTO.fromEntity(user));
        } catch (AuthenticationException e) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials"));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated() ||
                authentication.getPrincipal() instanceof String && authentication.getPrincipal().equals("anonymousUser")) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }

        String username = authentication.getName();
        User user = userService.findByUsername(username);

        if (user == null) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }

        return ResponseEntity.ok(MeDTO.fromEntity(user));
    }

    @PostMapping("/verify-password")
    public ResponseEntity<?> verifyPassword(@RequestBody Map<String, String> body) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated() ||
                "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.status(401).body(Map.of("valid", false, "error", "Not authenticated"));
        }

        String username = authentication.getName();
        String password = body.get("password");

        if (password == null || password.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("valid", false, "error", "Passwort fehlt!"));
        }

        User user = userService.findByUsername(username);

        if (user == null) {
            return ResponseEntity.status(404).body(Map.of("valid", false, "error", "User not found"));
        }

        boolean matches = userService.getPasswordEncoder().matches(password, user.getPassword());

        return ResponseEntity.ok(Map.of("valid", matches));
    }

    @PutMapping("/me/update-password")
    public ResponseEntity<?> updateOwnPassword(@RequestBody Map<String, String> body) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated() ||
            "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.status(401).build();
        }

        String username = authentication.getName();
        User user = userService.findByUsername(username);

        if (user == null) {
            return ResponseEntity.status(404).build();
        }

        String currentPassword = body.get("currentPassword");
        String newPassword = body.get("newPassword");


        if (user.getChangedDefaultPassword() && !userService.getPasswordEncoder().matches(currentPassword, user.getPassword())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Aktuelles Passwort ist falsch!"));
        }

        try {
            userService.validatePassword(newPassword);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("valid", false, "error", e.getMessage()));
        }

        user.setChangedDefaultPassword(true);
        user.setPassword(newPassword);
        userService.update(user.getId(), user);

        return ResponseEntity.ok(Map.of("message", "Password updated successfully"));
    }


    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request, HttpServletResponse response) {
        try {
            SecurityContextHolder.clearContext();

            HttpSession session = request.getSession(false);
            if (session != null) {
                session.invalidate();
            }

            Cookie cookie = new Cookie("JSESSIONID", null);
            cookie.setPath("/");
            cookie.setHttpOnly(true);
            cookie.setMaxAge(0);
            response.addCookie(cookie);

            return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Logout failed"));
        }
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<UserDto> createUser(@Valid @RequestBody CreateUserRequest req) {
        User entity = new User();

        entity.setUsername(req.username());
        entity.setFirstName(req.firstName());
        entity.setLastName(req.lastName());
        entity.setRole(req.role());
        entity.setPassword(req.password());

        User saved = userService.create(entity);
        return ResponseEntity.status(HttpStatus.CREATED).body(toDto(saved));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getUserById(@PathVariable UUID id) {
        return userService.getById(id)
                .map(u -> ResponseEntity.ok(toDto(u)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<List<UserDto>> getAllUsers() {
        List<UserDto> users = userService.getAll().stream().map(this::toDto).toList();
        return ResponseEntity.ok(users);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserDto> updateUser(@PathVariable UUID id, @Valid @RequestBody UpdateUserRequest req) {
        User patch = new User();
        patch.setUsername(req.username());
        patch.setFirstName(req.firstName());
        patch.setLastName(req.lastName());
        patch.setRole(req.role());
        patch.setPassword(req.password()); // may be null/blank => keep existing

        User updated = userService.update(id, patch);
        return ResponseEntity.ok(toDto(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable UUID id) {
        userService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/exists")
    public ResponseEntity<Boolean> userExists(@PathVariable UUID id) {
        return ResponseEntity.ok(userService.exists(id));
    }

    @GetMapping("/count")
    public ResponseEntity<Long> getUserCount() {
        return ResponseEntity.ok(userService.count());
    }

    @GetMapping(params = "role")
    public ResponseEntity<List<UserDto>> getAllUsersByRole(@RequestParam Role role) {
        List<UserDto> users = userService.GetUsersByRole(role).stream().map(this::toDto).toList();
        return ResponseEntity.ok(users);
    }

    @GetMapping("teachers")
    public ResponseEntity<TeacherDTO[]> getAllTeachers() {
        List<User> teachers = userService.GetUsersByRole(Role.TEACHER);
        List<User> admins = userService.GetUsersByRole(Role.ADMIN);

        return ResponseEntity.ok(
                Stream.concat(teachers.stream(), admins.stream())
                        .map(TeacherDTO::fromEntity)
                        .toArray(TeacherDTO[]::new));
    }

    @GetMapping("free/students")
    public ResponseEntity<List<StudentDTO>> getAllUnassignedStudents() {
        List<User> users = userService.getUnassignedStudents();
        List<StudentDTO> dtos = users.stream()
                .map(StudentDTO::fromEntity)
                .toList();

        return ResponseEntity.ok(dtos);
    }

    private UserDto toDto(User u) {
        return new UserDto(u.getId(), u.getUsername(), u.getFirstName(), u.getLastName(), u.getRole());
    }
}
