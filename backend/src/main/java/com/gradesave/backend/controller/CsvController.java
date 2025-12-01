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
 * <p>
 *     controller for csv imports
 * </p>
 */

@RestController
@RequestMapping("/api/csv")
public class CsvController {
    private final CsvService csvService;

    public CsvController(CsvService csvService) {
        this.csvService = csvService;
    }

    @PostMapping("/upload")
    public ResponseEntity<CsvService.CsvResult> uploadAndParseCsv(@RequestPart("file") MultipartFile file, @RequestPart("metadata") CsvService.FileMetadata metadata) throws IOException {
        if (!Objects.equals(file.getContentType(), "application/vnd.ms-excel") && !Objects.equals(file.getContentType(), "text/csv")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid CSV file");
        }

        CsvService.CsvResult result = new CsvService.CsvResult();
        CsvService.CsvData data = csvService.parse(file, metadata, result);
        if (data == null) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to parse CSV file");
        }

        csvService.execute(data, result);

        if (!result.isSuccess()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(result);
        }

        return ResponseEntity.ok(result);
    }
}