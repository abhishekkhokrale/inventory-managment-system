# Kitchen Inventory Management System

A production-ready, full-stack Inventory Management System built for the **Food Industry Kitchen**. Designed with enterprise-grade architecture covering multi-kitchen support, real-time stock tracking, FEFO/FIFO inventory management, purchase workflows, recipe cost calculation, and rich analytics dashboards.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Modules](#modules)
- [Database Design](#database-design)
- [Backend Structure](#backend-structure)
- [Frontend Structure](#frontend-structure)
- [API Reference](#api-reference)
- [Authentication & RBAC](#authentication--rbac)
- [Getting Started](#getting-started)
- [Docker Deployment](#docker-deployment)
- [CI/CD Pipeline](#cicd-pipeline)
- [Environment Variables](#environment-variables)
- [Screenshots](#screenshots)

---

## Overview

| Feature | Details |
|---|---|
| Multi-Kitchen Support | Manage multiple kitchen locations from one system |
| Multi-Warehouse Support | Dry storage, refrigerated, frozen, cool room |
| FEFO/FIFO | First-Expired-First-Out stock deduction strategy |
| Batch & Expiry Tracking | Full batch number and expiry date lifecycle |
| Approval Workflow | Purchase requisitions with configurable approval chains |
| Audit Logs | Complete activity tracking on all entities |
| Barcode / QR Code | Ingredient scanning and generation support |
| Role-Based Access | 7 roles with 35+ granular permissions |
| Dark Mode | Full light/dark theme toggle |
| Export | Excel (XLSX) and PDF report exports |

---

## Tech Stack

### Backend

| Technology | Version | Purpose |
|---|---|---|
| Java | 21 (LTS) | Core language |
| Spring Boot | 3.5+ | Application framework |
| Spring Security | 6.x | JWT authentication |
| Spring Data JPA | 3.x | ORM layer |
| Hibernate | 6.x | JPA implementation |
| PostgreSQL | 16 | Primary database |
| Flyway | 10.x | Database migrations |
| MapStruct | 1.6 | DTO mapping |
| Lombok | 1.18 | Boilerplate reduction |
| SpringDoc OpenAPI | 2.6 | Swagger documentation |
| Apache POI | 5.3 | Excel export |
| iText PDF | 5.5 | PDF generation |
| ZXing | 3.5 | Barcode/QR code |

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| React | 19 | UI framework |
| TypeScript | 5.5 | Type safety |
| Vite | 5.4 | Build tool |
| Material UI (MUI) | 6.x | Component library |
| MUI X DataGrid | 7.x | Advanced data tables |
| TanStack Query | 5.x | Server state management |
| Zustand | 4.x | Client state management |
| React Router | v7 | Client-side routing |
| Axios | 1.7 | HTTP client |
| Recharts | 2.x | Charts and analytics |
| React Hook Form | 7.x | Form management |
| Zod | 3.x | Schema validation |
| XLSX | 0.18 | Excel export |
| jsPDF | 2.5 | PDF export |
| Day.js | 1.11 | Date utilities |

### DevOps

| Technology | Purpose |
|---|---|
| Docker | Containerization |
| Docker Compose | Multi-container orchestration |
| Nginx | Frontend serving and reverse proxy |
| GitHub Actions | CI/CD pipeline |

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
│  React 19 + TypeScript + MUI + React Query + Zustand + Recharts│
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTPS / REST API
┌───────────────────────────▼─────────────────────────────────────┐
│                     API GATEWAY (Nginx)                         │
│              Reverse proxy + Static file serving                │
└───────────────────────────┬─────────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                   SPRING BOOT APPLICATION                       │
│                                                                 │
│  ┌────────────┐  ┌────────────┐  ┌──────────┐  ┌────────────┐ │
│  │ Controller │→ │  Service   │→ │Repository│→ │  Entity    │ │
│  │   Layer    │  │   Layer    │  │  Layer   │  │   Layer    │ │
│  └────────────┘  └────────────┘  └──────────┘  └────────────┘ │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
│  │ Security │  │  Audit   │  │Notification│  │   Report     │  │
│  │  (JWT)   │  │   Log    │  │  Service  │  │   Engine     │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────┘  │
└───────────────────────────┬─────────────────────────────────────┘
                            │ JPA / JDBC
┌───────────────────────────▼─────────────────────────────────────┐
│                      PostgreSQL 16                              │
│         16 Tables + Indexes + JSONB Audit + Flyway Migrations   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Modules

### 1. Authentication & Authorization
- JWT login with access token (15 min) + refresh token (7 days) rotation
- Forgot password / Reset password via email token
- Change password with current password verification
- Role-based access control enforced at method level (`@PreAuthorize`)

### 2. Ingredient Master
- Full CRUD with category hierarchy and unit of measure
- Shelf life, reorder level, minimum/maximum stock configuration
- Storage type classification (Dry, Refrigerated, Frozen, Cool Room, Ambient)
- Barcode and QR code association
- Allergen information tracking
- Perishable, batch tracking, expiry tracking flags

### 3. Supplier Management
- Supplier CRUD with multiple contact persons
- Lead time, payment terms, and rating management
- Supplier agreement documentation

### 4. Purchase Management
- **Purchase Requisition** → **Purchase Order** → **GRN** workflow
- Approval workflow with status tracking (Draft → Pending → Approved → Ordered → Received)
- Goods Receipt Note with batch number and expiry date capture
- Quantity received vs ordered reconciliation
- Rejected goods tracking with reason

### 5. Inventory Management
- Stock In / Stock Out / Transfer operations
- Stock Adjustment (Waste, Damaged, Expired, General)
- **FEFO** (First Expired First Out) automatic deduction
- Real-time stock level calculation
- Batch-level stock tracking
- Expiry monitoring with configurable alert thresholds

### 6. Kitchen Consumption
- Daily consumption recording
- Recipe-based batch consumption
- Auto deduction linked to recipe preparation

### 7. Recipe Management
- Recipe CRUD with ingredient mapping
- Waste percentage per ingredient
- **Automatic cost calculation** based on current stock prices
- Yield quantity and cost-per-serving computation
- Draft / Published status

### 8. Inventory Tracking
- Real-time stock view per warehouse
- Batch number full traceability
- Expiry date timeline view
- FIFO / FEFO strategy support

### 9. Alerts & Notifications
- Low stock alert (below reorder level)
- Expiry alert (configurable days threshold, default 7 days)
- Reorder alert
- Overstock alert
- Purchase approval notifications
- In-app notifications + email dispatch

### 10. Reports & Analytics
- **Stock Report** — opening/closing/movement per ingredient
- **Consumption Report** — daily consumption charts
- **Purchase Report** — PO history and spend analysis
- **Waste Report** — waste trend over time
- **Cost Analysis** — ingredient cost breakdown
- **Inventory Valuation** — total stock value at average cost
- Export to **Excel** and **PDF**

### 11. Dashboard
- 8 KPI cards (total ingredients, stock value, low stock, expiring, pending POs, consumption, waste, suppliers)
- Inventory trends area chart (30 days)
- Top 10 consumed ingredients bar chart
- Waste analysis pie chart
- Live low stock alerts panel

---

## Database Design

### Entity Relationship Overview

```
kitchens ──< warehouses
kitchens ──< purchase_requisitions
kitchens ──< purchase_orders
kitchens ──< recipes

users >──< roles >──< permissions
users ──< stock_transactions

ingredients >── categories
ingredients >── units_of_measure
ingredients ──< stock_items (per warehouse, per batch)
ingredients ──< stock_transactions
ingredients ──< recipe_ingredients

suppliers ──< supplier_contacts
suppliers ──< purchase_orders

purchase_requisitions ──< purchase_requisition_items
purchase_orders ──< purchase_order_items
purchase_orders ──< goods_receipt_notes ──< grn_items

warehouses ──< stock_items

recipes ──< recipe_ingredients
```

### Tables

| Table | Description |
|---|---|
| `kitchens` | Kitchen locations |
| `warehouses` | Storage locations per kitchen |
| `users` | System users with auth fields |
| `roles` | RBAC roles |
| `permissions` | Granular permissions |
| `user_roles` | Many-to-many junction |
| `role_permissions` | Many-to-many junction |
| `categories` | Hierarchical ingredient categories |
| `units_of_measure` | Weight, volume, count units with conversion |
| `ingredients` | Ingredient master data |
| `suppliers` | Supplier master data |
| `supplier_contacts` | Supplier contact persons |
| `purchase_requisitions` | Internal purchase requests |
| `purchase_requisition_items` | Line items per requisition |
| `purchase_orders` | Orders placed with suppliers |
| `purchase_order_items` | Line items per PO |
| `goods_receipt_notes` | Delivery receipts against POs |
| `grn_items` | Line items per GRN with batch/expiry |
| `stock_items` | Current stock per ingredient/warehouse/batch |
| `stock_transactions` | Full immutable transaction audit trail |
| `recipes` | Recipe master with yield and cost |
| `recipe_ingredients` | Ingredient composition per recipe |
| `notifications` | In-app and email notification queue |
| `audit_logs` | Entity-level change history with JSONB diffs |

---

## Backend Structure

```
inventory-backend/
└── src/main/java/com/kitchen/inventory/
    ├── InventoryApplication.java
    ├── controller/
    │   ├── AuthController.java
    │   ├── IngredientController.java
    │   ├── InventoryController.java
    │   ├── SupplierController.java
    │   └── DashboardController.java
    ├── service/
    │   ├── AuthService.java
    │   ├── IngredientService.java
    │   ├── InventoryService.java
    │   ├── SupplierService.java
    │   ├── DashboardService.java
    │   └── impl/
    │       ├── AuthServiceImpl.java
    │       ├── IngredientServiceImpl.java
    │       ├── InventoryServiceImpl.java       ← FEFO logic
    │       ├── SupplierServiceImpl.java
    │       └── DashboardServiceImpl.java
    ├── repository/
    │   ├── UserRepository.java
    │   ├── IngredientRepository.java
    │   ├── StockItemRepository.java            ← FEFO queries
    │   ├── StockTransactionRepository.java
    │   ├── SupplierRepository.java
    │   ├── PurchaseOrderRepository.java
    │   ├── RecipeRepository.java
    │   ├── RoleRepository.java
    │   ├── CategoryRepository.java
    │   ├── UnitOfMeasureRepository.java
    │   └── WarehouseRepository.java
    ├── entity/
    │   ├── BaseEntity.java                     ← UUID PK, auditing, soft delete
    │   ├── User.java
    │   ├── Role.java
    │   ├── Permission.java
    │   ├── Kitchen.java
    │   ├── Warehouse.java
    │   ├── Category.java
    │   ├── UnitOfMeasure.java
    │   ├── Ingredient.java
    │   ├── Supplier.java
    │   ├── SupplierContact.java
    │   ├── PurchaseRequisition.java
    │   ├── PurchaseRequisitionItem.java
    │   ├── PurchaseOrder.java
    │   ├── PurchaseOrderItem.java
    │   ├── GoodsReceiptNote.java
    │   ├── GoodsReceiptNoteItem.java
    │   ├── StockItem.java
    │   ├── StockTransaction.java
    │   ├── Recipe.java
    │   ├── RecipeIngredient.java
    │   ├── Notification.java
    │   └── AuditLog.java
    ├── dto/
    │   ├── request/
    │   │   ├── LoginRequest.java
    │   │   ├── RegisterUserRequest.java
    │   │   ├── IngredientRequest.java
    │   │   └── StockAdjustmentRequest.java
    │   └── response/
    │       ├── AuthResponse.java
    │       └── PagedResponse.java
    ├── enums/
    │   ├── RoleName.java
    │   ├── PermissionName.java
    │   ├── StorageType.java
    │   ├── StockTransactionType.java
    │   ├── PurchaseStatus.java
    │   └── NotificationType.java
    ├── security/
    │   ├── JwtTokenProvider.java
    │   ├── JwtAuthenticationFilter.java
    │   ├── JwtAuthenticationEntryPoint.java
    │   ├── UserDetailsServiceImpl.java
    │   └── UserPrincipal.java
    ├── config/
    │   ├── SecurityConfig.java
    │   └── OpenApiConfig.java
    ├── exception/
    │   ├── GlobalExceptionHandler.java
    │   ├── ResourceNotFoundException.java
    │   ├── BusinessException.java
    │   ├── DuplicateResourceException.java
    │   ├── ErrorResponse.java
    │   └── ValidationErrorResponse.java
    └── audit/
        └── AuditorAwareImpl.java
```

---

## Frontend Structure

```
inventory-frontend/
└── src/
    ├── main.tsx                          ← App entry + QueryClient + SnackbarProvider
    ├── App.tsx                           ← MUI ThemeProvider + Router
    ├── index.css
    ├── api/
    │   ├── axiosInstance.ts              ← Interceptors + auto token refresh
    │   ├── auth.api.ts
    │   ├── ingredients.api.ts
    │   ├── inventory.api.ts
    │   └── dashboard.api.ts
    ├── store/
    │   ├── authStore.ts                  ← Zustand: JWT + user + permissions
    │   └── themeStore.ts                 ← Zustand: dark/light mode
    ├── types/
    │   └── index.ts                      ← All TypeScript interfaces & enums
    ├── routes/
    │   ├── AppRouter.tsx                 ← Lazy-loaded route definitions
    │   └── ProtectedRoute.tsx            ← Auth guard
    ├── layouts/
    │   ├── MainLayout.tsx                ← Sidebar + TopBar shell
    │   └── AuthLayout.tsx                ← Centered card layout
    ├── components/
    │   └── layout/
    │       ├── Sidebar.tsx               ← Collapsible nav with permission filtering
    │       └── TopBar.tsx                ← AppBar with theme toggle + notifications
    ├── features/
    │   ├── auth/
    │   │   └── pages/
    │   │       ├── LoginPage.tsx
    │   │       └── ForgotPasswordPage.tsx
    │   ├── dashboard/
    │   │   ├── pages/DashboardPage.tsx
    │   │   └── components/
    │   │       ├── KPICard.tsx
    │   │       ├── InventoryTrendChart.tsx
    │   │       ├── TopConsumedChart.tsx
    │   │       ├── WasteAnalysisChart.tsx
    │   │       └── LowStockAlerts.tsx
    │   ├── inventory/
    │   │   └── pages/
    │   │       ├── IngredientsPage.tsx
    │   │       ├── IngredientFormPage.tsx
    │   │       ├── StockLevelsPage.tsx
    │   │       └── StockTransactionsPage.tsx
    │   ├── supplier/
    │   │   └── pages/
    │   │       ├── SuppliersPage.tsx
    │   │       └── SupplierFormPage.tsx
    │   ├── purchase/
    │   │   └── pages/
    │   │       ├── PurchaseOrdersPage.tsx
    │   │       └── PurchaseOrderFormPage.tsx
    │   ├── recipe/
    │   │   └── pages/
    │   │       ├── RecipesPage.tsx
    │   │       └── RecipeFormPage.tsx
    │   └── reports/
    │       └── pages/ReportsPage.tsx     ← 6 report tabs + Excel/PDF export
    └── pages/
        ├── UsersPage.tsx
        ├── ProfilePage.tsx
        └── NotFoundPage.tsx
```

---

## API Reference

### Authentication

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/auth/login` | Obtain JWT tokens | Public |
| `POST` | `/api/auth/register` | Register new user | Public |
| `POST` | `/api/auth/refresh-token` | Rotate tokens | Public |
| `POST` | `/api/auth/logout` | Invalidate refresh token | Bearer |
| `POST` | `/api/auth/forgot-password` | Send reset email | Public |
| `POST` | `/api/auth/reset-password` | Reset via token | Public |
| `POST` | `/api/auth/change-password` | Change own password | Bearer |

### Ingredients

| Method | Endpoint | Description | Permission |
|---|---|---|---|
| `GET` | `/api/ingredients` | List (search, filter, paginate) | `INGREDIENT_READ` |
| `GET` | `/api/ingredients/{id}` | Get by ID | `INGREDIENT_READ` |
| `POST` | `/api/ingredients` | Create | `INGREDIENT_CREATE` |
| `PUT` | `/api/ingredients/{id}` | Update | `INGREDIENT_UPDATE` |
| `DELETE` | `/api/ingredients/{id}` | Soft delete | `INGREDIENT_DELETE` |
| `GET` | `/api/ingredients/low-stock` | Below reorder level | `INGREDIENT_READ` |

### Inventory

| Method | Endpoint | Description | Permission |
|---|---|---|---|
| `GET` | `/api/inventory/stock` | Current stock levels | `INVENTORY_READ` |
| `POST` | `/api/inventory/stock-in` | Receive stock | `INVENTORY_CREATE` |
| `POST` | `/api/inventory/stock-out` | Issue stock (FEFO) | `INVENTORY_UPDATE` |
| `POST` | `/api/inventory/adjustment` | Waste/damage/expiry | `INVENTORY_ADJUST` |
| `GET` | `/api/inventory/expiring` | Expiring soon | `INVENTORY_READ` |
| `GET` | `/api/inventory/transactions` | Transaction history | `INVENTORY_READ` |

### Suppliers

| Method | Endpoint | Description | Permission |
|---|---|---|---|
| `GET` | `/api/suppliers` | List suppliers | `SUPPLIER_READ` |
| `GET` | `/api/suppliers/{id}` | Get supplier | `SUPPLIER_READ` |
| `POST` | `/api/suppliers` | Create | `SUPPLIER_CREATE` |
| `PUT` | `/api/suppliers/{id}` | Update | `SUPPLIER_UPDATE` |
| `DELETE` | `/api/suppliers/{id}` | Soft delete | `SUPPLIER_DELETE` |

### Purchases

| Method | Endpoint | Description | Permission |
|---|---|---|---|
| `GET` | `/api/purchases` | List orders | `PURCHASE_READ` |
| `POST` | `/api/purchases` | Create PO | `PURCHASE_CREATE` |
| `PUT` | `/api/purchases/{id}` | Update PO | `PURCHASE_UPDATE` |
| `POST` | `/api/purchases/{id}/approve` | Approve PO | `PURCHASE_APPROVE` |

### Dashboard

| Method | Endpoint | Description | Permission |
|---|---|---|---|
| `GET` | `/api/dashboard/kpis` | KPI summary cards | `DASHBOARD_VIEW` |
| `GET` | `/api/dashboard/inventory-trends` | 30-day trend data | `DASHBOARD_VIEW` |
| `GET` | `/api/dashboard/top-consumed` | Top 10 ingredients | `DASHBOARD_VIEW` |
| `GET` | `/api/dashboard/waste-analysis` | Waste breakdown | `DASHBOARD_VIEW` |
| `GET` | `/api/dashboard/low-stock-alerts` | Alert count | `DASHBOARD_VIEW` |

> Full Swagger UI available at: `http://localhost:8080/api/swagger-ui.html`

---

## Authentication & RBAC

### Token Flow

```
Login Request
    ↓
POST /api/auth/login
    ↓
{ accessToken (15min), refreshToken (7days) }
    ↓
Store in Zustand (persisted to localStorage)
    ↓
Axios interceptor → Authorization: Bearer <token>
    ↓
On 401 → auto-retry with refreshToken
    ↓
On refresh failure → logout + redirect to /login
```

### Roles & Permissions Matrix

| Permission | Super Admin | Kitchen Mgr | Store Mgr | Purchase Mgr | Chef | Inventory Staff | Auditor |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| USER_* | ✅ | Read | — | — | — | — | Read |
| INGREDIENT_* | ✅ | ✅ | Read | Read | Read | Read | Read |
| SUPPLIER_* | ✅ | Read | Read | ✅ | — | — | Read |
| PURCHASE_APPROVE | ✅ | ✅ | — | ✅ | — | — | — |
| INVENTORY_ADJUST | ✅ | ✅ | ✅ | — | — | ✅ | — |
| RECIPE_* | ✅ | ✅ | — | — | ✅ | — | Read |
| REPORT_EXPORT | ✅ | ✅ | — | — | — | — | ✅ |

---

## Getting Started

### Prerequisites

- **Java 21** — [Download](https://adoptium.net/)
- **Node.js 20+** — [Download](https://nodejs.org/)
- **PostgreSQL 16** — [Download](https://www.postgresql.org/download/)
- **Maven 3.9+** — [Download](https://maven.apache.org/)
- **Docker** (optional, for containerized setup)

### Local Development Setup

#### 1. Clone and configure

```bash
git clone <your-repo-url>
cd inventory-management-system

# Copy environment config
cp .env.example .env
# Edit .env with your database credentials and JWT secret
```

#### 2. Create the database

```sql
CREATE DATABASE kitchen_inventory;
CREATE USER kitchen_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE kitchen_inventory TO kitchen_user;
```

#### 3. Run the backend

```bash
cd inventory-backend

# Configure application.yml or set environment variables
export DB_USERNAME=kitchen_user
export DB_PASSWORD=your_password
export JWT_SECRET=your_64_char_secret_here

mvn spring-boot:run
```

Flyway migrations run automatically on startup.
Backend available at: `http://localhost:8080`
Swagger UI: `http://localhost:8080/api/swagger-ui.html`

#### 4. Run the frontend

```bash
cd inventory-frontend

npm install
npm run dev
```

Frontend available at: `http://localhost:5173`

#### 5. Default login

```
Username: admin
Password: Admin@123
```

> Update the BCrypt hash in `V2__seed_data.sql` before running migrations.

---

## Docker Deployment

### Quick Start (Full Stack)

```bash
# Copy and configure environment
cp .env.example .env

# Start all services (PostgreSQL + Backend + Frontend)
docker compose up -d

# With PgAdmin (development)
docker compose --profile dev up -d

# View logs
docker compose logs -f inventory-backend

# Stop all services
docker compose down
```

### Service URLs (Docker)

| Service | URL |
|---|---|
| Frontend | http://localhost:80 |
| Backend API | http://localhost:8081/api |
| Swagger UI | http://localhost:8081/api/swagger-ui.html |
| PgAdmin | http://localhost:5050 (dev profile) |
| PostgreSQL | localhost:5432 |

### Build images individually

```bash
# Backend
docker build -t kitchen-inventory-backend ./inventory-backend

# Frontend
docker build -t kitchen-inventory-frontend ./inventory-frontend
```

---

## CI/CD Pipeline

GitHub Actions workflow at [`.github/workflows/ci-cd.yml`](.github/workflows/ci-cd.yml):

```
Push to main / Pull Request
        ↓
┌───────────────────┐    ┌───────────────────┐
│  Backend Tests    │    │  Frontend Tests   │
│  (PostgreSQL svc) │    │  (TypeScript +    │
│  mvn test         │    │  Vite build)      │
└────────┬──────────┘    └────────┬──────────┘
         └──────────┬─────────────┘
                    ↓ (main branch only)
         ┌──────────────────────┐
         │  Build & Push Docker │
         │  images to GHCR      │
         └──────────┬───────────┘
                    ↓
         ┌──────────────────────┐
         │  Deploy via SSH      │
         │  docker compose pull │
         │  docker compose up   │
         └──────────────────────┘
```

### Required GitHub Secrets

| Secret | Description |
|---|---|
| `DEPLOY_HOST` | Production server IP / hostname |
| `DEPLOY_USER` | SSH username |
| `DEPLOY_SSH_KEY` | Private SSH key |

---

## Environment Variables

### Backend

| Variable | Default | Description |
|---|---|---|
| `DB_USERNAME` | `postgres` | Database username |
| `DB_PASSWORD` | `postgres` | Database password |
| `JWT_SECRET` | (required) | Min 64-char base64 secret |
| `CORS_ORIGINS` | `http://localhost:5173` | Allowed frontend origins |
| `MAIL_HOST` | `smtp.gmail.com` | SMTP server host |
| `MAIL_PORT` | `587` | SMTP server port |
| `MAIL_USERNAME` | — | SMTP username / email |
| `MAIL_PASSWORD` | — | SMTP password / app password |
| `FILE_UPLOAD_DIR` | `./uploads` | File storage directory |

### Frontend

| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | `/api` | Backend API base URL |

---

## Key Design Decisions

| Decision | Rationale |
|---|---|
| UUID primary keys | Globally unique, safe for distributed systems, no ID enumeration |
| Soft deletes | `is_active = false` preserves audit trail and referential integrity |
| FEFO strategy | Food industry standard — oldest expiry items consumed first reduces waste |
| Flyway migrations | Version-controlled, reproducible schema evolution |
| Optimistic locking | `@Version` field prevents lost-update concurrency issues |
| JWT stateless | No server-side session storage — scales horizontally |
| Refresh token rotation | New refresh token on every use prevents token replay attacks |
| Zustand for client state | Minimal boilerplate, persists auth to localStorage |
| React Query for server state | Automatic cache invalidation, background refetch, loading states |
| Lazy route loading | Code splitting — each page only loaded when navigated to |

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m "feat: add your feature"`
4. Push to branch: `git push origin feature/your-feature`
5. Open a Pull Request

### Commit Convention

```
feat:     New feature
fix:      Bug fix
docs:     Documentation change
style:    Formatting (no logic change)
refactor: Code restructure
test:     Add or update tests
chore:    Build, config, or tooling changes
```

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

## Support

For issues and feature requests, open a GitHub Issue with:
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, Java version, Node version)
