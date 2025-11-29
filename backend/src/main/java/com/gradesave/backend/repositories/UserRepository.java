package com.gradesave.backend.repositories;

import com.gradesave.backend.models.Role;
import com.gradesave.backend.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

import java.util.Optional;
import java.util.UUID;

/**
 * @author: Daniel Hess
 * <p>
 * Handles database requests for users
 * </p>
 *
 *
 */

public interface UserRepository extends JpaRepository<User, UUID> {
    @Query("select u from User u where u.username = ?1")
    Optional<User> findByUsername(String username);

    boolean existsByUsername(String username);

    List<User> findByRole(Role role);

    @Query("select u from User u where u.role = com.gradesave.backend.models.Role.STUDENT and u.courses is empty")
    List<User> findUnassignedStudents();

    List<User> findByCourses_Projects_IdAndRole(UUID projectId, Role role);

    List<User> findByGroups_IdAndRole(UUID groupId, Role role);
}
