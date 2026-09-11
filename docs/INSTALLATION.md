# MSC Installation Guide

## Requirements
- Node.js 24 LTS-compatible runtime
- MySQL 8+
- npm

## 1. Frontend demo
```bash
npm install
npm run dev
```
The browser demo is isolated and uses local browser storage. It is intended for evaluation and workflow demonstration.

## 2. Production API
```bash
cd server
npm install
cp .env.example .env
```
Create a MySQL database and update `DATABASE_URL`. Generate a long random `JWT_SECRET`. Set `CORS_ORIGIN` to the production frontend origin.

## 3. Database
```bash
npx prisma generate
npx prisma migrate dev --name init
```
For an existing production deployment use `npm run prisma:deploy` after migrations have been created and reviewed.

## 4. Bootstrap administrator
Set `INITIAL_ADMIN_PASSWORD` temporarily in the environment, then run:
```bash
npm run seed
```
The seed creates required locations and an `admin` account only when that environment variable is supplied. Remove the bootstrap password from the environment after initialization and change the account credentials.

## 5. Run API
```bash
npm run build
npm start
```
Health check: `/api/health`.

## Security notes
Never commit `.env`, database passwords, JWT secrets, or production credentials. Use HTTPS through a reverse proxy for network deployments. Restrict MySQL to trusted hosts. Back up the database before migrations. Demo browser data is not production data and should never be treated as an authoritative stock record.
