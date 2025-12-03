package com.gradesave.backend.services;

import java.io.ByteArrayInputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.gradesave.backend.models.Course;
import com.gradesave.backend.models.Role;
import com.gradesave.backend.models.User;

@Service
public class CsvServicee {
    private final UserService userService;
    private final CourseService courseService;
    private final SecureRandom secureRandom;
    private final PdfService pdfService;
    private static final Logger log = LoggerFactory.getLogger(CsvServicee.class);

    public CsvServicee(UserService userService, CourseService courseService, SecureRandom secureRandom,
            PdfService pdfService) {
        this.userService = userService;
        this.courseService = courseService;
        this.secureRandom = secureRandom;
        this.pdfService = pdfService;
    }

    public void importUsersFromCsv(MultipartFile file) {
        char delimiter = ';';
        CSVFormat format = CSVFormat.DEFAULT.builder()
                .setHeader()
                .setSkipHeaderRecord(true)
                .setIgnoreHeaderCase(true)
                .setTrim(true)
                .setIgnoreEmptyLines(true)
                .setDelimiter(delimiter)
                .get();

        try {
            InputStreamReader reader = new InputStreamReader(new ByteArrayInputStream(file.getBytes()),
                    StandardCharsets.UTF_8);
            CSVParser parser = format.parse(reader);

            Map<User, String> usersWithPasswords = new HashMap<>();

            for (CSVRecord record : parser) {
                String firstName = record.get("name");
                String lastName = record.get("lastname");

                String className = null;
                if (record.isMapped("classname") && record.isSet("classname")) {
                    String temp = record.get("classname");
                    if (temp != null && !temp.isBlank()) {
                        className = temp;
                    }
                }

                String roleStr = "STUDENT";
                if (record.isMapped("role") && record.isSet("role")) {
                    String temp = record.get("role");
                    if (temp != null && !temp.isBlank()) {
                        roleStr = temp;
                    }
                }

                Role role;
                try {
                    role = Role.valueOf(roleStr.toUpperCase());
                } catch (IllegalArgumentException e) {
                    log.warn("Invalid role '{}' for user {} {}, defaulting to STUDENT",
                            roleStr, firstName, lastName);
                    role = Role.STUDENT;
                }

                User user = new User();
                user.setFirstName(firstName);
                user.setLastName(lastName);
                user.setRole(role);
                user.setUsername(firstName.toLowerCase() + "." + lastName.toLowerCase());

                String tempPassword = generateRandomPassword(12);
                user.setPassword(tempPassword);

                if (userService.getByUsername(user.getUsername()).isPresent()) {
                    log.warn("User with username '{}' already exists, skipping", user.getUsername());
                    continue;
                }

                User savedUser = userService.create(user, true);

                if (className != null) {
                    if (!courseService.isExistedByName(className)) {
                        log.warn("Course '{}' does not exist for user {} {}", className, firstName, lastName);
                    } else {
                        if ((savedUser.getRole() == Role.TEACHER || savedUser.getRole() == Role.ADMIN)
                                && className.contains(",")) {
                            String[] courseNames = className.split(",");
                            for (String courseName : courseNames) {
                                courseService.getByName(courseName.trim()).ifPresent(course -> {
                                    courseService.addStudent(course, savedUser);
                                    savedUser.getCourses().add(course);
                                });
                            }
                        } else {
                            courseService.getByName(className.trim()).ifPresent(course -> {
                                courseService.addStudent(course, savedUser);
                                savedUser.getCourses().add(course);
                            });
                        }
                    }
                }

                usersWithPasswords.put(savedUser, tempPassword);

            }

            log.info("Successfully parsed {} users from CSV", usersWithPasswords.size());

            if (!usersWithPasswords.isEmpty()) {
                try {
                    pdfService.generateBulkUserCredentialsPdf(usersWithPasswords);
                } catch (Exception e) {
                    System.err.println("Failed to generate bulk PDF: " + e.getMessage());
                }
            }

        } catch (Exception e) {
            log.error("Error importing users from CSV: {}", e.getMessage(), e);
        }
    }

    private String generateRandomPassword(int length) {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
        StringBuilder password = new StringBuilder();
        for (int i = 0; i < length; i++) {
            password.append(chars.charAt(secureRandom.nextInt(chars.length())));
        }
        return password.toString();
    }

}
