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
@CrossOrigin(origins = "*")
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

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);

        } catch (SecurityException ex) {
            log.warn("Security violation attempting to access: {}", filename);
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (Exception ex) {
            log.error("Error downloading PDF file: {}", filename, ex);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
}
