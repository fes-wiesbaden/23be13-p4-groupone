package com.gradesave.backend.services;

import com.gradesave.backend.models.Role;
import com.gradesave.backend.models.User;
import jdk.jshell.spi.ExecutionControl;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
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

    public CsvService(UserService userService) {
        this.userService = userService;
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
        CLASSES
    }

    public static class FileMetadata {
        public CsvType type;
    }

    public static class UserDto {
        public String name;
        public String lastName;
        public String className;
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

    public static class CsvResult {
        private boolean success;
        private int processed;
        private int failed;
        private final List<String> errors = new ArrayList<>();

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
    }

    public CsvData parse(MultipartFile file, FileMetadata metadata) throws IOException {
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
                        String name = record.get("name");
                        String lastName = record.get("lastName");
                        String className = record.get("className");

                        if (name != null && !name.isEmpty() && lastName != null && !lastName.isEmpty() && className != null && !className.isEmpty()) {
                            UserDto dto = new UserDto();
                            dto.name = name;
                            dto.lastName = lastName;
                            dto.className = className;
                            users.add(dto);
                        }
                    }
                    return new UserData(users);
                }

                case CLASSES: {
                    throw new ExecutionControl.NotImplementedException("TODO: parse CLASSES");
                }

                default: {
                    throw new IOException();
                }
            }
        } catch (Exception e) {
            throw new IOException("Failed to parse CSV: ", e);
        }
    }

    public CsvResult execute(CsvData data) {
        CsvResult result = new CsvResult();

        switch (data.type) {
            case USERS: {
                UserData userData = (UserData) data;
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
                            }
                            username = baseUsername + counter;
                            counter += 1;
                        }


                        u.setFirstName(user.name);
                        u.setLastName(user.lastName);
                        u.setRole(Role.STUDENT);
                        u.setUsername(username);

                        User saved = userService.create(u);

                        if (saved != null) {
                            result.incrementProcessed();
                        } else {
                            result.incrementFailed();
                            result.addError("Row " + (i + 1) + ": failed to save user " +
                                    user.name + " " + user.lastName);
                        }
                    } catch (Exception e) {
                        result.incrementFailed();
                        result.addError("Row " + (i + 1) + ": " + e.getMessage());
                    }
                }

                break;
            }

            case CLASSES: {
                throw new AssertionError("TODO: execute CLASSES");
            }

            default: {
                throw new AssertionError("Unknown Ast type");
            }
        }

        result.setSuccess(result.getFailed() == 0);
        return result;
    }
}
