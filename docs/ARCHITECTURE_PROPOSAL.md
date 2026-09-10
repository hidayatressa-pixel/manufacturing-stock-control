# MSC Architecture Proposal

Status: **Awaiting owner approval**  
Implementation gate: **No production code before approval**

## 1. Executive decision

MSC should be a conventional, self-hosted modular monolith. The browser renders the interface, but every trusted operation—authentication, authorization, numbering, stock validation, posting, reversal, and audit logging—runs in the Node.js API against MySQL.

This architecture is intentionally simpler to install and maintain than microservices while still giving stock transactions a credible integrity boundary.

## 2. Smart Andon patterns reviewed

### Patterns to reuse

| Smart Andon pattern | MSC adaptation |
| --- | --- |
| Five-level role philosophy | PRODUCTION, WAREHOUSE, SUPERVISOR, MANAGER, ADMIN |
| Manager and Admin separation | Manager owns operational visibility; Admin owns system configuration |
| Immediate demo login | Five MSC demo accounts with realistic seeded transactions |
| Demo/production distinction | Physically separate MySQL databases and separate server connections |
| Central permission functions | Server-side policy module plus UI capability mapping |
| Configurable Master Data | Items, UOM, categories, BOM, reject reasons, users and numbering |
| CSV templates and preview | Download → upload → validate → preview → import |
| Branding/configuration | Company identity and safe UI settings stored in database |
| Activity Logs | Append-oriented audit trail for operational and administrative actions |
| Commercial first-run experience | Demo first, setup wizard, production initialization, admin creation |

### Patterns not to copy

- Andon calls, responder lifecycle, escalation levels, sounds, Telegram notifications, plant map, or line-call terminology.
- Firebase, Firestore subscriptions, or Firebase Security Rules.
- Production PIN verification in browser JavaScript.
- `localStorage` as a production database or authorization source.
- Admin role-preview as a security mechanism. A demo preview may alter presentation only; it can never grant API permission.
- Silent fallback from a failed production database operation into local/demo storage.

## 3. Proposed technology stack

| Layer | Proposal | Reason |
| --- | --- | --- |
| Frontend | React, TypeScript, Vite, Tailwind CSS | Familiar, open-source, fast, and easy for buyers to edit |
| Backend | Node.js, Express, TypeScript | Conventional REST server with a broad hosting ecosystem |
| Database | MySQL 8 | Buyer-owned relational storage with transactions and row locking |
| ORM | Prisma | Typed schema, migrations, transactions, and approachable developer experience |
| Validation | Zod shared request schemas | Consistent validation at API boundaries |
| Authentication | Server-issued access token plus rotating refresh token in HttpOnly cookie | Credentials and authorization remain server-side |
| Password/PIN hashing | Argon2id | Production credentials are never stored in plaintext |
| Spreadsheet | PapaParse client preview; SheetJS server export where needed | Controlled CSV/XLSX import and export |
| Testing | Vitest/Supertest and MySQL integration tests | Verify posting invariants, API policies, and rollback behavior |

No mandatory cloud service is required. Docker is an optional convenience, not a runtime dependency.

## 4. Repository structure

```text
manufacturing-stock-control/
├─ apps/
│  ├─ web/                 # React + Vite UI
│  └─ api/                 # Express REST API
├─ packages/
│  ├─ shared/              # DTOs, enums, Zod schemas, permission names
│  └─ config/              # Shared TypeScript/ESLint configuration
├─ prisma/
│  ├─ schema.prisma
│  ├─ migrations/
│  └─ seeds/
│     ├─ demo.ts
│     └─ production-bootstrap.ts
├─ docs/
├─ docker-compose.yml      # Optional local MySQL + application
├─ .env.example
├─ package.json
└─ README.md
```

The modular monolith keeps domain boundaries visible without imposing distributed-system complexity.

## 5. Runtime and data modes

### Demo Mode

- API starts with `APP_MODE=demo`.
- Connects only to `MSC_DEMO_DATABASE_URL`.
- Seed contains five demo users and a complete RM → WO → MI → PRD → FG genealogy.
- Demo reset is Admin-only, requires confirmation, and runs only against the demo database connection.
- Reset uses a transaction and a strict allowlist of demo tables.
- The demo database user should have no privileges on the production database.

### Production Mode

- API starts with `APP_MODE=production`.
- Connects only to `DATABASE_URL` built from standard MySQL configuration.
- Demo accounts are not seeded.
- The first administrator is created through a one-time setup flow protected by a single-use bootstrap token.
- Mode cannot be changed by a browser request; changing it requires server configuration and restart.

### Recommended isolation

Use two MySQL databases and two least-privilege database users:

```text
msc_demo        ← msc_demo_user
msc_production  ← msc_app_user
```

This prevents a defect in Demo Reset from deleting production records.

## 6. First-run buyer experience

1. Buyer installs dependencies or starts optional Docker Compose.
2. Application opens in Demo Mode by default.
3. Buyer logs in with one of five demo accounts.
4. Buyer explores the full seeded workflow.
5. Admin opens Setup Center and downloads the production checklist.
6. Buyer configures server-side MySQL values in `.env`.
7. Setup command tests the connection and verifies MySQL version/permissions.
8. Migrations run through an explicit CLI command, not arbitrary browser SQL.
9. Buyer creates the first production Admin with a one-time bootstrap token.
10. Server restarts in Production Mode and uses only production data.

The browser may display setup status, but it must never receive or store database passwords.

## 7. Domain modules

```text
Identity & Access
Master Data
Inventory & LOT
BOM
Production Order
Material Request
Material Issue
Production Result
Stock Opname
Traceability
Reports
Configuration
Audit
```

Each module owns its application service and repository. Cross-module stock changes go through one Stock Posting Service.

## 8. Proposed database model

### Identity and configuration

| Entity | Important fields |
| --- | --- |
| `users` | id, employee_id, name, password_hash, role, active, credential_version, timestamps |
| `refresh_tokens` | token_hash, user_id, expires_at, revoked_at, replacement_id |
| `company_settings` | company_name, logo_path, language, theme, active_mode_display |
| `number_sequences` | document_type, prefix, business_date, last_number, version |
| `activity_logs` | actor_id, action, entity_type, entity_id, reference_no, metadata_json, occurred_at |

Roles are fixed V1 domain roles. Permissions are centralized in code and exposed to the UI as capabilities. Avoid a configurable permission editor in V1 because it increases authorization risk.

### Master data

| Entity | Important fields |
| --- | --- |
| `categories` | code, name, active |
| `uoms` | code, name, decimal_precision, active |
| `items` | sku, name, description, type, category_id, uom_id, minimum_stock, barcode, active |
| `reject_reasons` | code, name, active |
| `locations` | code, name, type, active |
| `bom_headers` | parent_item_id, version, base_quantity, status, effective dates |
| `bom_lines` | bom_id, component_item_id, quantity, uom_id, scrap_factor optional |

### Production and material flow

| Entity | Important fields |
| --- | --- |
| `production_orders` | wo_no, product_id, bom_id, target_qty, production_date, due_date, status |
| `production_order_requirements` | wo_id, component_id, required_qty, requested_qty, issued_qty |
| `material_requests` | mr_no, wo_id, status, requester_id, requested_at |
| `material_request_lines` | mr_id, requirement_id, item_id, requested_qty, issued_qty |
| `material_issues` | mi_no, mr_id, wo_id, status, warehouse_user_id, posted_at |
| `material_issue_lines` | mi_id, mr_line_id, item_id, lot_id, location_id, issued_qty |
| `production_results` | prd_no, wo_id, reported_qty, good_qty, reject_qty, fg_lot_id, status, timestamps |
| `production_rejects` | result_id, reject_reason_id, quantity, notes |
| `actual_consumptions` | result_id, item_id, lot_id, consumed_qty, source_issue_line_id |

### Inventory and auditability

| Entity | Important fields |
| --- | --- |
| `lots` | lot_no, item_id, source_type, source_id, manufactured_at, received_at, expiry_at, status |
| `inventory_documents` | document_no, type, external_reference, status, posted_at, reversal_of_id |
| `inventory_document_lines` | document_id, item_id, lot_id, location_id, quantity, reason |
| `stock_ledger` | transaction_no, line_no, item_id, lot_id, location_id, direction, quantity, reference_type, reference_id, actor_id, occurred_at, reversal_of_id, idempotency_key |
| `stock_balances` | item_id, lot_id, location_id, on_hand_qty, reserved_qty, version |
| `stock_opnames` | sto_no, status, snapshot_at, posted_at, actor ids |
| `stock_opname_lines` | sto_id, item_id, lot_id, location_id, system_qty, actual_qty, gap_qty, adjustment_id |

`stock_ledger` is the historical source of truth. `stock_balances` is a transactionally maintained projection used for fast availability checks; it is never editable through generic CRUD.

## 9. LOT genealogy

Backward and forward traceability are resolved through persisted document relationships:

```text
RM LOT
  → material_issue_line
  → material_issue / material_request
  → production_order
  → production_result
  → FG LOT
```

`actual_consumptions` provides an explicit bridge when actual consumption differs from issued quantity. No genealogy is inferred only from dates or item codes.

## 10. Stock transaction model

### Allowed stock-affecting events

| Event | Direction | Required reference |
| --- | --- | --- |
| Opening Balance | IN | Posted inventory document |
| Receiving | IN | RCV document and external reference where available |
| Material Issue | OUT | MI → MR → WO |
| Material Return | IN | RTN → original MI/WO |
| Finished Goods Receipt | IN | PRD → WO and FG LOT |
| Controlled Adjustment | IN/OUT | ADJ with reason and authority |
| Stock Opname Adjustment | IN/OUT | ADJ → STO |
| Reversal | Opposite | Original posted transaction |

### Posting algorithm

Every stock-affecting command uses one database transaction:

1. Authenticate actor and authorize action.
2. Validate document state and immutable totals.
3. Acquire the collision-safe document number.
4. Check idempotency key and reject/replay duplicates safely.
5. Lock affected `stock_balances` rows with `SELECT … FOR UPDATE` in stable key order.
6. Verify item/LOT/location compatibility and available quantity.
7. Reject negative stock unless a future approved policy explicitly permits it.
8. Insert immutable ledger rows.
9. Update the balance projection.
10. Update document/requirement status.
11. Append an activity log.
12. Commit everything or roll back everything.

Posted documents cannot be edited or deleted. Corrections create reversal and replacement transactions linked to the original.

## 11. Collision-safe numbering

`number_sequences` has a unique key on `(document_type, business_date)`. Number allocation occurs inside a database transaction with a row lock. The number is formatted after increment:

```text
MI-20260911-0001
```

The unique document-number constraint remains the final collision guard. Gaps are acceptable after rollback; uniqueness and auditability matter more than gapless numbering.

## 12. Role-permission matrix

Legend: `O` operate, `V` view, `A` administer, `—` denied.

| Capability | Production | Warehouse | Supervisor | Manager | Admin |
| --- | :---: | :---: | :---: | :---: | :---: |
| Role dashboard | V | V | V | V | V |
| Released WO / requirements | V | V | V | V | V |
| Create Material Request | O | — | O | — | O |
| Receiving / Opening Balance | — | O | V | V | O |
| Material Issue / Return | — | O | V | V | O |
| Record Production Result | O | — | V | V | O |
| Inventory / Stock Movement | Limited V | O | V | V | O |
| Traceability | Relevant V | V | V | V | O |
| Stock Opname count | — | O | O | V | O |
| Post Stock Opname adjustment | — | — | O | O | O |
| Operational reports | Relevant V | Relevant V | V | V | V |
| Master Data / BOM | — | — | V | V | A |
| Users / roles / branding | — | — | — | — | A |
| Numbering / setup status | — | — | — | — | A |
| Demo reset | — | — | — | — | A, Demo only |
| Activity-log administration | — | — | — | V | A |

Open decision for approval: whether SUPERVISOR or MANAGER may post negative Stock Opname adjustments. The proposal allows both, while ADMIN retains override capability.

## 13. Screen and navigation proposal

### Shared

- Login and mode indicator
- Role-adaptive Dashboard
- Notifications/validation feedback
- My Profile and logout

### Operations

- Inventory Overview
- Receiving & Returns
- Stock Ledger
- LOT Inventory
- Production Orders
- Material Requests
- Material Issues
- Production Results
- Stock Opname
- LOT Traceability
- Reports

### Administration

- Item Master
- BOM Manager
- Categories and UOM
- Reject Reasons
- Users
- Company & Branding
- Transaction Numbering
- Setup Center
- Activity Logs

The first viewport should prioritize current operational work, not marketing content.

## 14. REST API boundaries

```text
/api/auth/*
/api/dashboard/*
/api/master-data/*
/api/inventory/*
/api/lots/*
/api/boms/*
/api/production-orders/*
/api/material-requests/*
/api/material-issues/*
/api/production-results/*
/api/stock-opnames/*
/api/traceability/*
/api/reports/*
/api/admin/*
/api/audit-logs/*
```

Posting actions use explicit command endpoints such as `/material-issues/:id/post`; generic PATCH endpoints may edit only DRAFT documents.

## 15. Security risks and controls

| Risk | Required control |
| --- | --- |
| Client changes its role | Server derives role from authenticated user record on every request |
| Demo PINs used in production | Demo users exist only in demo database; production seed excludes them |
| Database credentials leaked | Server-only environment variables; never returned by API |
| IDOR / cross-document access | Server authorizes every referenced object and permitted scope |
| Duplicate form submission | Unique idempotency key and posted-state check |
| Brute-force login | Rate limiting, lockout/backoff, hashed credentials and generic errors |
| Stolen refresh token | HttpOnly/Secure/SameSite cookie, hashed token storage and rotation |
| CSV formula injection | Escape spreadsheet formula prefixes on export; validate imports |
| Malicious CSV / oversized upload | MIME/size/row limits, schema validation, preview before import |
| Audit erasure | Append-only application permissions; no operational delete endpoint |
| Unsafe setup endpoint | One-time bootstrap token, localhost/default restriction, disable after init |
| XSS and unsafe logo upload | React escaping, content restrictions, server-side upload validation |

## 16. Data-integrity risks and controls

| Risk | Required control |
| --- | --- |
| Ledger and balance disagree | Same DB transaction; periodic reconciliation report |
| Concurrent issue oversells a LOT | Row lock plus negative-stock constraint in service |
| Partial Material Issue | Header, lines, ledger, balances and MR totals in one transaction |
| Partial Production Result | Result, reject rows, FG LOT, ledger and WO totals in one transaction |
| Wrong UOM arithmetic | Fixed item stock UOM; conversion is out of V1 unless explicitly approved |
| Floating-point drift | MySQL `DECIMAL`, never JS floating point for persisted quantities |
| Posted document edited | State guard; reversal/correction only |
| Orphan genealogy | Foreign keys and posting-time relationship validation |
| Demo reset touches production | Separate DB, separate user, server-side mode and reset allowlist |
| Sequence collision | Transactional row lock plus unique constraint |

## 17. Explicit V1 boundaries

- One company and one plant context.
- Optional multiple warehouse locations, but no multi-factory architecture.
- One stock UOM per item. UOM conversion is excluded unless approved separately.
- No reservations beyond Material Request/requirement quantities in V1.
- No purchasing, sales, finance, advanced MRP, scheduling, OEE, TPM, Andon, IoT, AI, or billing.

## 18. Proposed delivery milestones after approval

1. **Foundation:** monorepo, environment validation, MySQL, migration pipeline, health checks.
2. **Identity:** Demo/Production isolation, login, RBAC, bootstrap Admin, audit foundation.
3. **Master Data:** items, UOM, categories, reject reasons, CSV workflow, branding.
4. **Inventory:** LOTs, receiving, returns, ledger, balance projection, reversals.
5. **BOM and WO:** BOM versions, release rules, calculated material requirements.
6. **MR and MI:** partial issue, LOT selection, atomic OUT posting, returns.
7. **Production Result:** GOOD/REJECT, FG LOT, atomic IN posting, consumption links.
8. **Traceability:** forward/backward genealogy and searchable visual flow.
9. **Stock Opname and Reports:** frozen snapshot, controlled ADJ, filters and exports.
10. **Commercial hardening:** tests, seed, installation guide, security review, license and packaging.

Every milestone must pass lint, tests, production build, migration review, and a scope check before being committed.

## 19. Decisions requested from owner

Please approve or change these points before implementation:

1. Use MySQL for both Demo and Production, separated into two databases.
2. Use Prisma as ORM.
3. Use server-side access tokens plus rotating HttpOnly refresh tokens.
4. Keep roles fixed in V1 rather than providing a custom permission editor.
5. Allow SUPERVISOR and MANAGER to post Stock Opname adjustments.
6. Include optional warehouse/location master in V1.
7. Keep one stock UOM per item and exclude UOM conversion from V1.

No production implementation will begin until these architecture decisions are approved.
