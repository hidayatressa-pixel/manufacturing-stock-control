# Manufacturing Stock Control — Mini ERP

MSC is a self-hosted manufacturing stock and production-control system. Its core rule is simple: **stock is never edited directly; every movement is posted from a valid document into an auditable ledger.**

## Current implementation — v0.1.0

- React + TypeScript + Vite operational interface.
- Five Demo Mode roles with role-specific navigation.
- Admin Item Master create/edit workflow.
- Dashboard, Production Order, Inventory, BOM, MR, MI, Production Result, LOT Traceability, Stock Opname, Reports, Configuration, and Audit structures.
- Express REST API foundation with centralized authorization.
- MySQL/Prisma relational schema.
- Isolated Demo and Production database configuration.
- Stock Posting Service boundary with idempotency and negative-stock protection.

This is the reviewable foundation slice. Stock-affecting modules beyond Item Master remain explicit workflow shells until their atomic posting services are implemented and tested.

## Demo accounts

| Role | ID | PIN |
| --- | --- | --- |
| Production | `PROD-1001` | `1234` |
| Warehouse | `WH-2001` | `2345` |
| Supervisor | `SPV-3001` | `3456` |
| Manager | `MGR-4001` | `4567` |
| Admin | `admin01` | `8888` |

Demo authentication in the current UI is intentionally evaluation-only. Production credentials will be verified by the API and stored as Argon2id hashes.

## Local review

```bash
cp .env.example .env
npm install
npm run db:generate
npm run build
npm run dev
```

Use `docker compose up -d mysql` to start the optional local MySQL service. The frontend review build does not require a database connection; API data operations do.

## Security boundary

- Database credentials are server-only.
- The server selects Demo or Production mode at startup.
- Manager is the highest operational role but is not a system administrator.
- Posted stock history is corrected through reversals, not edited or deleted.
- Direct Item deletion is rejected when ledger history exists.

