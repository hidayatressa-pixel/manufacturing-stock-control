# Manufacturing Stock Control (MSC)

**Production Order, Material Flow & LOT Traceability**

Manufacturing Stock Control is a focused, self-hosted manufacturing transaction system for controlling material movement from Production Order release through Warehouse, Production and Finished Goods receiving.

> Every Stock Movement Is Traceable.

## Core workflow

`PPC Production Order → Warehouse Material Request → RM LOT Selection → Material Transfer → Production Receive → GOOD / REJECT → FG LOT → FG Transfer → Delivery Receive`

MSC is built around connected business documents instead of disconnected CRUD screens. Operational stock is never intended to be changed silently: movements are linked to source documents, LOT, location, actor and time.

## Included features

- Production Order creation and release with PRO/Line → FG filtering.
- BOM revision master and immutable BOM requirement snapshot on Production Order.
- Material Request generated from a released Production Order.
- Warehouse RM LOT selection with available-stock validation.
- Warehouse → Production material transfer and receiving.
- Production GOOD / REJECT reporting with reject reason control.
- Production material consumption and Finished Goods LOT creation.
- Production → Delivery Finished Goods transfer and receiving.
- Inventory by Item + LOT + Location.
- Stock Ledger and LOT genealogy.
- Item, PRO/Line and BOM master data.
- BOM CSV template/import in Demo Mode.
- Role model for PPC, Warehouse, Production, Delivery, Supervisor, Manager and Admin.
- Audit trail for production API business events.
- Browser Demo Mode for evaluation without a database.
- Self-hosted Production API using Express, Prisma and MySQL.

## Demo Mode vs Production Mode

**Demo Mode** runs entirely in the browser using isolated local storage. It is intended for evaluation, training and workflow demonstration. Reset Demo affects demo data only.

**Production Mode** uses the included REST API and MySQL database. Authentication, role authorization, transactional stock posting, stock validation, audit history and persistent manufacturing records are handled server-side. Demo data is not production data.

## Technology

Frontend: React + TypeScript + Vite  
Production API: Node.js + Express + TypeScript  
Database: MySQL 8+  
ORM: Prisma  
Authentication: JWT + bcrypt password hashing

No proprietary hosted application platform is required for the core system. Buyers control the source code, database, credentials and deployment environment.

## Transaction integrity

- No Material Request without a released Production Order.
- No material transfer without a Material Request.
- No Production Result until material transfer is received.
- No Finished Goods LOT without a Production Result.
- No Delivery receive without a Finished Goods transfer.
- Negative stock is rejected during protected production transactions.
- Duplicate Material Requests, transfers and Production Results are blocked.
- GOOD + REJECT must equal the Production Order target.
- Reject reason is required when reject quantity is greater than zero.
- Production Order stores its material requirement snapshot so later BOM changes do not rewrite transaction history.

## Roles

| Role | Primary responsibility |
| --- | --- |
| PPC | Create and release Production Orders |
| WAREHOUSE | Material Request, RM LOT preparation and material transfer |
| PRODUCTION | Receive material and post production result |
| DELIVERY | Receive Finished Goods transfer |
| SUPERVISOR | Operational monitoring and audit visibility |
| MANAGER | Management visibility |
| ADMIN | System administration and authorized setup |

Role authorization for protected production endpoints is enforced by the API; it is not only a UI convention.

## Quick start

For the browser demo:

```bash
npm install
npm run dev
```

For a buyer-controlled production installation, follow [`docs/INSTALLATION.md`](docs/INSTALLATION.md).

## Build verification

The repository CI validates the frontend build, Prisma schema, Prisma Client generation and production API TypeScript build before GitHub Pages deployment.

```bash
npm run build
cd server
npm install
npm run prisma:validate
npm run prisma:generate
npm run build
```

## Production notes

Use HTTPS for network deployment, keep MySQL on trusted hosts, use a strong unique JWT secret, change bootstrap credentials immediately, back up the database, and test restoration before relying on the system for operational records. The included browser demo must not be used as the authoritative production stock database.

## Scope

MSC intentionally focuses on manufacturing stock control, material flow and LOT traceability. Full accounting, HR/payroll, advanced MRP/capacity scheduling, OEE, TPM, Andon and PLC/IoT control are outside the v1.0 scope.
