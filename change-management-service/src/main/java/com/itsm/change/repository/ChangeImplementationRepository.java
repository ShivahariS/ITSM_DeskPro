package com.itsm.change.repository;

import com.itsm.change.entity.ChangeImplementation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ChangeImplementationRepository extends JpaRepository<ChangeImplementation, Long> {
    Optional<ChangeImplementation> findByChangeID(Long changeID);
}
