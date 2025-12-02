package com.gradesave.backend.dto.group;

import java.util.UUID;

/**
 * @author: Michael Holl
 * <p>
 *   DTO for group dropdown in grade overview
 * </p>
 *
 **/

public record GroupSelectionDto(
        UUID id,
        String name
        ) {

}
