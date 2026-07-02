package com.kitchen.inventory.controller;

import com.kitchen.inventory.dto.response.PagedResponse;
import com.kitchen.inventory.entity.Kitchen;
import com.kitchen.inventory.entity.PurchaseOrder;
import com.kitchen.inventory.entity.PurchaseOrderItem;
import com.kitchen.inventory.entity.Supplier;
import com.kitchen.inventory.enums.PurchaseStatus;
import com.kitchen.inventory.exception.ResourceNotFoundException;
import com.kitchen.inventory.repository.IngredientRepository;
import com.kitchen.inventory.repository.KitchenRepository;
import com.kitchen.inventory.repository.PurchaseOrderRepository;
import com.kitchen.inventory.repository.SupplierRepository;
import com.kitchen.inventory.repository.UnitOfMeasureRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/purchase-orders")
@RequiredArgsConstructor
@Tag(name = "Purchase Orders", description = "Purchase order management APIs")
@SecurityRequirement(name = "bearerAuth")
public class PurchaseOrderController {

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final KitchenRepository kitchenRepository;
    private final SupplierRepository supplierRepository;
    private final IngredientRepository ingredientRepository;
    private final UnitOfMeasureRepository uomRepository;

    @Data
    public static class CreatePurchaseOrderRequest {
        @NotNull private UUID kitchenId;
        @NotNull private UUID supplierId;
        @NotNull private LocalDate orderDate;
        private LocalDate expectedDeliveryDate;
        private String paymentTerms;
        private String deliveryAddress;
        private String remarks;
        private List<OrderItemRequest> items;
    }

    @Data
    public static class OrderItemRequest {
        @NotNull private UUID ingredientId;
        @NotNull private UUID unitOfMeasureId;
        @NotNull private BigDecimal quantityOrdered;
        @NotNull private BigDecimal unitPrice;
        private BigDecimal taxPercent;
        private BigDecimal discountPercent;
    }

    @GetMapping
    @Operation(summary = "List purchase orders")
    @PreAuthorize("hasAuthority('PURCHASE_READ')")
    public ResponseEntity<PagedResponse<PurchaseOrder>> listOrders(
            @RequestParam(required = false) UUID supplierId,
            @RequestParam(required = false) PurchaseStatus status,
            @RequestParam(required = false) LocalDate fromDate,
            @RequestParam(required = false) LocalDate toDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        LocalDate effectiveFrom = fromDate != null ? fromDate : LocalDate.of(2000, 1, 1);
        LocalDate effectiveTo = toDate != null ? toDate : LocalDate.now().plusYears(100);
        var orders = purchaseOrderRepository.searchOrders(
            null, supplierId, status, effectiveFrom, effectiveTo, PageRequest.of(page, size));
        return ResponseEntity.ok(PagedResponse.from(orders));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get purchase order by ID")
    @PreAuthorize("hasAuthority('PURCHASE_READ')")
    public ResponseEntity<PurchaseOrder> getOrder(@PathVariable UUID id) {
        PurchaseOrder order = purchaseOrderRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("PurchaseOrder", "id", id));
        return ResponseEntity.ok(order);
    }

    @PostMapping
    @Operation(summary = "Create purchase order")
    @PreAuthorize("hasAuthority('PURCHASE_CREATE')")
    @Transactional
    public ResponseEntity<PurchaseOrder> createOrder(@Valid @RequestBody CreatePurchaseOrderRequest request) {
        Kitchen kitchen = kitchenRepository.findById(request.getKitchenId())
            .orElseThrow(() -> new ResourceNotFoundException("Kitchen", "id", request.getKitchenId()));
        Supplier supplier = supplierRepository.findById(request.getSupplierId())
            .orElseThrow(() -> new ResourceNotFoundException("Supplier", "id", request.getSupplierId()));

        int maxNum = purchaseOrderRepository.getMaxOrderNumber() != null
            ? purchaseOrderRepository.getMaxOrderNumber() : 0;
        String orderNumber = String.format("PO-%05d", maxNum + 1);

        PurchaseOrder order = PurchaseOrder.builder()
            .orderNumber(orderNumber)
            .kitchen(kitchen)
            .supplier(supplier)
            .orderDate(request.getOrderDate())
            .expectedDeliveryDate(request.getExpectedDeliveryDate())
            .status(PurchaseStatus.DRAFT)
            .paymentTerms(request.getPaymentTerms())
            .deliveryAddress(request.getDeliveryAddress())
            .remarks(request.getRemarks())
            .totalAmount(BigDecimal.ZERO)
            .build();
        order.setActive(true);

        if (request.getItems() != null && !request.getItems().isEmpty()) {
            BigDecimal total = BigDecimal.ZERO;
            for (OrderItemRequest itemReq : request.getItems()) {
                var ingredient = ingredientRepository.findById(itemReq.getIngredientId())
                    .orElseThrow(() -> new ResourceNotFoundException("Ingredient", "id", itemReq.getIngredientId()));
                var uom = uomRepository.findById(itemReq.getUnitOfMeasureId())
                    .orElseThrow(() -> new ResourceNotFoundException("UnitOfMeasure", "id", itemReq.getUnitOfMeasureId()));

                BigDecimal itemTotal = itemReq.getQuantityOrdered().multiply(itemReq.getUnitPrice());
                PurchaseOrderItem item = PurchaseOrderItem.builder()
                    .purchaseOrder(order)
                    .ingredient(ingredient)
                    .unitOfMeasure(uom)
                    .quantityOrdered(itemReq.getQuantityOrdered())
                    .unitPrice(itemReq.getUnitPrice())
                    .taxPercent(itemReq.getTaxPercent())
                    .discountPercent(itemReq.getDiscountPercent())
                    .totalPrice(itemTotal)
                    .build();
                item.setActive(true);
                order.getItems().add(item);
                total = total.add(itemTotal);
            }
            order.setTotalAmount(total);
        }

        return ResponseEntity.ok(purchaseOrderRepository.save(order));
    }

    @PatchMapping("/{id}/approve")
    @Operation(summary = "Approve a purchase order")
    @PreAuthorize("hasAuthority('PURCHASE_APPROVE')")
    @Transactional
    public ResponseEntity<PurchaseOrder> approveOrder(@PathVariable UUID id) {
        PurchaseOrder order = purchaseOrderRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("PurchaseOrder", "id", id));
        order.setStatus(PurchaseStatus.APPROVED);
        return ResponseEntity.ok(purchaseOrderRepository.save(order));
    }

    @PatchMapping("/{id}/cancel")
    @Operation(summary = "Cancel a purchase order")
    @PreAuthorize("hasAuthority('PURCHASE_UPDATE')")
    @Transactional
    public ResponseEntity<PurchaseOrder> cancelOrder(@PathVariable UUID id) {
        PurchaseOrder order = purchaseOrderRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("PurchaseOrder", "id", id));
        order.setStatus(PurchaseStatus.CANCELLED);
        return ResponseEntity.ok(purchaseOrderRepository.save(order));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete (soft) a purchase order")
    @PreAuthorize("hasAuthority('PURCHASE_DELETE')")
    @Transactional
    public ResponseEntity<Void> deleteOrder(@PathVariable UUID id) {
        PurchaseOrder order = purchaseOrderRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("PurchaseOrder", "id", id));
        order.setActive(false);
        purchaseOrderRepository.save(order);
        return ResponseEntity.noContent().build();
    }
}
