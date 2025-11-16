package com.gradesave.backend.repositories;

import com.gradesave.backend.models.Role;
import com.gradesave.backend.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
     List<User> findByRole(Role role);
}
