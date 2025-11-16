package com.gradesave.backend.controller;

import com.gradesave.backend.dto.CreateUserRequest;
import com.gradesave.backend.dto.UpdateUserRequest;
import com.gradesave.backend.dto.UserDto;
import com.gradesave.backend.models.Role;
import com.gradesave.backend.models.User;
import com.gradesave.backend.services.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
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

    private UserDto toDto(User u) {
        return new UserDto(u.getId(), u.getUsername(), u.getFirstName(), u.getLastName(), u.getRole());
    }
}
