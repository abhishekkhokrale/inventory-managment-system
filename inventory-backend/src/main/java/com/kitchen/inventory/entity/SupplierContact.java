package com.kitchen.inventory.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "supplier_contacts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupplierContact extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id", nullable = false)
    private Supplier supplier;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "designation", length = 100)
    private String designation;

    @Column(name = "email", length = 100)
    private String email;

    @Column(name = "phone", length = 20)
    private String phone;

    @Column(name = "is_primary")
    @Builder.Default
    private boolean primary = false;
}
