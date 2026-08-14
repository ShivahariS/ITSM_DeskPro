package com.itsm.notification.repository;

import com.itsm.notification.entity.ITSMReport;
import com.itsm.notification.enums.ReportScope;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ITSMReportRepository extends JpaRepository<ITSMReport, Long> {
    List<ITSMReport> findByScope(ReportScope scope);
    List<ITSMReport> findAllByOrderByGeneratedDateDesc();
}
