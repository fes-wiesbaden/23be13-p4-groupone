// created by Michael Holl on 07.09.2025
package com.gradesave.backend.repositories;

import com.gradesave.backend.models.Subject;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubjectRepository extends JpaRepository<Subject, Long> {

}
