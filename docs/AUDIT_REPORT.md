# MSC v1.0 — UI, Role, and Transaction Audit

Audit date: 10 September 2026

## Result

The approved UI direction and five-role structure are preserved. All navigation destinations now render an operational view; no Vinext, Firebase, Sites runtime, or mandatory SaaS dependency is present.

## Role matrix

| Capability | Production | Warehouse | Supervisor | Manager | Admin |
| --- | --- | --- | --- | --- | --- |
| View items/inventory/LOT | Yes | Yes | Yes | Yes | Yes |
| Execute production / results | Yes | No | No | No | Yes |
| Request material | Yes | No | Yes | No | Yes |
| Receive / issue stock | No | Yes | No | No | Yes |
| Count opname | No | Yes | Yes | No | Yes |
| Post opname / reversal | No | No | Yes | Yes | Yes |
| Reports and audit | No | No | Yes | Yes | Yes |
| Items, BOM, users, settings | No | No | No | No | Yes |

Manager remains operational authority and cannot manage users or configuration. Admin owns system configuration. The frontend hides unauthorized modules while the API independently enforces every capability.

## Stock-control checks

| Control | Status | Implementation |
| --- | --- | --- |
| Direct stock editing blocked | PASS | Only the Stock Posting Service updates balances and creates ledger rows. |
| Negative stock prevented | PASS | OUT posting rejects a resulting balance below zero. |
| Idempotent posting | PASS | Unique per-line idempotency keys and duplicate detection. |
| Atomic documents | PASS | Header, lines, balance, ledger, status, and audit execute in serializable transactions. |
| Partial issue | PASS | Requested, issued, and remaining values update per MR line and WO requirement. |
| GOOD / REJECT validation | PASS | GOOD + REJECT must equal reported quantity; reject details must total REJECT. |
| FG LOT creation | PASS | Posted GOOD result creates/reuses a product LOT and posts usable FG stock only. |
| Opname adjustment | PASS | Frozen system quantity, actual count, GAP, and referenced ADJ transaction. |
| Posted-history correction | PASS | Reversal posts opposite ledger entries referencing original rows; no ledger deletion. |
| Traceability | PASS | LOT query returns item, movements, actor, location, and linked references. |

## Verification

- Frontend TypeScript and Vite production build: PASS.
- Backend TypeScript build: PASS.
- Prisma schema validation: PASS.
- Prisma Client generation: PASS.
- Initial MySQL migration generation: PASS.

Database integration requires a running MySQL instance and environment secrets; those are intentionally not embedded in the repository.
