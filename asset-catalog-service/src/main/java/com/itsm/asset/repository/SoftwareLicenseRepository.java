package com.itsm.asset.repository;

import com.itsm.asset.entity.SoftwareLicense;
import com.itsm.asset.enums.LicenseStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface SoftwareLicenseRepository extends JpaRepository<SoftwareLicense, Long> {
    List<SoftwareLicense> findByStatus(LicenseStatus status);
    List<SoftwareLicense> findByExpiryDateBefore(LocalDate date);
}
