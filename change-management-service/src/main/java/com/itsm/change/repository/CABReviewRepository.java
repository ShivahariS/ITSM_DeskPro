package com.itsm.change.repository;

import com.itsm.change.entity.CABReview;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface CABReviewRepository extends JpaRepository<CABReview, Long> {
    List<CABReview> findByChangeID(Long changeID);
    Optional<CABReview> findFirstByChangeIDOrderByReviewDateDesc(Long changeID);
}
