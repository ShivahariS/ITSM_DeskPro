package com.itsm.change.entity;

import com.itsm.change.enums.CABDecision;
import com.itsm.change.enums.ReviewStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "cab_reviews")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CABReview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long reviewID;

    private Long changeID;
    private LocalDateTime reviewDate;

    @Column(length = 500)
    private String attendeeIDs;

    @Enumerated(EnumType.STRING)
    private CABDecision decision;

    @Column(length = 2000)
    private String comments;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ReviewStatus status = ReviewStatus.SCHEDULED;
}
