package com.gradesave.backend.dto.project;

import java.time.LocalDate;

public record ProjectStartDateDTO(int year, int month, int day) {
    public LocalDate toLocalDate() {
        return LocalDate.of(year, month, day);
    }
}