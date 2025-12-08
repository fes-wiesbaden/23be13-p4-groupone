package com.gradesave.backend.controller;

import com.gradesave.backend.services.PdfService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.nio.file.NoSuchFileException;
import java.util.List;
import java.util.Map;

/**
 * @author Daniel Hess
 *         Controller for handling PDF file operations.
 *         Provides endpoints to list and download PDF files from the pdfs
 *         directory.
 */
@RestController
@RequestMapping("/api/pdfs")
public class PdfController {

    private static final Logger log = LoggerFactory.getLogger(PdfController.class);
    private final PdfService pdfService;

    public PdfController(PdfService pdfService) {
        this.pdfService = pdfService;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> listPdfs() {
        try {
            List<Map<String, Object>> pdfFiles = pdfService.listAllPdfFiles();
            return ResponseEntity.ok(pdfFiles);
        } catch (Exception ex) {
            log.error("Error listing PDF files", ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/download/{filename:.+}")
    public ResponseEntity<Resource> downloadPdf(@PathVariable String filename) {
        try {
            Resource resource = pdfService.getPdfFile(filename);
            String sanitizedFilename = sanitizeFilename(resource.getFilename());

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + sanitizedFilename + "\"")
                    .body(resource);

        } catch (SecurityException ex) {
            log.warn("Security violation attempting to access: {}", filename);
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (FileNotFoundException | NoSuchFileException ex) {
            log.warn("PDF file not found: {}", filename);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (IOException ex) {
            log.error("I/O error reading PDF file: {}", filename, ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        } catch (Exception ex) {
            log.error("Unexpected error downloading PDF file: {}", filename, ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Sanitizes a filename to prevent HTTP header injection attacks.
     * Removes or replaces characters that could be used for header injection.
     *
     * @param filename the original filename
     * @return sanitized filename safe for use in HTTP headers
     */
    private String sanitizeFilename(String filename) {
        if (filename == null) {
            return "download.pdf";
        }

        // Remove any characters that could break the quotes or inject headers
        // (quotes, backslashes, newlines, carriage returns, semicolons)
        String sanitized = filename
                .replace("\\", "")
                .replace("\"", "")
                .replace("\n", "")
                .replace("\r", "")
                .replace(";", "")
                .trim();

        // If sanitization removed everything, use a default name
        if (sanitized.isEmpty()) {
            sanitized = "download.pdf";
        }

        return sanitized;
    }
}
