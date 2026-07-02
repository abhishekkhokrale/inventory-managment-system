-- ============================================================
-- Kitchen Inventory Management System - Database Schema
-- Phase 2: Complete Database Design
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================
-- KITCHENS (Multi-kitchen support)
-- ============================================================
CREATE TABLE kitchens (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(100) NOT NULL,
    code            VARCHAR(20)  NOT NULL UNIQUE,
    location        VARCHAR(200),
    contact_email   VARCHAR(100),
    contact_phone   VARCHAR(20),
    description     TEXT,
    is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
    version         BIGINT       DEFAULT 0,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP,
    created_by      VARCHAR(100),
    updated_by      VARCHAR(100)
);

-- ============================================================
-- WAREHOUSES (Multi-warehouse per kitchen)
-- ============================================================
CREATE TABLE warehouses (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name             VARCHAR(100)  NOT NULL,
    code             VARCHAR(20)   NOT NULL UNIQUE,
    storage_type     VARCHAR(30)   NOT NULL CHECK (storage_type IN ('DRY_STORAGE','REFRIGERATED','FROZEN','COOL_ROOM','AMBIENT')),
    location         VARCHAR(200),
    capacity         NUMERIC(12,3),
    capacity_unit    VARCHAR(20),
    temperature_min  NUMERIC(6,2),
    temperature_max  NUMERIC(6,2),
    kitchen_id       UUID          NOT NULL REFERENCES kitchens(id),
    is_active        BOOLEAN       NOT NULL DEFAULT TRUE,
    version          BIGINT        DEFAULT 0,
    created_at       TIMESTAMP     NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP,
    created_by       VARCHAR(100),
    updated_by       VARCHAR(100)
);

-- ============================================================
-- PERMISSIONS
-- ============================================================
CREATE TABLE permissions (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(200),
    module      VARCHAR(50),
    is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
    version     BIGINT       DEFAULT 0,
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP,
    created_by  VARCHAR(100),
    updated_by  VARCHAR(100)
);

-- ============================================================
-- ROLES
-- ============================================================
CREATE TABLE roles (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        VARCHAR(50)  NOT NULL UNIQUE,
    description VARCHAR(200),
    is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
    version     BIGINT       DEFAULT 0,
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP,
    created_by  VARCHAR(100),
    updated_by  VARCHAR(100)
);

CREATE TABLE role_permissions (
    role_id       UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE users (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username                VARCHAR(50)  NOT NULL UNIQUE,
    email                   VARCHAR(100) NOT NULL UNIQUE,
    password                VARCHAR(255) NOT NULL,
    first_name              VARCHAR(50)  NOT NULL,
    last_name               VARCHAR(50)  NOT NULL,
    phone                   VARCHAR(20),
    avatar_url              TEXT,
    is_verified             BOOLEAN      NOT NULL DEFAULT FALSE,
    is_locked               BOOLEAN      NOT NULL DEFAULT FALSE,
    failed_login_attempts   INT          NOT NULL DEFAULT 0,
    last_login              TIMESTAMP,
    password_reset_token    VARCHAR(255),
    password_reset_expiry   TIMESTAMP,
    refresh_token           TEXT,
    refresh_token_expiry    TIMESTAMP,
    kitchen_id              UUID         REFERENCES kitchens(id),
    is_active               BOOLEAN      NOT NULL DEFAULT TRUE,
    version                 BIGINT       DEFAULT 0,
    created_at              TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMP,
    created_by              VARCHAR(100),
    updated_by              VARCHAR(100)
);

CREATE TABLE user_roles (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

CREATE INDEX idx_users_email    ON users(email);
CREATE INDEX idx_users_username ON users(username);

-- ============================================================
-- CATEGORIES (Hierarchical)
-- ============================================================
CREATE TABLE categories (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        VARCHAR(100) NOT NULL,
    code        VARCHAR(20)  NOT NULL UNIQUE,
    description TEXT,
    parent_id   UUID         REFERENCES categories(id),
    is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
    version     BIGINT       DEFAULT 0,
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP,
    created_by  VARCHAR(100),
    updated_by  VARCHAR(100)
);

-- ============================================================
-- UNITS OF MEASURE
-- ============================================================
CREATE TABLE units_of_measure (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name                    VARCHAR(50)  NOT NULL,
    abbreviation            VARCHAR(10)  NOT NULL,
    type                    VARCHAR(20),
    base_conversion_factor  NUMERIC(15,8),
    base_unit               VARCHAR(10),
    is_active               BOOLEAN      NOT NULL DEFAULT TRUE,
    version                 BIGINT       DEFAULT 0,
    created_at              TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMP,
    created_by              VARCHAR(100),
    updated_by              VARCHAR(100)
);

-- ============================================================
-- INGREDIENTS (Master)
-- ============================================================
CREATE TABLE ingredients (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(150) NOT NULL,
    code            VARCHAR(30)  NOT NULL UNIQUE,
    description     TEXT,
    category_id     UUID         NOT NULL REFERENCES categories(id),
    uom_id          UUID         NOT NULL REFERENCES units_of_measure(id),
    shelf_life_days INT,
    reorder_level   NUMERIC(12,3),
    minimum_stock   NUMERIC(12,3),
    maximum_stock   NUMERIC(12,3),
    storage_type    VARCHAR(30)  NOT NULL,
    standard_cost   NUMERIC(14,4),
    barcode         VARCHAR(50),
    qr_code         TEXT,
    image_url       TEXT,
    allergens       VARCHAR(200),
    is_perishable   BOOLEAN      NOT NULL DEFAULT TRUE,
    track_batch     BOOLEAN      NOT NULL DEFAULT TRUE,
    track_expiry    BOOLEAN      NOT NULL DEFAULT TRUE,
    is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
    version         BIGINT       DEFAULT 0,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP,
    created_by      VARCHAR(100),
    updated_by      VARCHAR(100)
);

CREATE INDEX idx_ingredients_code     ON ingredients(code);
CREATE INDEX idx_ingredients_category ON ingredients(category_id);
CREATE INDEX idx_ingredients_barcode  ON ingredients(barcode);

-- ============================================================
-- SUPPLIERS
-- ============================================================
CREATE TABLE suppliers (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(150) NOT NULL,
    code            VARCHAR(20)  NOT NULL UNIQUE,
    contact_person  VARCHAR(100),
    email           VARCHAR(100),
    phone           VARCHAR(20),
    address         TEXT,
    city            VARCHAR(100),
    country         VARCHAR(100),
    tax_number      VARCHAR(50),
    payment_terms   VARCHAR(50),
    lead_time_days  INT,
    rating          NUMERIC(3,2),
    website         VARCHAR(200),
    notes           TEXT,
    is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
    version         BIGINT       DEFAULT 0,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP,
    created_by      VARCHAR(100),
    updated_by      VARCHAR(100)
);

CREATE TABLE supplier_contacts (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID         NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    name        VARCHAR(100) NOT NULL,
    designation VARCHAR(100),
    email       VARCHAR(100),
    phone       VARCHAR(20),
    is_primary  BOOLEAN      NOT NULL DEFAULT FALSE,
    is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
    version     BIGINT       DEFAULT 0,
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP,
    created_by  VARCHAR(100),
    updated_by  VARCHAR(100)
);

-- ============================================================
-- PURCHASE REQUISITIONS
-- ============================================================
CREATE TABLE purchase_requisitions (
    id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requisition_number   VARCHAR(30)  NOT NULL UNIQUE,
    kitchen_id           UUID         NOT NULL REFERENCES kitchens(id),
    requested_by         UUID         NOT NULL REFERENCES users(id),
    required_date        DATE         NOT NULL,
    status               VARCHAR(30)  NOT NULL DEFAULT 'DRAFT',
    remarks              TEXT,
    approved_by          UUID         REFERENCES users(id),
    approved_at          TIMESTAMP,
    is_active            BOOLEAN      NOT NULL DEFAULT TRUE,
    version              BIGINT       DEFAULT 0,
    created_at           TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMP,
    created_by           VARCHAR(100),
    updated_by           VARCHAR(100)
);

CREATE TABLE purchase_requisition_items (
    id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requisition_id       UUID          NOT NULL REFERENCES purchase_requisitions(id) ON DELETE CASCADE,
    ingredient_id        UUID          NOT NULL REFERENCES ingredients(id),
    quantity_requested   NUMERIC(12,3) NOT NULL,
    uom_id               UUID          NOT NULL REFERENCES units_of_measure(id),
    estimated_unit_cost  NUMERIC(12,4),
    remarks              TEXT,
    is_active            BOOLEAN       NOT NULL DEFAULT TRUE,
    version              BIGINT        DEFAULT 0,
    created_at           TIMESTAMP     NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMP,
    created_by           VARCHAR(100),
    updated_by           VARCHAR(100)
);

-- ============================================================
-- PURCHASE ORDERS
-- ============================================================
CREATE TABLE purchase_orders (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number            VARCHAR(30)   NOT NULL UNIQUE,
    kitchen_id              UUID          NOT NULL REFERENCES kitchens(id),
    supplier_id             UUID          NOT NULL REFERENCES suppliers(id),
    requisition_id          UUID          REFERENCES purchase_requisitions(id),
    order_date              DATE          NOT NULL,
    expected_delivery_date  DATE,
    status                  VARCHAR(30)   NOT NULL DEFAULT 'DRAFT',
    total_amount            NUMERIC(14,2),
    tax_amount              NUMERIC(14,2),
    discount_amount         NUMERIC(14,2),
    payment_terms           VARCHAR(50),
    delivery_address        TEXT,
    remarks                 TEXT,
    approved_by             UUID          REFERENCES users(id),
    approved_at             TIMESTAMP,
    is_active               BOOLEAN       NOT NULL DEFAULT TRUE,
    version                 BIGINT        DEFAULT 0,
    created_at              TIMESTAMP     NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMP,
    created_by              VARCHAR(100),
    updated_by              VARCHAR(100)
);

CREATE TABLE purchase_order_items (
    id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    purchase_order_id  UUID          NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    ingredient_id      UUID          NOT NULL REFERENCES ingredients(id),
    quantity_ordered   NUMERIC(12,3) NOT NULL,
    quantity_received  NUMERIC(12,3) NOT NULL DEFAULT 0,
    uom_id             UUID          NOT NULL REFERENCES units_of_measure(id),
    unit_price         NUMERIC(12,4) NOT NULL,
    tax_percent        NUMERIC(5,2),
    discount_percent   NUMERIC(5,2),
    total_price        NUMERIC(14,2),
    is_active          BOOLEAN       NOT NULL DEFAULT TRUE,
    version            BIGINT        DEFAULT 0,
    created_at         TIMESTAMP     NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMP,
    created_by         VARCHAR(100),
    updated_by         VARCHAR(100)
);

CREATE INDEX idx_po_number   ON purchase_orders(order_number);
CREATE INDEX idx_po_status   ON purchase_orders(status);
CREATE INDEX idx_po_supplier ON purchase_orders(supplier_id);

-- ============================================================
-- GOODS RECEIPT NOTES (GRN)
-- ============================================================
CREATE TABLE goods_receipt_notes (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grn_number              VARCHAR(30)   NOT NULL UNIQUE,
    purchase_order_id       UUID          NOT NULL REFERENCES purchase_orders(id),
    warehouse_id            UUID          NOT NULL REFERENCES warehouses(id),
    receipt_date            DATE          NOT NULL,
    received_by             UUID          NOT NULL REFERENCES users(id),
    supplier_invoice_number VARCHAR(50),
    total_amount            NUMERIC(14,2),
    remarks                 TEXT,
    is_active               BOOLEAN       NOT NULL DEFAULT TRUE,
    version                 BIGINT        DEFAULT 0,
    created_at              TIMESTAMP     NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMP,
    created_by              VARCHAR(100),
    updated_by              VARCHAR(100)
);

CREATE TABLE grn_items (
    id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grn_id             UUID          NOT NULL REFERENCES goods_receipt_notes(id) ON DELETE CASCADE,
    ingredient_id      UUID          NOT NULL REFERENCES ingredients(id),
    quantity_received  NUMERIC(12,3) NOT NULL,
    quantity_accepted  NUMERIC(12,3) NOT NULL,
    quantity_rejected  NUMERIC(12,3) NOT NULL DEFAULT 0,
    uom_id             UUID          NOT NULL REFERENCES units_of_measure(id),
    unit_price         NUMERIC(12,4),
    batch_number       VARCHAR(50),
    manufacture_date   DATE,
    expiry_date        DATE,
    rejection_reason   TEXT,
    is_active          BOOLEAN       NOT NULL DEFAULT TRUE,
    version            BIGINT        DEFAULT 0,
    created_at         TIMESTAMP     NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMP,
    created_by         VARCHAR(100),
    updated_by         VARCHAR(100)
);

-- ============================================================
-- STOCK ITEMS (Current Stock)
-- ============================================================
CREATE TABLE stock_items (
    id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ingredient_id         UUID          NOT NULL REFERENCES ingredients(id),
    warehouse_id          UUID          NOT NULL REFERENCES warehouses(id),
    batch_number          VARCHAR(50),
    quantity_on_hand      NUMERIC(12,3) NOT NULL DEFAULT 0,
    quantity_reserved     NUMERIC(12,3) NOT NULL DEFAULT 0,
    unit_cost             NUMERIC(12,4),
    manufacture_date      DATE,
    expiry_date           DATE,
    received_date         DATE,
    location_in_warehouse VARCHAR(50),
    is_active             BOOLEAN       NOT NULL DEFAULT TRUE,
    version               BIGINT        DEFAULT 0,
    created_at            TIMESTAMP     NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMP,
    created_by            VARCHAR(100),
    updated_by            VARCHAR(100)
);

CREATE INDEX idx_stock_ingredient_warehouse ON stock_items(ingredient_id, warehouse_id);
CREATE INDEX idx_stock_batch                ON stock_items(batch_number);
CREATE INDEX idx_stock_expiry               ON stock_items(expiry_date);

-- ============================================================
-- STOCK TRANSACTIONS (Full Audit Trail)
-- ============================================================
CREATE TABLE stock_transactions (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_number VARCHAR(30)   NOT NULL UNIQUE,
    transaction_type  VARCHAR(30)   NOT NULL,
    ingredient_id     UUID          NOT NULL REFERENCES ingredients(id),
    from_warehouse_id UUID          REFERENCES warehouses(id),
    to_warehouse_id   UUID          REFERENCES warehouses(id),
    quantity          NUMERIC(12,3) NOT NULL,
    uom_id            UUID          NOT NULL REFERENCES units_of_measure(id),
    unit_cost         NUMERIC(12,4),
    batch_number      VARCHAR(50),
    expiry_date       DATE,
    transaction_date  TIMESTAMP     NOT NULL DEFAULT NOW(),
    reference_number  VARCHAR(50),
    reference_type    VARCHAR(30),
    remarks           TEXT,
    performed_by      UUID          NOT NULL REFERENCES users(id),
    is_active         BOOLEAN       NOT NULL DEFAULT TRUE,
    version           BIGINT        DEFAULT 0,
    created_at        TIMESTAMP     NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMP,
    created_by        VARCHAR(100),
    updated_by        VARCHAR(100)
);

CREATE INDEX idx_txn_ingredient  ON stock_transactions(ingredient_id);
CREATE INDEX idx_txn_type        ON stock_transactions(transaction_type);
CREATE INDEX idx_txn_date        ON stock_transactions(transaction_date);
CREATE INDEX idx_txn_reference   ON stock_transactions(reference_number);

-- ============================================================
-- RECIPES
-- ============================================================
CREATE TABLE recipes (
    id                       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name                     VARCHAR(150) NOT NULL,
    code                     VARCHAR(30)  NOT NULL UNIQUE,
    description              TEXT,
    kitchen_id               UUID         NOT NULL REFERENCES kitchens(id),
    yield_quantity           NUMERIC(10,3) NOT NULL,
    yield_unit               VARCHAR(20),
    serving_size             NUMERIC(10,3),
    preparation_time_minutes INT,
    cooking_time_minutes     INT,
    instructions             TEXT,
    total_cost               NUMERIC(12,4),
    cost_per_serving         NUMERIC(12,4),
    is_published             BOOLEAN      NOT NULL DEFAULT FALSE,
    is_active                BOOLEAN      NOT NULL DEFAULT TRUE,
    version                  BIGINT       DEFAULT 0,
    created_at               TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at               TIMESTAMP,
    created_by               VARCHAR(100),
    updated_by               VARCHAR(100)
);

CREATE TABLE recipe_ingredients (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipe_id        UUID          NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    ingredient_id    UUID          NOT NULL REFERENCES ingredients(id),
    quantity         NUMERIC(10,3) NOT NULL,
    uom_id           UUID          NOT NULL REFERENCES units_of_measure(id),
    waste_percentage NUMERIC(5,2)  NOT NULL DEFAULT 0,
    is_optional      BOOLEAN       NOT NULL DEFAULT FALSE,
    notes            VARCHAR(200),
    is_active        BOOLEAN       NOT NULL DEFAULT TRUE,
    version          BIGINT        DEFAULT 0,
    created_at       TIMESTAMP     NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP,
    created_by       VARCHAR(100),
    updated_by       VARCHAR(100)
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE notifications (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id           UUID         REFERENCES users(id),
    notification_type VARCHAR(50)  NOT NULL,
    title             VARCHAR(200) NOT NULL,
    message           TEXT         NOT NULL,
    reference_id      VARCHAR(50),
    reference_type    VARCHAR(50),
    is_read           BOOLEAN      NOT NULL DEFAULT FALSE,
    read_at           TIMESTAMP,
    is_email_sent     BOOLEAN      NOT NULL DEFAULT FALSE,
    is_active         BOOLEAN      NOT NULL DEFAULT TRUE,
    version           BIGINT       DEFAULT 0,
    created_at        TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMP,
    created_by        VARCHAR(100),
    updated_by        VARCHAR(100)
);

CREATE INDEX idx_notif_user ON notifications(user_id);
CREATE INDEX idx_notif_type ON notifications(notification_type);
CREATE INDEX idx_notif_read ON notifications(is_read);

-- ============================================================
-- AUDIT LOGS
-- ============================================================
CREATE TABLE audit_logs (
    id          BIGSERIAL    PRIMARY KEY,
    entity_type VARCHAR(50)  NOT NULL,
    entity_id   VARCHAR(50),
    action      VARCHAR(20)  NOT NULL,
    old_values  JSONB,
    new_values  JSONB,
    user_id     VARCHAR(50)  NOT NULL,
    username    VARCHAR(100) NOT NULL,
    ip_address  VARCHAR(50),
    user_agent  TEXT,
    action_date TIMESTAMP    NOT NULL DEFAULT NOW(),
    remarks     TEXT
);

CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_user   ON audit_logs(user_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_date   ON audit_logs(action_date);
