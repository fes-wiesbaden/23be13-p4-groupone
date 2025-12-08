package com.gradesave.backend.services;

import com.gradesave.backend.models.Course;
import com.gradesave.backend.models.User;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.DirectoryStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service for generating PDF documents for user credentials
 * 
 * @author Daniel Hess
 */
@Service
public class PdfService {

    private static final String PDF_OUTPUT_DIR = "pdfs/";
    private static final Logger log = LoggerFactory.getLogger(PdfService.class);

    /**
     * Generates a PDF document containing user credentials
     * 
     * @param user          The user object containing credentials
     * @param plainPassword The plain text password (before encoding)
     */
    public void generateUserCredentialsPdf(User user, String plainPassword) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String filename = String.format("user_credentials_%s_%s.pdf", user.getUsername(), timestamp);
        String filepath = PDF_OUTPUT_DIR + filename;

        try {
            File directory = new File(PDF_OUTPUT_DIR);
            if (!directory.exists()) {
                directory.mkdirs();
            }

            Document document = new Document(PageSize.A4);
            try (FileOutputStream fos = new FileOutputStream(filepath)) {
                PdfWriter.getInstance(document, fos);
                document.open();

                Font titleFont = new Font(Font.HELVETICA, 20, Font.BOLD);
                Paragraph title = new Paragraph("GradeSave - User Credentials", titleFont);
                title.setAlignment(Element.ALIGN_CENTER);
                title.setSpacingAfter(20);
                document.add(title);

                Font dateFont = new Font(Font.HELVETICA, 10);
                Paragraph date = new Paragraph(
                        "Created: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm:ss")),
                        dateFont);
                date.setAlignment(Element.ALIGN_CENTER);
                date.setSpacingAfter(30);
                document.add(date);

                PdfPTable table = new PdfPTable(2);
                table.setWidthPercentage(100);
                table.setWidths(new float[] { 30, 70 });

                addTableRow(table, "Username:", user.getUsername());
                addTableRow(table, "Password:", plainPassword);
                addTableRow(table, "First Name:", user.getFirstName());
                addTableRow(table, "Last Name:", user.getLastName());

                if (user.getCourses().size() == 1) {
                    addTableRow(table, "Course:", user.getCourses().iterator().next().getCourseName());
                } else if (user.getCourses().size() > 1) {
                    String result = user.getCourses()
                            .stream()
                            .map(Course::getCourseName)
                            .collect(Collectors.joining(","));
                    addTableRow(table, "Courses:", result.trim());
                } else {
                    addTableRow(table, "Courses:", "None");
                }

                document.add(table);

                document.close();

                log.info("PDF generated successfully: {}", filepath);
            }
        } catch (Exception e) {
            log.error("Failed to generate PDF: {}", e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Generates a single PDF document containing credentials for multiple users
     * 
     * @param usersWithPasswords Map of User to their plain text passwords
     */
    public void generateBulkUserCredentialsPdf(Map<User, String> usersWithPasswords) {
        if (usersWithPasswords == null || usersWithPasswords.isEmpty()) {
            return;
        }

        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String filename = String.format("bulk_user_credentials_%s.pdf", timestamp);
        String filepath = PDF_OUTPUT_DIR + filename;

        try {
            File directory = new File(PDF_OUTPUT_DIR);
            if (!directory.exists()) {
                directory.mkdirs();
            }

            Document document = new Document(PageSize.A4);
            try (FileOutputStream fos = new FileOutputStream(filepath)) {
                PdfWriter.getInstance(document, fos);
                document.open();

                Font mainTitleFont = new Font(Font.HELVETICA, 24, Font.BOLD);
                Paragraph mainTitle = new Paragraph("GradeSave - Bulk User Credentials", mainTitleFont);
                mainTitle.setAlignment(Element.ALIGN_CENTER);
                mainTitle.setSpacingAfter(10);
                document.add(mainTitle);

                Font dateFont = new Font(Font.HELVETICA, 10);
                Paragraph date = new Paragraph(
                        "Created: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm:ss")),
                        dateFont);
                date.setAlignment(Element.ALIGN_CENTER);
                date.setSpacingAfter(20);
                document.add(date);

                Font countFont = new Font(Font.HELVETICA, 12, Font.BOLD);
                Paragraph userCount = new Paragraph("Total Users: " + usersWithPasswords.size(), countFont);
                userCount.setAlignment(Element.ALIGN_CENTER);
                userCount.setSpacingAfter(30);
                document.add(userCount);

                int index = 1;
                int row = 1;
                for (Map.Entry<User, String> entry : usersWithPasswords.entrySet()) {
                    User user = entry.getKey();
                    String plainPassword = entry.getValue();

                    Font userTitleFont = new Font(Font.HELVETICA, 16, Font.BOLD);
                    Paragraph userTitle = new Paragraph("User " + index + " of " + usersWithPasswords.size(),
                            userTitleFont);
                    userTitle.setSpacingBefore(10);
                    userTitle.setSpacingAfter(10);
                    document.add(userTitle);

                    PdfPTable table = new PdfPTable(2);
                    table.setWidthPercentage(100);
                    table.setWidths(new float[] { 30, 70 });

                    addTableRow(table, "Username:", user.getUsername());
                    addTableRow(table, "Password:", plainPassword);
                    addTableRow(table, "First Name:", user.getFirstName());
                    addTableRow(table, "Last Name:", user.getLastName());

                    if (user.getCourses().size() == 1) {
                        addTableRow(table, "Course:", user.getCourses().iterator().next().getCourseName());
                    } else if (user.getCourses().size() > 1) {
                        String result = user.getCourses()
                                .stream()
                                .map(Course::getCourseName)
                                .collect(Collectors.joining(","));
                        addTableRow(table, "Courses:", result);

                    } else {
                        addTableRow(table, "Courses:", "None");
                    }

                    document.add(table);

                    index++;
                    row++;
                    if (row == 4) {
                        document.newPage();
                        row = 1;
                    }
                }

                document.close();

                log.info("Bulk PDF generated successfully: {}", filepath);
            }
        } catch (Exception e) {
            log.error("Failed to generate bulk PDF: {}", e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Lists all PDF files in the PDF directory
     * 
     * @return List of maps containing file information (name, size, lastModified)
     * @throws IOException if directory cannot be read
     */
    public List<Map<String, Object>> listAllPdfFiles() throws IOException {
        Path pdfStorageLocation = Paths.get(PDF_OUTPUT_DIR).toAbsolutePath().normalize();
        List<Map<String, Object>> pdfFiles = new ArrayList<>();

        if (!Files.exists(pdfStorageLocation)) {
            log.warn("PDF directory does not exist: {}", pdfStorageLocation);
            return pdfFiles;
        }

        try (DirectoryStream<Path> stream = Files.newDirectoryStream(pdfStorageLocation, "*.pdf")) {
            for (Path entry : stream) {
                Map<String, Object> fileInfo = new HashMap<>();
                fileInfo.put("name", entry.getFileName().toString());
                fileInfo.put("size", Files.size(entry));
                fileInfo.put("lastModified", Files.getLastModifiedTime(entry).toMillis());
                pdfFiles.add(fileInfo);
            }
        }

        log.info("Found {} PDF files", pdfFiles.size());
        return pdfFiles;
    }

    /**
     * Retrieves a PDF file as a Resource
     * 
     * @param filename The name of the PDF file to retrieve
     * @return Resource object representing the PDF file
     * @throws IOException       if file cannot be read
     * @throws SecurityException if file is outside the PDF directory
     */
    public Resource getPdfFile(String filename) throws IOException, SecurityException {
        Path pdfStorageLocation = Paths.get(PDF_OUTPUT_DIR).toAbsolutePath().normalize();
        Path filePath = pdfStorageLocation.resolve(filename).normalize();

        if (!filePath.startsWith(pdfStorageLocation)) {
            log.warn("Attempted to access file outside PDF directory: {}", filename);
            throw new SecurityException("Access denied: File is outside PDF directory");
        }

        Resource resource = new UrlResource(filePath.toUri());

        if (!resource.exists() || !resource.isReadable()) {
            log.warn("PDF file not found or not readable: {}", filename);
            throw new IOException("File not found or not readable: " + filename);
        }

        return resource;
    }

    private void addTableRow(PdfPTable table, String label, String value) {
        Font labelFont = new Font(Font.HELVETICA, 12, Font.BOLD);
        Font valueFont = new Font(Font.HELVETICA, 12);

        PdfPCell labelCell = new PdfPCell(new Phrase(label, labelFont));
        labelCell.setBackgroundColor(new Color(240, 240, 240));
        labelCell.setPadding(8);

        PdfPCell valueCell = new PdfPCell(new Phrase(value != null ? value : "N/A", valueFont));
        valueCell.setPadding(8);

        table.addCell(labelCell);
        table.addCell(valueCell);
    }
}
