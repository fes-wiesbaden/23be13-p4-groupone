package com.gradesave.backend.controller;

import com.gradesave.backend.services.CsvService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.Objects;

/**
 * @author Paul Geisthardt
 *         <p>
 *         controller for csv imports
 *         </p>
 */

@RestController
@RequestMapping("/api/csv")
public class CsvController {
    private final CsvService csvServicee;

    public CsvController(CsvService csvServicee) {
        this.csvServicee = csvServicee;
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadAndParseCsv(@RequestPart("file") MultipartFile file) throws IOException {
        if (!Objects.equals(file.getContentType(), "application/vnd.ms-excel")
                && !Objects.equals(file.getContentType(), "text/csv")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid CSV file");
        }

        csvServicee.importUsersFromCsv(file);

        return ResponseEntity.ok("CSV file processed successfully");
    }
}