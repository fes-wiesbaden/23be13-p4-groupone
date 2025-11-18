package com.gradesave.backend.repositories;

import com.gradesave.backend.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    @Query("select u from User u where u.username = ?1")
    Optional<User> findByUsername(String username);

    boolean existsByUsername(String username);
}
