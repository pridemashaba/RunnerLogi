# Neon DB Integration Testing Plan

## Overview
This plan covers testing the Neon PostgreSQL database integration with the Next.js application via API routes.

## Prerequisites
1. Neon DB project created and connection string available
2. `NEON_DATABASE_URL` set in `.env.local`
3. Database schema executed against Neon instance (`docs/database-schema.sql`)
4. Dev server running (`npm run dev`)

## 1. Environment & Connectivity Tests

| ID | Test | Steps | Expected |
|----|------|-------|----------|
| ENV-01 | Verify env var loading | Check `process.env.NEON_DATABASE_URL` in `lib/db.ts` | Throws error if missing |
| ENV-02 | Connection pool init | Start Next.js dev server | No connection errors in console |
| ENV-03 | Neon console connectivity | Run `SELECT 1` via Neon SQL editor | Returns `1` |

## 2. API Route Unit Tests

### `GET /api/deliveries`
| ID | Test | Input | Expected |
|----|------|-------|----------|
| API-01 | List all deliveries | `GET /api/deliveries` | 200, `[]` or array of objects |
| API-02 | Filter by status | `GET /api/deliveries?status=pending` | 200, filtered results |
| API-03 | Filter by seller | `GET /api/deliveries?seller_id=<uuid>` | 200, filtered results |

### `POST /api/deliveries`
| ID | Test | Input | Expected |
|----|------|-------|----------|
| API-04 | Create delivery | Valid body | 201, created object with UUID |
| API-05 | Missing required field | No `customer_name` | 400, validation error |
| API-06 | Invalid weight type | `weight_kg: "abc"` | 500 or 400 |

### `GET /api/deliveries/[id]`
| ID | Test | Input | Expected |
|----|------|-------|----------|
| API-07 | Fetch existing | Valid UUID | 200, full delivery object |
| API-08 | Fetch non-existent | Random UUID | 404 |

### `PUT /api/deliveries/[id]`
| ID | Test | Input | Expected |
|----|------|-------|----------|
| API-09 | Update status | `{ status: "delivered" }` | 200, updated object |
| API-10 | Update tracking | `{ tracking_number: "TRK123" }` | 200, updated object |
| API-11 | Update non-existent | Random UUID | 404 |

### `DELETE /api/deliveries/[id]`
| ID | Test | Input | Expected |
|----|------|-------|----------|
| API-12 | Delete existing | Valid UUID | 200, `{ success: true }` |
| API-13 | Delete non-existent | Random UUID | 404 |

## 3. Database Query Tests

| ID | Test | Steps | Expected |
|----|------|-------|----------|
| DB-01 | Insert and read back | Create delivery, then `getAllDeliveries()` | New row present |
| DB-02 | UUID format | Check `id` field of created row | Valid UUID v4 |
| DB-03 | Timestamps | Check `created_at` and `updated_at` | ISO 8601 strings |
| DB-04 | Default values | Insert without `status` | `status` = `pending` |
| DB-05 | Foreign key constraint | Insert invalid `seller_id` | Error thrown |

## 4. Integration Tests (Frontend + API + DB)

| ID | Test | Steps | Expected |
|----|------|-------|----------|
| INT-01 | Create via form | Submit `DeliveryForm` | Row appears in DB, UI updates |
| INT-02 | Status update via UI | Click "Mark Delivered" | DB updated, list refreshed |
| INT-03 | Filter deliveries | Use status filter | API filters correctly, UI shows subset |
| INT-04 | Error handling | Disconnect Neon, call API | 500 error, user sees fallback |

## 5. Load & Performance Tests

| ID | Test | Steps | Expected |
|----|------|-------|----------|
| PERF-01 | 100 concurrent reads | `GET /api/deliveries` x100 | All 200, < 2s total |
| PERF-02 | 50 concurrent creates | `POST /api/deliveries` x50 | All 201, no connection errors |
| PERF-03 | Connection pool stability | Long-running dev server | No connection timeout errors |

## 6. Security Tests

| ID | Test | Steps | Expected |
|----|------|-------|----------|
| SEC-01 | SQL injection | Send `' OR 1=1 --` in `customer_name` | Safe parameterized query, no leak |
| SEC-02 | Missing auth header | Call API without token | 401 or pass-through (depending on route) |
| SEC-03 | CORS | Call from different origin | CORS headers present |

## 7. Rollback & Recovery Tests

| ID | Test | Steps | Expected |
|----|------|-------|----------|
| ROLL-01 | Delete then recreate | Delete delivery, create with same data | New UUID generated |
| ROLL-02 | Neon branch reset | Reset Neon branch to empty | Schema can be reapplied, app still connects |

## Test Execution Commands

```bash
# Install dependencies
npm install

# Set Neon connection string in .env.local
# NEON_DATABASE_URL=postgresql://...

# Run dev server
npm run dev

# Run database migration
# Execute docs/database-schema.sql in Neon SQL editor

# Manual API tests (using curl)
curl http://localhost:3000/api/deliveries
curl -X POST http://localhost:3000/api/deliveries -H "Content-Type: application/json" -d "{\"seller_id\":\"test\",\"customer_name\":\"Test\",\"customer_email\":\"test@test.com\",\"customer_phone\":\"123\",\"weight_kg\":1,\"price\":10}"
```

## Recommended Tools
- **Postman / Thunder Client** for manual API testing
- **Jest / Vitest** for automated unit tests (future)
- **k6 / Artillery** for load testing (future)
- **Neon SQL Editor** for direct DB verification
