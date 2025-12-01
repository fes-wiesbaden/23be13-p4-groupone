package com.gradesave.backend;

import com.gradesave.backend.models.Role;
import com.gradesave.backend.models.User;
import com.gradesave.backend.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * @author Daniel Hess
 * Main Spring Boot application entry point.
 * <p>
 * Initializes default users (admin, teacher, student) on startup if configured.
 * </p>
 *
 */

@SpringBootApplication
public class BackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
    }

	@Bean
	CommandLineRunner init(UserRepository userRepository, PasswordEncoder passwordEncoder,
						   @Value("${app.default.admin.username:admin}") String adminUsername,
						   @Value("${app.default.admin.password:admin}") String adminPassword,
						   @Value("${app.default.teacher.username:teacher}") String teacherUsername,
						   @Value("${app.default.teacher.password:teacher}") String teacherPassword,
						   @Value("${app.default.student.username:student}") String studentUsername,
						   @Value("${app.default.student.password:student}") String studentPassword,
						   @Value("${app.init.default-users:false}") boolean initDefaultUsers) {
		return args -> {
			if (!initDefaultUsers) {
				System.out.println("Default user initialization is DISABLED. Set app.init.default-users=true to enable.");
				return;
			}

			if (adminPassword.isEmpty() || teacherPassword.isEmpty() || studentPassword.isEmpty()) {
				System.err.println("WARNING: Default user passwords not configured via environment variables!");
				System.err.println("Set app.default.admin.password, app.default.teacher.password, and app.default.student.password");
			}

			if (userRepository.findByUsername(adminUsername).isEmpty()) {
				User admin = new User();
				admin.setUsername(adminUsername);
				admin.setFirstName("Admin");
				admin.setLastName("User");
				admin.setRole(Role.ADMIN);
				admin.setPassword(passwordEncoder.encode(adminPassword));
				userRepository.save(admin);
				System.out.println("✓ Created admin user: " + adminUsername);
			}

			if (userRepository.findByUsername(teacherUsername).isEmpty()) {
				User teacher = new User();
				teacher.setUsername(teacherUsername);
				teacher.setFirstName("Teacher");
				teacher.setLastName("User");
				teacher.setRole(Role.TEACHER);
				teacher.setPassword(passwordEncoder.encode(teacherPassword));
				userRepository.save(teacher);
				System.out.println("✓ Created teacher user: " + teacherUsername);
			}
            if (userRepository.findByUsername(studentUsername).isEmpty()) {
				User student = new User();
				student.setUsername(studentUsername);
				student.setFirstName("Student");
				student.setLastName("User");
				student.setRole(Role.STUDENT);
				student.setPassword(passwordEncoder.encode(studentPassword));
				userRepository.save(student);
				System.out.println("✓ Created student user: " + studentUsername);
			}
		};
	}
}
