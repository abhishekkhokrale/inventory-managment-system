-- ============================================================
-- Seed Data: Roles, Permissions, Default Kitchen
-- ============================================================

-- Insert Permissions
INSERT INTO permissions (name, description, module) VALUES
-- User Management
('USER_READ',        'View users',              'USER_MANAGEMENT'),
('USER_CREATE',      'Create users',            'USER_MANAGEMENT'),
('USER_UPDATE',      'Update users',            'USER_MANAGEMENT'),
('USER_DELETE',      'Delete users',            'USER_MANAGEMENT'),
-- Role Management
('ROLE_READ',        'View roles',              'ROLE_MANAGEMENT'),
('ROLE_CREATE',      'Create roles',            'ROLE_MANAGEMENT'),
('ROLE_UPDATE',      'Update roles',            'ROLE_MANAGEMENT'),
('ROLE_DELETE',      'Delete roles',            'ROLE_MANAGEMENT'),
-- Ingredient
('INGREDIENT_READ',  'View ingredients',        'INGREDIENT'),
('INGREDIENT_CREATE','Create ingredients',      'INGREDIENT'),
('INGREDIENT_UPDATE','Update ingredients',      'INGREDIENT'),
('INGREDIENT_DELETE','Delete ingredients',      'INGREDIENT'),
-- Supplier
('SUPPLIER_READ',    'View suppliers',          'SUPPLIER'),
('SUPPLIER_CREATE',  'Create suppliers',        'SUPPLIER'),
('SUPPLIER_UPDATE',  'Update suppliers',        'SUPPLIER'),
('SUPPLIER_DELETE',  'Delete suppliers',        'SUPPLIER'),
-- Purchase
('PURCHASE_READ',    'View purchases',          'PURCHASE'),
('PURCHASE_CREATE',  'Create purchases',        'PURCHASE'),
('PURCHASE_UPDATE',  'Update purchases',        'PURCHASE'),
('PURCHASE_DELETE',  'Delete purchases',        'PURCHASE'),
('PURCHASE_APPROVE', 'Approve purchases',       'PURCHASE'),
-- Inventory
('INVENTORY_READ',   'View inventory',          'INVENTORY'),
('INVENTORY_CREATE', 'Add stock',               'INVENTORY'),
('INVENTORY_UPDATE', 'Update inventory',        'INVENTORY'),
('INVENTORY_DELETE', 'Delete inventory',        'INVENTORY'),
('INVENTORY_ADJUST', 'Adjust stock',            'INVENTORY'),
-- Recipe
('RECIPE_READ',      'View recipes',            'RECIPE'),
('RECIPE_CREATE',    'Create recipes',          'RECIPE'),
('RECIPE_UPDATE',    'Update recipes',          'RECIPE'),
('RECIPE_DELETE',    'Delete recipes',          'RECIPE'),
-- Reports
('REPORT_VIEW',      'View reports',            'REPORT'),
('REPORT_EXPORT',    'Export reports',          'REPORT'),
-- Dashboard
('DASHBOARD_VIEW',   'View dashboard',          'DASHBOARD'),
-- Kitchen
('KITCHEN_READ',     'View kitchens',           'KITCHEN'),
('KITCHEN_CREATE',   'Create kitchens',         'KITCHEN'),
('KITCHEN_UPDATE',   'Update kitchens',         'KITCHEN'),
('KITCHEN_DELETE',   'Delete kitchens',         'KITCHEN'),
-- Warehouse
('WAREHOUSE_READ',   'View warehouses',         'WAREHOUSE'),
('WAREHOUSE_CREATE', 'Create warehouses',       'WAREHOUSE'),
('WAREHOUSE_UPDATE', 'Update warehouses',       'WAREHOUSE'),
('WAREHOUSE_DELETE', 'Delete warehouses',       'WAREHOUSE');

-- Insert Roles
INSERT INTO roles (name, description) VALUES
('SUPER_ADMIN',      'Super Administrator with all permissions'),
('KITCHEN_MANAGER',  'Kitchen Manager with full kitchen access'),
('STORE_MANAGER',    'Store Manager with inventory access'),
('PURCHASE_MANAGER', 'Purchase Manager with purchase access'),
('CHEF',             'Chef with recipe and consumption access'),
('INVENTORY_STAFF',  'Inventory Staff with stock management access'),
('AUDITOR',          'Auditor with read-only access');

-- Assign all permissions to SUPER_ADMIN
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'SUPER_ADMIN';

-- KITCHEN_MANAGER permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'KITCHEN_MANAGER'
AND p.name IN (
    'USER_READ','INGREDIENT_READ','INGREDIENT_CREATE','INGREDIENT_UPDATE',
    'SUPPLIER_READ','PURCHASE_READ','PURCHASE_CREATE','PURCHASE_UPDATE','PURCHASE_APPROVE',
    'INVENTORY_READ','INVENTORY_CREATE','INVENTORY_UPDATE','INVENTORY_ADJUST',
    'RECIPE_READ','RECIPE_CREATE','RECIPE_UPDATE','REPORT_VIEW','REPORT_EXPORT',
    'DASHBOARD_VIEW','KITCHEN_READ','WAREHOUSE_READ','WAREHOUSE_CREATE','WAREHOUSE_UPDATE'
);

-- STORE_MANAGER permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'STORE_MANAGER'
AND p.name IN (
    'INGREDIENT_READ','SUPPLIER_READ',
    'INVENTORY_READ','INVENTORY_CREATE','INVENTORY_UPDATE','INVENTORY_ADJUST',
    'PURCHASE_READ','REPORT_VIEW','DASHBOARD_VIEW','WAREHOUSE_READ'
);

-- PURCHASE_MANAGER permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'PURCHASE_MANAGER'
AND p.name IN (
    'INGREDIENT_READ','SUPPLIER_READ','SUPPLIER_CREATE','SUPPLIER_UPDATE',
    'PURCHASE_READ','PURCHASE_CREATE','PURCHASE_UPDATE','PURCHASE_APPROVE',
    'INVENTORY_READ','REPORT_VIEW','DASHBOARD_VIEW'
);

-- CHEF permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'CHEF'
AND p.name IN (
    'INGREDIENT_READ','RECIPE_READ','RECIPE_CREATE','RECIPE_UPDATE',
    'INVENTORY_READ','DASHBOARD_VIEW'
);

-- INVENTORY_STAFF permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'INVENTORY_STAFF'
AND p.name IN (
    'INGREDIENT_READ','INVENTORY_READ','INVENTORY_CREATE','INVENTORY_UPDATE',
    'INVENTORY_ADJUST','DASHBOARD_VIEW','WAREHOUSE_READ'
);

-- AUDITOR permissions (read only)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'AUDITOR'
AND p.name IN (
    'USER_READ','INGREDIENT_READ','SUPPLIER_READ','PURCHASE_READ',
    'INVENTORY_READ','RECIPE_READ','REPORT_VIEW','REPORT_EXPORT','DASHBOARD_VIEW'
);

-- Default Kitchen
INSERT INTO kitchens (name, code, location, contact_email) VALUES
('Main Kitchen', 'MAIN-KIT', 'Ground Floor, Building A', 'kitchen@restaurant.com');

-- Default Warehouse
INSERT INTO warehouses (name, code, storage_type, kitchen_id)
SELECT 'Main Store', 'MAIN-STORE', 'DRY_STORAGE', id FROM kitchens WHERE code = 'MAIN-KIT';

INSERT INTO warehouses (name, code, storage_type, temperature_min, temperature_max, kitchen_id)
SELECT 'Cold Room', 'COLD-ROOM', 'REFRIGERATED', 2.0, 8.0, id FROM kitchens WHERE code = 'MAIN-KIT';

INSERT INTO warehouses (name, code, storage_type, temperature_min, temperature_max, kitchen_id)
SELECT 'Freezer', 'FREEZER-01', 'FROZEN', -25.0, -18.0, id FROM kitchens WHERE code = 'MAIN-KIT';

-- Default UOMs
INSERT INTO units_of_measure (name, abbreviation, type, base_conversion_factor, base_unit) VALUES
('Kilogram',    'kg',   'WEIGHT', 1.0,     'kg'),
('Gram',        'g',    'WEIGHT', 0.001,   'kg'),
('Pound',       'lb',   'WEIGHT', 0.453592,'kg'),
('Litre',       'L',    'VOLUME', 1.0,     'L'),
('Millilitre',  'ml',   'VOLUME', 0.001,   'L'),
('Piece',       'pcs',  'COUNT',  1.0,     'pcs'),
('Dozen',       'doz',  'COUNT',  12.0,    'pcs'),
('Box',         'box',  'COUNT',  1.0,     'box'),
('Bag',         'bag',  'COUNT',  1.0,     'bag'),
('Tray',        'tray', 'COUNT',  1.0,     'tray');

-- Default Admin User (password: Admin@123)
INSERT INTO users (username, email, password, first_name, last_name, is_verified)
VALUES ('admin', 'admin@kitchen.com',
        '$2a$12$YourHashedPasswordHere', -- Replace with BCrypt hash of 'Admin@123'
        'System', 'Administrator', TRUE);

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r
WHERE u.username = 'admin' AND r.name = 'SUPER_ADMIN';

-- Default Categories
INSERT INTO categories (name, code, description) VALUES
('Vegetables',   'VEG',  'Fresh and frozen vegetables'),
('Fruits',       'FRT',  'Fresh and dried fruits'),
('Meat',         'MEAT', 'Beef, chicken, pork, lamb'),
('Seafood',      'SEAF', 'Fish, prawns, shellfish'),
('Dairy',        'DAIR', 'Milk, cheese, butter, yogurt'),
('Grains',       'GRN',  'Rice, wheat, flour, oats'),
('Spices',       'SPC',  'Dry spices and seasonings'),
('Oils & Fats',  'OIL',  'Cooking oils and fats'),
('Beverages',    'BEV',  'Drinks and beverage ingredients'),
('Bakery',       'BAK',  'Baking ingredients'),
('Condiments',   'COND', 'Sauces, vinegars, condiments'),
('Frozen Foods', 'FROZ', 'Pre-frozen items');
