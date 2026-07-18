# Database Schema Documentation

## Quick Reference: Primary & Foreign Keys

| Table | Primary Key | Foreign Keys |
|-------|-------------|--------------|
| users | id | - |
| user_profiles | id → users.id | id (FK to users) |
| addresses | id | user_id → users.id |
| couriers | id | - |
| courier_zones | id | courier_id → couriers.id |
| deliveries | id | seller_id → users.id, courier_id → couriers.id, pickup_address_id → addresses.id, delivery_address_id → addresses.id, assigned_courier_runner → users.id |
| delivery_status_history | id | delivery_id → deliveries.id, updated_by → users.id |
| transactions | id | user_id → users.id, delivery_id → deliveries.id |
| billing_info | id | user_id → users.id |
| payment_methods | id | user_id → users.id |
| invoices | id | user_id → users.id |
| courier_earnings | id | courier_id → users.id, delivery_id → deliveries.id, transaction_id → transactions.id |
| support_tickets | id | user_id → users.id, delivery_id → deliveries.id, assigned_admin_id → users.id |
| ticket_messages | id | ticket_id → support_tickets.id, sender_id → users.id |
| user_api_keys | id | user_id → users.id |
| notifications | id | user_id → users.id, related_delivery_id → deliveries.id, related_ticket_id → support_tickets.id |
| audit_logs | id | admin_id → users.id |
| monthly_spending | id | user_id → users.id |

## Tables Overview

### 1. `users` - Core user accounts (all roles)
- **Primary Key**: `id` (UUID)
- **Unique Keys**: `email`
- **Indexes**: `role`, `created_at`

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | PK |
| email | VARCHAR(255) | User email, unique |
| name | VARCHAR(255) | Full name |
| phone | VARCHAR(50) | Optional phone |
| password_hash | TEXT | Hashed password (scrypt) |
| role | VARCHAR(20) | seller, runner, or admin |
| is_verified | BOOLEAN | Email verification status |

### 2. `user_profiles` - Extended user profile data
- **Primary Key**: `id` (PK, FK to users.id)
- **Relationship**: One-to-one with users

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | PK/FK to users |
| company_name | VARCHAR(255) | Business name |
| rating | DECIMAL(3,2) | Average rating |
| total_deliveries | INTEGER | Delivery count |

### 3. `addresses` - Normalized address storage
- **Primary Key**: `id` (UUID)
- **Foreign Key**: `user_id` → `users.id`

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | PK |
| user_id | UUID | FK to users |
| label | VARCHAR(100) | Address label |
| street, city, state, zip_code, country | VARCHAR | Address fields |
| latitude, longitude | DECIMAL | GPS coordinates |

### 4. `couriers` - Courier service providers
- **Primary Key**: `id` (UUID)
- **Unique Keys**: `name`, `code`

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | PK |
| name | VARCHAR(100) | Courier name |
| code | VARCHAR(50) | Unique code (fedex_ground, etc.) |
| api_endpoint | TEXT | API URL |
| is_enabled | BOOLEAN | Active status |

### 5. `courier_zones` - Rate zones per courier
- **Primary Key**: `id` (UUID)
- **Foreign Key**: `courier_id` → `couriers.id`
- **Unique**: `(courier_id, zone_code)`

### 6. `deliveries` - Main deliveries table
- **Primary Key**: `id` (UUID)
- **Foreign Keys**:
  - `seller_id` → `users.id`
  - `courier_id` → `couriers.id`
  - `pickup_address_id` → `addresses.id`
  - `delivery_address_id` → `addresses.id`
  - `assigned_courier_runner` → `users.id`

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | PK |
| delivery_number | VARCHAR(50) | Unique business ID |
| seller_id | UUID | FK - who created |
| assigned_courier_runner | UUID | FK - who delivers |
| customer_* | VARCHAR | Customer info |
| weight_kg, dimensions, description | Package details |
| price, payment_status, status | DECIMAL/VARCHAR | Financial & status |
| tracking_number | VARCHAR(100) | Unique tracking ID |

### 7. `delivery_status_history` - Delivery status audit trail
- **Primary Key**: `id` (UUID)
- **Foreign Key**: `delivery_id` → `deliveries.id`

### 8. `transactions` - Payment transactions
- **Primary Key**: `id` (UUID)
- **Foreign Keys**: `user_id`, `delivery_id` → `users.id`, `deliveries.id`

| Column | Type | Description |
|--------|------|-------------|
| type | VARCHAR(20) | payment, refund, payout |
| status | VARCHAR(20) | pending, completed, failed |
| stripe_payment_intent_id | VARCHAR(255) | Stripe reference |

### 9. `billing_info` - User billing summaries
- **Primary Key**: `id` (UUID)
- **Foreign Key**: `user_id` → `users.id`

### 10. `payment_methods` - Stored payment methods
- **Primary Key**: `id` (UUID)
- **Foreign Key**: `user_id` → `users.id`

### 11. `invoices` - Billing invoices
- **Primary Key**: `id` (UUID)
- **Foreign Key**: `user_id` → `users.id`

### 12. `courier_earnings` - Runner payouts tracking
- **Primary Key**: `id` (UUID)
- **Unique**: `delivery_id`
- **Foreign Keys**: `courier_id` → `users.id`, `transaction_id` → `transactions.id`

### 13. `support_tickets` - Customer support tickets
- **Primary Key**: `id` (UUID)
- **Foreign Keys**: `user_id`, `assigned_admin_id` → `users.id`

### 14. `ticket_messages` - Ticket replies
- **Primary Key**: `id` (UUID)
- **Foreign Key**: `ticket_id` → `support_tickets.id`, `sender_id` → `users.id`

### 15. `user_api_keys` - API authentication keys
- **Primary Key**: `id` (UUID)
- **Foreign Key**: `user_id` → `users.id`

### 16. `notifications` - In-app notifications
- **Primary Key**: `id` (UUID)
- **Foreign Key**: `user_id` → `users.id`

### 17. `audit_logs` - Admin action logging
- **Primary Key**: `id` (UUID)
- **Foreign Key**: `admin_id` → `users.id`

### 18. `monthly_spending` - Analytics aggregation
- **Primary Key**: `id` (UUID)
- **Unique**: `(user_id, year, month)`

---

## ER Diagram Relationships

```
users ──< user_profiles (1:1)
users ──< addresses (1:N)
users ──< deliveries (as seller) (1:N)
users ──< deliveries (as courier_runner) (1:N)
users ──< transactions (1:N)
users ──< payment_methods (1:N)
users ──< invoices (1:N)
users ──< courier_earnings (1:N)
users ──< support_tickets (as user) (1:N)
users ──< support_tickets (as admin) (1:N)
users ──< user_api_keys (1:N)
users ──< notifications (1:N)
users ──< audit_logs (1:N)

couriers ──< courier_zones (1:N)
couriers ──< deliveries (1:N)

deliveries ──< delivery_status_history (1:N)
deliveries ──< transactions (1:N, nullable)
deliveries ──< support_tickets (1:N, nullable)
deliveries ──< courier_earnings (1:1)

support_tickets ──< ticket_messages (1:N)
transactions ──< courier_earnings (1:N, nullable)
```

---

## Design Decisions

1. **UUID Primary Keys**: Using UUIDs for security (non-guessable IDs) and scalability
2. **Denormalized Customer Data**: Stored in deliveries table for historical accuracy
3. **Soft Deletes**: Using `is_active`/`is_verified` flags instead of deletion
4. **Status History**: Separate table for audit trail and timeline display
5. **JSONB Fields**: For flexible data like business hours and notification prefs
6. **Indexes**: On all foreign keys and commonly queried fields
7. **Composite Indexes**: For multi-column queries (seller+status, etc.)