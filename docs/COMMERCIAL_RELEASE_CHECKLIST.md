# MSC v1.0 Commercial Release Acceptance

This checklist defines the minimum acceptance gate for a source-code release. It is intentionally focused on the existing MSC scope and must not be used to expand MSC into a full ERP.

## Build gate

- [ ] Frontend TypeScript/Vite build passes.
- [ ] Prisma schema validation passes.
- [ ] Prisma Client generation passes.
- [ ] Production API TypeScript build passes.
- [ ] GitHub Pages demo deployment passes.

## Demo gate

- [ ] Demo opens without MySQL/API configuration.
- [ ] Reset Demo affects demo data only.
- [ ] Line selection filters eligible Finished Goods.
- [ ] Production Order snapshots active BOM requirements.
- [ ] Multiple Production Orders can be selected independently.
- [ ] Warehouse LOT selection reflects available stock.
- [ ] Production GOOD/REJECT validation works.
- [ ] Inventory by Item + LOT + Location is understandable.
- [ ] LOT genealogy can be demonstrated from RM to FG/Delivery.

## Production transaction gate

Test using a disposable production/staging MySQL database.

- [ ] Authentication rejects invalid credentials.
- [ ] Wrong role receives HTTP 403 on protected business actions.
- [ ] PPC can create and release a Production Order.
- [ ] Warehouse cannot create an MR from a non-released PO.
- [ ] Warehouse can create exactly one MR for a released PO.
- [ ] Material transfer rejects a missing/invalid/insufficient RM LOT.
- [ ] Successful material posting reduces WH-RM stock.
- [ ] Production receive creates PROD-STAGING stock and cannot be posted twice.
- [ ] Production Result is blocked before material receive.
- [ ] GOOD + REJECT mismatch is rejected.
- [ ] Reject > 0 without a reason is rejected.
- [ ] Production consumption reduces staged RM stock.
- [ ] GOOD quantity creates FG LOT/PROD-FG stock; reject does not create usable FG.
- [ ] Duplicate Production Result is rejected.
- [ ] Delivery receive reduces PROD-FG and increases DELIVERY stock.
- [ ] Duplicate Delivery receive is rejected.
- [ ] Stock Ledger entries retain source reference, item, LOT, location, direction, quantity and actor.
- [ ] Audit events identify the actor and source business document.
- [ ] No tested protected transaction can create negative stock.

## Buyer package gate

- [ ] `.env.example` contains placeholders only.
- [ ] No production password, JWT secret or database credential is committed.
- [ ] README describes the product rather than development history.
- [ ] Installation guide covers Windows/Linux-neutral setup, database initialization and production start.
- [ ] Installation guide clearly separates Demo Mode from Production Mode.
- [ ] Backup/restore responsibility is documented.
- [ ] Production go-live checklist is documented.
- [ ] Buyer can identify required runtime, database and deployment responsibilities before purchase/deployment.

## Release decision

Mark the release **SELLABLE** only after every Build gate item passes and all Production transaction gate items have been exercised against a disposable MySQL database. A green compile/build pipeline proves that the source builds; it does not by itself prove transaction behavior against a live database.
