# MSC v1.0 Installation & Deployment Guide

## Requirements

- Node.js 24 LTS-compatible runtime
- MySQL 8+
- npm
- Reverse proxy with HTTPS for network/Internet deployment (recommended)

## 1. Browser Demo Mode

From the repository root:

```bash
npm install
npm run dev
```

Demo Mode uses isolated browser local storage and is intended for evaluation/training. It does not require MySQL and must not be used as the authoritative production stock database.

## 2. Prepare the Production API

```bash
cd server
npm install
cp .env.example .env
```

On Windows PowerShell, copy the file with:

```powershell
Copy-Item .env.example .env
```

Create an empty MySQL database, then configure `.env`.

Important production values:

- `DATABASE_URL`: buyer-controlled MySQL connection string.
- `JWT_SECRET`: long random secret, minimum 24 characters; use substantially longer in production.
- `CORS_ORIGIN`: exact frontend origin(s) allowed to call the API.
- `PORT`: API listening port.
- `INITIAL_ADMIN_PASSWORD`: temporary bootstrap value only.

Never commit `.env`.

## 3. Database initialization

For first development/setup initialization:

```bash
npx prisma generate
npx prisma migrate dev --name init
```

For an existing production installation, deploy reviewed migrations instead of using development migration commands:

```bash
npm run prisma:deploy
```

Before applying a production migration, create and verify a database backup.

## 4. Bootstrap administrator and locations

Set a strong temporary `INITIAL_ADMIN_PASSWORD`, then run:

```bash
npm run seed
```

The seed initializes required manufacturing locations and creates the bootstrap administrator only when the environment variable is supplied. Remove `INITIAL_ADMIN_PASSWORD` from the runtime environment immediately after initialization and replace/bootstrap credentials according to the buyer's access policy.

Demo credentials are not production credentials and must never be copied into a production database.

## 5. Validate before start

```bash
npm run prisma:validate
npm run prisma:generate
npm run build
```

Then start the compiled API:

```bash
npm start
```

Health endpoint:

`/api/health`

A healthy v1 API returns an `ok` response and service/version information.

## 6. Reverse proxy / HTTPS

For LAN-only use, bind the service according to the buyer's network policy and firewall rules. For access across untrusted networks, terminate TLS with a maintained reverse proxy such as Nginx, Caddy or an equivalent platform.

Do not expose MySQL directly to the public Internet. Allow database access only from trusted application hosts and administration endpoints.

## 7. Backup and restore policy

A production buyer should establish a scheduled MySQL backup policy before go-live. At minimum:

1. Back up the database before migrations or major configuration changes.
2. Keep more than one historical backup.
3. Store at least one backup separately from the application host.
4. Periodically restore a backup into a non-production database to verify that recovery actually works.

Application source backup does not replace database backup; transaction history lives in MySQL.

## 8. Production verification checklist

Before operational use, verify:

- MySQL connection uses the intended production database.
- JWT secret is unique and not a sample value.
- Bootstrap password has been removed from the environment.
- CORS allows only intended frontend origins.
- HTTPS/firewall rules match the deployment environment.
- Required locations exist.
- Role accounts follow least privilege.
- Item, PRO/Line and BOM master data have been reviewed.
- A complete test PO has successfully travelled through Warehouse → Production → Delivery.
- Stock Ledger and LOT genealogy match that test transaction.
- Backup and restore have been tested.

## Security boundaries

MSC applies authentication and role authorization to protected production API routes, validates business payloads, and posts protected manufacturing stock changes through database transactions. Deployment security still depends on the buyer's server, network, operating system, MySQL configuration, secret management, backups and update practices.

Do not store database passwords, JWT secrets or production credentials in source control. Do not use Demo Mode/localStorage as a production stock ledger.

## Updating MSC

Before updating source code in an operational installation:

1. Back up MySQL.
2. Review release changes and database migrations.
3. Test the update against a staging/non-production copy.
4. Run Prisma validation and application builds.
5. Deploy migrations and application code during a controlled maintenance window.
6. Verify login, one representative transaction flow, Inventory, Ledger and LOT Traceability.
