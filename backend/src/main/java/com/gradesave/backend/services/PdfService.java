package com.gradesave.backend.services;

import com.gradesave.backend.models.User;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.File;
import java.io.FileOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;

/**
 * Service for generating PDF documents for user credentials
 * 
 * @author Daniel Hess
 */
@Service
public class PdfService {

    private static final String PDF_OUTPUT_DIR = "/home/dhess/dev/GradeSave/";

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
            PdfWriter.getInstance(document, new FileOutputStream(filepath));
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
                StringBuilder stringBuilder = new StringBuilder();

                for (var course : user.getCourses()) {
                    stringBuilder.append(course.getCourseName()).append(", ");
                }
                addTableRow(table, "Courses:", stringBuilder.toString().trim());
            } else {
                addTableRow(table, "Courses:", "None");
            }

            document.add(table);

            document.close();

            System.out.println("PDF generated successfully: " + filepath);
        } catch (Exception e) {
            System.err.println("Failed to generate PDF: " + e.getMessage());
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
            PdfWriter.getInstance(document, new FileOutputStream(filepath));
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
                    StringBuilder stringBuilder = new StringBuilder();

                    for (var course : user.getCourses()) {
                        stringBuilder.append(course.getCourseName()).append(", ");
                    }
                    addTableRow(table, "Courses:", stringBuilder.toString().trim());
                } else {
                    addTableRow(table, "Courses:", "None");
                }

                document.add(table);

                index++;
                row++;
                if (row == 3) {
                    document.newPage();
                    row = 1;
                }
            }

            document.close();

            System.out.println("Bulk PDF generated successfully: " + filepath);
        } catch (Exception e) {
            System.err.println("Failed to generate bulk PDF: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Helper method to add a row to the PDF table
     */
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
