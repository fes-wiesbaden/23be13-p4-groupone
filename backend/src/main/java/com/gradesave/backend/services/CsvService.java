package com.gradesave.backend.services;

import com.gradesave.backend.models.Course;
import com.gradesave.backend.models.Role;
import com.gradesave.backend.models.User;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.util.StringUtils;

/**
 * @author: Paul Geisthardt
 * <p>
 *   Service to add Users/Classes via a csv file
 * </p>
 *
 **/

@Service
public class CsvService {
    private final UserService userService;
    private final CourseService courseService;
    private final SecureRandom secureRandom;

    public CsvService(UserService userService, CourseService courseService, SecureRandom secureRandom) {
        this.userService = userService;
        this.courseService = courseService;
        this.secureRandom = secureRandom;
    }

    public static abstract class CsvData {
        private final CsvType type;

        protected CsvData(CsvType type) {
            this.type = type;
        }

        public CsvType getType() {
            return type;
        }
    }

    public static class UserData extends CsvData {
        public List<UserDto> users;

        public UserData(List<UserDto> users) {
            super(CsvType.USERS);
            this.users = users;
        }
    }

    public enum CsvType {
        USERS,
    }

    public static class FileMetadata {
        public CsvType type;
    }

    public static class UserDto {
        public String name;
        public String lastName;
        public String className;
        public Role role;
    }

    // vllt brauchen wir?
    private char getDelimiter(String line) throws IOException {
        char[] delimiters = { ',', ';' };
        int maxAmount = -1;
        char delimiter = '\0';

        for (char delim : delimiters) {
            int amount = StringUtils.countOccurrencesOf(line, String.valueOf(delim));
            if (amount > maxAmount) {
                maxAmount = amount;
                delimiter = delim;
            }
        }

        if (maxAmount == -1) {
            throw new IOException("No delimiter found in line: \"" + line + "\"");
        }

        return delimiter;
    }

    public static class Creation {
        public String defaultPassword;
        public String name;
        public String lastName;
        public String className;
        public String userName;
    }

    public static class CsvResult {
        private boolean success;
        private int processed;
        private int failed;
        private final List<String> errors = new ArrayList<>();
        private final List<String> warnings = new ArrayList<>();
        private final List<Creation> creations = new ArrayList<>();

        public boolean isSuccess() {
            return success;
        }
        public void setSuccess(boolean success) {
            this.success = success;
        }

        public int getProcessed() {
            return processed;
        }
        public void incrementProcessed() {
            this.processed++;
        }

        public int getFailed() {
            return failed;
        }
        public void incrementFailed() {
            this.failed++;
        }

        public List<String> getErrors() {
            return errors;
        }
        public void addError(String error) {
            this.errors.add(error);
        }

        public List<Creation> getCreations() {
            return creations;
        }

        public void addCreation(Creation c) {
            this.creations.add(c);
        }

        public List<String> getWarnings() {
            return warnings;
        }

        public void addWarning(String warning) {
            this.warnings.add(warning);
        }
    }

    private String getOptional(CSVRecord record, CSVParser parser, String header) {
        if (!record.isMapped(header)) return null;
        Integer idx = parser.getHeaderMap().get(header);
        if (idx == null || idx >= record.size()) return null;
        return record.get(idx);
    }

    public CsvData parse(MultipartFile file, FileMetadata metadata, CsvResult result) throws IOException {
        if (metadata == null || metadata.type == null) {
            throw new IOException("Missing Metadata");
        }

        byte[] bytes = file.getBytes();
        if (bytes.length == 0) {
            throw new IOException("Empty file");
        }

        String content = new String(bytes);
        String firstLine = content.lines().findFirst().orElseThrow(() -> new IOException("No content in file"));

        char delimiter = ';'; // falls komma auch erlaubt werden soll getDelimiter(firstLine);

        CSVFormat format = CSVFormat.DEFAULT.builder().setHeader().setSkipHeaderRecord(true).setIgnoreHeaderCase(true).setTrim(true).setIgnoreEmptyLines(true).setDelimiter(delimiter).get();

        try (InputStreamReader reader = new InputStreamReader(new ByteArrayInputStream(bytes), StandardCharsets.UTF_8);
             CSVParser parser = format.parse(reader)) {

            switch (metadata.type) {

                case USERS: {
                    List<UserDto> users = new ArrayList<>();
                    for (CSVRecord record: parser) {
                        int rowNumber = (int)record.getRecordNumber();
                        if (record.size() < 2) {
                            result.incrementFailed();
                            result.addError("Too few fields in line " + rowNumber + ",got " + record.size() + ", need at least 2: 'name', 'lastname'");
                            continue;
                        }
                        String name = record.get("name");
                        String lastName = record.get("lastname");

                        String className = getOptional(record, parser, "classname");
                        String roleString = getOptional(record, parser, "role");
                        if (roleString == null)
                            roleString = "";
                        Role role;
                        switch (roleString) {
                            case "student" -> role = Role.STUDENT;
                            case "teacher" -> role = Role.TEACHER;
                            case "" -> {
                                result.addWarning("Row " + rowNumber + " is empty, defaulting to role `STUDENT`");
                                role = Role.STUDENT;
                            }
                            default -> {
                                result.addWarning("Row " + rowNumber + ": unkown role `" + roleString + "`, defaulting to role `STUDENT`");
                                role = Role.STUDENT;
                            }
                        }

                        if (name == null || name.isEmpty() || lastName == null || lastName.isEmpty()) {
                            result.incrementFailed();
                            result.addError("Row " + rowNumber + ": missing mandatory fields.");
                            continue;
                        }

                        UserDto dto = new UserDto();
                        dto.name = name;
                        dto.lastName = lastName;
                        dto.className = className;
                        dto.role = role;
                        users.add(dto);
                    }
                    return new UserData(users);
                }

                default: {
                    throw new IOException();
                }
            }
        } catch (Exception e) {
            throw new IOException("Failed to parse CSV: " + e.getMessage());
        }
    }

    private String createDefaultPassword() {
        String PASSWORD_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+";
        int passwordLength = 20;
        StringBuilder sb = new StringBuilder(passwordLength);

        for (int i = 0; i < passwordLength; ++i) {
            int index = secureRandom.nextInt(PASSWORD_CHARS.length());
            sb.append(PASSWORD_CHARS.charAt(index));
        }

        return sb.toString();
    }

    public void execute(CsvData data, CsvResult result) {

        switch (data.type) {
            case USERS: {
                UserData userData = (UserData) data;
                forLoop:
                for (int i = 0; i < userData.users.size(); ++i) {
                    UserDto user = userData.users.get(i);

                    try {
                        User u = new User();

                        String baseUsername = user.name.toLowerCase() + '.' + user.lastName.toLowerCase();
                        String username = baseUsername;

                        int counter = 1;
                        int boundary = 10;
                        while (userService.existsByUsername(username)) {
                            if (counter >= boundary) {
                                result.incrementFailed();
                                result.addError("Row " + (i + 1) + ": failed to create unique username for " +
                                        user.name + " " + user.lastName + "\nReached boundary of " + boundary);
                                continue forLoop;
                            }
                            username = baseUsername + counter;
                            counter += 1;
                        }


                        u.setFirstName(user.name);
                        u.setLastName(user.lastName);
                        u.setRole(user.role);
                        u.setUsername(username);

                        String initPassword = createDefaultPassword();
                        u.setPassword(initPassword);

                        User saved = userService.create(u);


                        if (saved == null) {
                            result.incrementFailed();
                            result.addError("Row " + (i + 1) + ": failed to save user " +
                                    user.name + " " + user.lastName);
                            continue;
                        }

                        Creation creation = new Creation();
                        creation.defaultPassword = initPassword;
                        creation.name = u.getFirstName();
                        creation.lastName = u.getLastName();
                        creation.userName = u.getUsername();
                        creation.className = null;


                        if (user.className != null && !user.className.isBlank()) {
                            Optional<Course> course = courseService.getByName(user.className);
                            Course classCourse;
                            if (course.isEmpty()) {
                                Course newCourse = new Course();
                                newCourse.setCourseName(user.className);
                                courseService.create(newCourse);
                                Optional<Course> testCourse = courseService.getByName(user.className);
                                if (testCourse.isEmpty()) {
                                    result.incrementFailed();
                                    result.addError("Failed to create Course: " + user.className);
                                    result.addCreation(creation);
                                    continue;
                                }
                                classCourse = testCourse.get();
                            } else {
                                classCourse = course.get();
                            }

                            if (!courseService.addStudent(classCourse, u)) {
                                result.incrementFailed();
                                result.addError("Row " + (i + 1) + ": failed add user to course " +
                                        user.name + " " + user.lastName + ": " + user.className);
                            } else {
                                result.incrementProcessed();
                                creation.className = user.className;
                            }
                        }

                        result.addCreation(creation);
                    } catch (Exception e) {
                        result.incrementFailed();
                        result.addError("Row " + (i + 1) + ": " + e.getMessage());
                    }
                }

                break;
            }

            default: {
                throw new AssertionError("Unknown Ast type");
            }
        }

        result.setSuccess(result.getFailed() == 0);
    }
}
