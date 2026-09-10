# Manufacturing Stock Control — Mini ERP

MSC is a self-hosted manufacturing stock and production-control system. Its core rule is simple: **stock is never edited directly; every movement is posted from a valid document into an auditable ledger.**

## Current implementation — v1.0.0

- React + TypeScript + Vite operational interface.
- Five Demo Mode roles with role-specific navigation.
- Admin Item Master create/edit workflow.
- Interactive Dashboard, Item Master, Inventory, BOM, WO, MR, partial MI, Production Result, LOT Traceability, Stock Opname, Reports, Configuration, and Audit Log demo workflows.
- Express REST API with JWT authentication and centralized capability authorization.
- MySQL/Prisma relational schema plus committed initial SQL migration and repeatable demo seed.
- Isolated Demo and Production database configuration.
- Central Stock Posting Service with serializable transactions, idempotency, negative-stock protection, daily document numbering, and referenced reversals.
- CSV exports, responsive layouts, and GitHub Pages deployment for the standalone Demo Mode UI.

## Demo accounts

| Role | ID | PIN |
| --- | --- | --- |
| Production | `PROD-1001` | `1234` |
| Warehouse | `WH-2001` | `2345` |
| Supervisor | `SPV-3001` | `3456` |
| Manager | `MGR-4001` | `4567` |
| Admin | `admin01` | `8888` |

Demo authentication is intentionally evaluation-only and uses browser-persisted demo data. Production Mode authenticates through the API and stores Argon2id password hashes in MySQL. Demo and Production data never share a database.

## Local review

```bash
cp .env.example .env
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
npm run build
npm run dev
```

Use `docker compose up -d mysql` to start the optional local MySQL service. The static Demo Mode frontend does not require a database; Production API operations do.

## API workflow surface

Authenticated endpoints cover master data, inventory documents and ledger, BOMs, WO create/release, material requests, partial material issues, production results and rejects, LOT traceability, stock opname posting, referenced reversal, reports, activity logs, users, and system settings. See [docs/AUDIT_REPORT.md](docs/AUDIT_REPORT.md) for the role and control audit.

## Security boundary

- Database credentials are server-only.
- The server selects Demo or Production mode at startup.
- Manager is the highest operational role but is not a system administrator.
- Posted stock history is corrected through reversals, not edited or deleted.
- Direct Item deletion is rejected when ledger history exists.
- Production mode requires a MySQL connection, non-default JWT secrets, and HTTPS at the reverse proxy.
