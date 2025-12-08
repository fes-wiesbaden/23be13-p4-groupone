package com.gradesave.backend.dto.subject;

import java.util.UUID;

public record EditProjectSubjectDto(UUID id,
                                    String shortName,
                                    Double duration,
                                    boolean learningField
                                    ) {

}
