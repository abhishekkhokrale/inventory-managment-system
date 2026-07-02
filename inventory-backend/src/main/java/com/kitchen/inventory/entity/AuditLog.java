package com.kitchen.inventory.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs", indexes = {
    @Index(name = "idx_audit_entity", columnList = "entity_type,entity_id"),
    @Index(name = "idx_audit_user", columnList = "user_id"),
    @Index(name = "idx_audit_action", columnList = "action"),
    @Index(name = "idx_audit_date", columnList = "action_date")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "entity_type", nullable = false, length = 50)
    private String entityType;

    @Column(name = "entity_id", length = 50)
    private String entityId;

    @Column(name = "action", nullable = false, length = 20)
    private String action; // CREATE, UPDATE, DELETE, VIEW

    @Column(name = "old_values", columnDefinition = "JSONB")
    private String oldValues;

    @Column(name = "new_values", columnDefinition = "JSONB")
    private String newValues;

    @Column(name = "user_id", nullable = false, length = 50)
    private String userId;

    @Column(name = "username", nullable = false, length = 100)
    private String username;

    @Column(name = "ip_address", length = 50)
    private String ipAddress;

    @Column(name = "user_agent", columnDefinition = "TEXT")
    private String userAgent;

    @Column(name = "action_date", nullable = false)
    private LocalDateTime actionDate;

    @Column(name = "remarks", columnDefinition = "TEXT")
    private String remarks;
}
