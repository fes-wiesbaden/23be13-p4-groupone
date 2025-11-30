package com.gradesave.backend;

import com.gradesave.backend.models.Role;
import com.gradesave.backend.models.User;
import com.gradesave.backend.repositories.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class BackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
    }

	@Bean
	CommandLineRunner init(UserRepository userRepository, PasswordEncoder passwordEncoder) {
		return args -> {
			if (userRepository.findByUsername("admin").isEmpty()) {
				User admin = new User();
				admin.setUsername("admin");
				admin.setPassword(passwordEncoder.encode("admin")); // Encode the password!
				admin.setFirstName("Admin");
				admin.setLastName("User");
				admin.setRole(Role.ADMIN); // Ensure Role enum has ADMIN
				userRepository.save(admin);
			}

			if (userRepository.findByUsername("teacher").isEmpty()) {
                User teacher = new User();
                teacher.setUsername("teacher");
                teacher.setPassword(passwordEncoder.encode("teacher"));
                teacher.setFirstName("John");
                teacher.setLastName("Teacher");
                // Ensure Role.TEACHER exists in your Role enum, otherwise use Role.USER
                teacher.setRole(Role.TEACHER);
                userRepository.save(teacher);
                System.out.println("Created teacher user");
            }

            if (userRepository.findByUsername("student").isEmpty()) {
                User user = new User();
                user.setUsername("student");
                user.setPassword(passwordEncoder.encode("student"));
                user.setFirstName("Jane");
                user.setLastName("Student");
                user.setRole(Role.STUDENT);
                userRepository.save(user);
                System.out.println("Created regular user");
            }
        };
    }
}
