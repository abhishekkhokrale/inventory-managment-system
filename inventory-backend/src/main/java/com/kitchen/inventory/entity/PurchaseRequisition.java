package com.kitchen.inventory.entity;

import com.kitchen.inventory.enums.PurchaseStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "purchase_requisitions", indexes = {
    @Index(name = "idx_pr_number", columnList = "requisition_number"),
    @Index(name = "idx_pr_status", columnList = "status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchaseRequisition extends BaseEntity {

    @Column(name = "requisition_number", nullable = false, unique = true, length = 30)
    private String requisitionNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "kitchen_id", nullable = false)
    private Kitchen kitchen;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requested_by", nullable = false)
    private User requestedBy;

    @Column(name = "required_date", nullable = false)
    private LocalDate requiredDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private PurchaseStatus status = PurchaseStatus.DRAFT;

    @Column(name = "remarks", columnDefinition = "TEXT")
    private String remarks;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by")
    private User approvedBy;

    @Column(name = "approved_at")
    private java.time.LocalDateTime approvedAt;

    @OneToMany(mappedBy = "purchaseRequisition", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<PurchaseRequisitionItem> items = new ArrayList<>();
}
